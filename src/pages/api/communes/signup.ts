import { findOrganizationsWithStructures } from "@/lib/db"; // Assuming this fetches commune details including zipcode
import * as Sentry from "@sentry/nextjs"; // Added for Sentry
import { GristDocAPI } from "grist-api";
import type { NextApiRequest, NextApiResponse } from "next";
import { RateLimiterMemory } from "rate-limiter-flexible"; // Added for rate limiting

// Type definition for the expected request body
interface SignUpRequestBody {
  siret: string;
  postal_code: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  is_adherent: "yes" | "no" | "unknown";
  precisions?: string;
  contact_preferences_details?: "yes";
  cgu_accepted: "yes";
  structureId?: string; // Include structureId if available
}

// Response type
type SignUpResponse = {
  success: boolean;
  message?: string;
  rowId?: number | null; // Grist row ID
};

// --- Rate Limiter Configuration ---
const MAX_REQUESTS_PER_HOUR = 5;
const rateLimiter = new RateLimiterMemory({
  points: MAX_REQUESTS_PER_HOUR, // Number of points
  duration: 60 * 60, // Per hour (in seconds)
});

const getIp = (req: NextApiRequest): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    // x-forwarded-for may return multiple IP addresses in the format: "client IP, proxy 1 IP, proxy 2 IP"
    // Therefore, the right-most IP address is the IP address of the most recent proxy
    // and the left-most IP address is the IP address of the originating client.
    // We take the first one (originating client).
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
};
// --- End Rate Limiter Configuration ---

// --- Validation Configuration ---
const MAX_FIELD_LENGTH = 1024;
// --- End Validation Configuration ---

