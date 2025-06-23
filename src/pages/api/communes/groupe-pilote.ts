import { findMutualizationStructureById, findOrganizationsWithStructures } from "@/lib/db";
import { applyRateLimit, createRateLimiter, getIp } from "@/lib/ratelimit";
import * as Sentry from "@sentry/nextjs";
import { GristDocAPI } from "grist-api";
import type { NextApiRequest, NextApiResponse } from "next";

// Type definition for the expected request body
interface SignUpRequestBody {
  siret: string;
  postal_code: string;
  name: string; // Full name
  role: string;
  email: string;
  phone: string;
  is_adherent: "yes" | "no" | "unknown"; // Only relevant if structureId is present
  precisions?: string;
  cgu_accepted: "yes";
  structureId?: string; // Optional structure ID
}

// Response type
type SignUpResponse = {
  success: boolean;
  message?: string;
  rowId?: number | null; // Grist row ID
};

// --- Rate Limiter Configuration ---
const groupePiloteRateLimiter = createRateLimiter(5, 3600); // 5 requests per hour
// --- End Rate Limiter Configuration ---

// --- Validation Configuration ---
const MAX_FIELD_LENGTH = 1024;
// --- End Validation Configuration ---

// Helper to map OPSN membership status
const mapOPSNMembershipStatus = (status: "yes" | "no" | "unknown"): string => {
  switch (status) {
    case "yes":
      return "Oui";
    case "no":
      return "Non";
    case "unknown":
      return "?";
    default:
      return "";
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<SignUpResponse>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
  }

  // --- Rate Limiting Check ---
  const rateLimitPassed = await applyRateLimit(req, res, groupePiloteRateLimiter);
  if (!rateLimitPassed) {
    return; // Response already sent by applyRateLimit
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
    cgu_accepted,
    structureId,
  }: SignUpRequestBody = req.body;

  // --- Basic Validation ---
  const requiredFields: (keyof Omit<SignUpRequestBody, "precisions" | "structureId">)[] = [
    "siret",
    "postal_code",
    "name",
    "role",
    "email",
    "phone",
    "cgu_accepted",
  ];
  const missingFields = requiredFields.filter(
    (field) => req.body[field] === undefined || req.body[field] === "",
  );

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
  const fieldsToValidateLength: (keyof Omit<SignUpRequestBody, "cgu_accepted" | "is_adherent">)[] =
    ["siret", "postal_code", "name", "role", "email", "phone", "precisions", "structureId"];
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

  // Prepare the record data for Grist
  let recordToAdd: Record<string, string | number> | null = null;
  const tableName = "Formulaire_Groupe_Pilote"; // Use Python class name

  try {
    // 1. Fetch commune details
    const commune = await findOrganizationsWithStructures(siret);
    if (!commune) {
      Sentry.captureMessage("Commune not found during signup", {
        level: "warning",
        extra: { siret },
      });
      return res
        .status(404)
        .json({ success: false, message: "Collectivité non trouvée pour le SIRET fourni." });
    }

    // 2. Fetch Mutualization Structure details (if ID provided)
    let opsnName = "";
    let membreOpsnStatus = "";
    if (structureId) {
      const structure = await findMutualizationStructureById(structureId);
      if (structure) {
        opsnName = structure.shortname || structure.name || ""; // Use fetched name for OPSN column
        membreOpsnStatus = mapOPSNMembershipStatus(is_adherent); // Map status for Membre_OPSN column
      } else {
        // Structure ID provided but not found - log warning, proceed without OPSN info
        console.warn(`Mutualization structure with ID ${structureId} not found.`);
        Sentry.captureMessage("Mutualization structure not found during signup", {
          level: "warning",
          extra: { structureId, siret },
        });
      }
    } else {
      // No structure ID provided, ensure is_adherent isn't mapped
      membreOpsnStatus = ""; // Explicitly clear status if no structure ID
    }

    // 3. Validate Postal Code
    if (commune.type === "commune" && postal_code !== commune.zipcode) {
      return res.status(400).json({
        success: false,
        message: "Le code postal ne correspond pas à celui de la collectivité.",
      });
    }

    if (commune.type === "epci" && postal_code !== commune.insee_dep) {
      return res.status(400).json({
        success: false,
        message: "Le département ne correspond pas à celui de l'EPCI.",
      });
    }

    // 4. Construct Grist Record
    const ip = getIp(req);
    recordToAdd = {
      // --- Grist Column Name : Value from Request/Logic ---
      Nom: name, // Full name from form
      // "Prenom": "",          // Leave empty/unset
      Mail: email,
      Fonction: role,
      // "Cyberattaque": "",    // Leave empty/unset (deprecated)
      Structure: commune.name, // Use commune name
      Telephone: phone,
      CP: postal_code,
      // "Cree_a":             // Handled by Grist default
      SIRET: commune.siret,
      OPSN: opsnName, // Fetched structure name or empty
      Membre_OPSN: membreOpsnStatus, // Mapped status or empty
      Precisions: precisions || "",
      IP: ip,
      // "A":                  // Boolean, not in form
      // "Contact_pris":       // Boolean, not in form
    };

    // 5. Prepare Grist API call
    const apiKey = process.env.GRIST_API_KEY;
    const docId = process.env.GRIST_DOC_ID_SIGNUP;
    const server =
      process.env.GRIST_SELF_MANAGED === "Y" ? process.env.GRIST_SELF_MANAGED_HOME : undefined;

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

    // 6. Add record to Grist
    console.log(`Adding record to Grist table '${tableName}':`, JSON.stringify(recordToAdd));
    const addedRowIds = await api.addRecords(tableName, [recordToAdd]);
    console.log("Grist response - addedRowIds:", addedRowIds);

    if (!addedRowIds || addedRowIds.length === 0) {
      const errorMsg = `Failed to add record to Grist table '${tableName}' (no row ID returned).`;
      console.error(errorMsg);
      Sentry.captureMessage(errorMsg, {
        level: "error",
        extra: { requestBody: req.body, gristRecord: recordToAdd, tableName },
      });
      return res.status(500).json({
        success: false,
        message:
          "Échec de l'enregistrement de l'inscription (service distant). Veuillez réessayer plus tard ou nous contacter.",
      });
    }

    // 7. Send success response
    return res
      .status(201)
      .json({ success: true, message: "Inscription réussie !", rowId: addedRowIds[0] });
  } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    console.error("Signup API Error:", error);
    Sentry.captureException(error, {
      extra: { requestBody: req.body, gristRecordAttempt: recordToAdd },
      tags: { api_route: "/api/communes/groupe-pilote" },
    });

    let userMessage =
      "Échec du traitement de l\'inscription. Veuillez réessayer plus tard ou nous contacter.";
    if (error.response) {
      // Axios/Grist API error
      console.error("Grist API Error Status:", error.response.status);
      console.error("Grist API Error Data:", error.response.data);
      const errorDetail = error.response.data?.error || JSON.stringify(error.response.data);
      if (error.response.status === 404) {
        userMessage = `Erreur service distant: Ressource non trouvée (${errorDetail}). Vérifiez le nom de la table ('${tableName}') ou l'ID du document.`;
      } else if (error.response.status === 400) {
        userMessage = `Erreur service distant: Données invalides (${errorDetail}). Vérifiez les noms/types des colonnes: ${Object.keys(recordToAdd || {}).join(", ")}.`; // Added column names hint
      } else {
        userMessage = `Erreur service distant (${error.response.status}): ${errorDetail}. Veuillez réessayer plus tard ou nous contacter.`;
      }
      Sentry.setContext("Grist Error Detail", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.message) {
      // Other errors
      userMessage = `Échec du traitement de l\'inscription: ${error.message}. Veuillez réessayer plus tard ou nous contacter.`;
    }

    return res.status(500).json({
      success: false,
      message: userMessage,
    });
  }
}