export default async function handler(req: NextApiRequest, res: NextApiResponse<SignUpResponse>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
  }

  // --- Rate Limiting Check ---
  const ip = getIp(req);
  try {
    await rateLimiter.consume(ip);
  } catch (rateLimiterRes) {
    let retrySeconds = 1;
    if (
      typeof rateLimiterRes === "object" &&
      rateLimiterRes !== null &&
      "msBeforeNext" in rateLimiterRes &&
      typeof rateLimiterRes.msBeforeNext === "number"
    ) {
      retrySeconds = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
    }
    res.setHeader("Retry-After", String(retrySeconds));
    return res
      .status(429)
      .json({ success: false, message: "Trop de tentatives. Veuillez réessayer plus tard." });
  }
  // --- End Rate Limiting Check ---

  const {
    siret,
    postal_code,
    name,
    role,
    email,
    phone,
    is_adherent,
    precisions,
    contact_preferences_details,
    cgu_accepted,
    structureId, // Capture structureId
  }: SignUpRequestBody = req.body;

  // --- Basic Validation ---
  const requiredFields: (keyof SignUpRequestBody)[] = [
    "siret",
    "postal_code",
    "name",
    "role",
    "email",
    "phone",
    "is_adherent",
    "cgu_accepted",
  ];
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Champs obligatoires manquants: ${missingFields.join(", ")}`,
    });
  }

  if (cgu_accepted !== "yes") {
    return res.status(400).json({
      success: false,
      message: "Vous devez accepter les Conditions Générales d'Utilisation.",
    });
  }
  // --- End Basic Validation ---

  // --- Length Validation ---
  const fieldsToValidateLength: (keyof SignUpRequestBody)[] = [
    "siret",
    "postal_code",
    "name",
    "role",
    "email",
    "phone",
    "precisions",
    "structureId",
  ];
  for (const field of fieldsToValidateLength) {
    const value = req.body[field];
    if (value && typeof value === "string" && value.length > MAX_FIELD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Le champ ${field} dépasse la longueur maximale autorisée de ${MAX_FIELD_LENGTH} caractères.`,
      });
    }
  }
  // --- End Length Validation ---

  // Prepare the record data for Grist (do this before the try block to include in Sentry context if needed)
  let recordToAdd: Record<string, string> | null = null;

  try {
    // 1. Fetch commune details
    const commune = await findOrganizationsWithStructures(siret);
    if (!commune) {
      return res
        .status(404)
        .json({ success: false, message: "Collectivité non trouvée pour le SIRET fourni." });
    }

    // 2. Validate Postal Code
    if (postal_code !== commune.zipcode) {
      return res.status(400).json({
        success: false,
        message: "Le code postal ne correspond pas à celui de la collectivité.",
      });
    }

    // Assign record data here now that commune is fetched
    recordToAdd = {
      SIRET: siret,
      Nom_Collectivite: commune.name,
      Code_Postal_Verification: postal_code,
      Nom_Prenom_Contact: name,
      Fonction_Contact: role,
      Email_Contact: email,
      Telephone_Contact: phone,
      Deja_Adherent: is_adherent,
      Precisions: precisions || "",
      Preferences_Contact_Detaillees: contact_preferences_details === "yes" ? "Oui" : "Non",
      CGU_Acceptees: cgu_accepted === "yes" ? "Oui" : "Non",
      Structure_ID: structureId || "",
      Date_Inscription: new Date().toISOString(),
      Adresse_IP: ip,
    };

    // 3. Prepare Grist API call
    const apiKey = process.env.GRIST_API_KEY;
    const docId = process.env.GRIST_DOC_ID;
    const server =
      process.env.GRIST_SELF_MANAGED === "Y" ? process.env.GRIST_SELF_MANAGED_HOME : undefined;
    const tableName = "inscriptions_pilote"; // CHANGE THIS if your Grist table name is different

    if (!apiKey || !docId) {
      console.error("GRIST_API_KEY or GRIST_DOC_ID is not configured.");
      console.log(JSON.stringify(recordToAdd)); // Keep log for debugging config issues
      Sentry.captureMessage("Grist API configuration missing", {
        level: "error",
        extra: { requestBody: req.body },
      });
      return res.status(500).json({
        success: false,
        message: "Erreur de configuration serveur. Veuillez réessayer plus tard ou nous contacter.",
      });
    }

    const api = new GristDocAPI(docId, { apiKey, server });

    // 4. Add record to Grist
    const addedRowIds = await api.addRecords(tableName, [recordToAdd]);

    if (!addedRowIds || addedRowIds.length === 0) {
      const errorMsg = "Failed to add record to Grist.";
      console.error(errorMsg);
      Sentry.captureMessage(errorMsg, {
        level: "error",
        extra: { requestBody: req.body, gristRecord: recordToAdd },
      });
      return res.status(500).json({
        success: false,
        message:
          "Échec de l'enregistrement de l'inscription. Veuillez réessayer plus tard ou nous contacter.",
      });
    }

    // 5. Send success response
    return res
      .status(201)
      .json({ success: true, message: "Inscription réussie !", rowId: addedRowIds[0] });
  } catch (error) {
    console.error("Signup API Error:", error);
    // Log full error and context to Sentry
    Sentry.captureException(error, {
      // Include recordToAdd if it was prepared, otherwise just body
      extra: { requestBody: req.body, gristRecordAttempt: recordToAdd },
      tags: { api_route: "/api/communes/signup" },
    });

    // Attempt to provide a more specific error message if it's a Grist error
    let userMessage =
      "Échec du traitement de l'inscription. Veuillez réessayer plus tard ou nous contacter.";
    if (error.message && error.message.includes("Table not found")) {
      userMessage =
        "Erreur lors de la communication avec le service d'enregistrement (Table non trouvée). Veuillez réessayer plus tard ou nous contacter.";
    } else if (error.message) {
      userMessage = `Échec du traitement de l\'inscription: ${error.message}. Veuillez réessayer plus tard ou nous contacter.`;
    }

    return res.status(500).json({
      success: false,
      message: userMessage,
    });
  }
}
