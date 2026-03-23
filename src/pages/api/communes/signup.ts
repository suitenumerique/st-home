import { findOrganizationsWithOperators } from "@/lib/db";
import * as Sentry from "@sentry/nextjs";
import { GristDocAPI } from "grist-api";
import type { NextApiRequest, NextApiResponse } from "next";
import { RateLimiterMemory } from "rate-limiter-flexible";

interface SignUpRequestBody {
  siret: string;
  name: string;
  firstname: string;
  email: string;
  role: string;
  cgu_accepted: "yes";
  precisions?: string;
  operatorId?: string;
}

type SignUpResponse = {
  success: boolean;
  message?: string;
  rowId?: number | null;
};

const MAX_REQUESTS_PER_HOUR = 5;
const rateLimiter = new RateLimiterMemory({
  points: MAX_REQUESTS_PER_HOUR,
  duration: 60 * 60,
});

const getIp = (req: NextApiRequest): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
};

const MAX_FIELD_LENGTH = 1024;

export default async function handler(req: NextApiRequest, res: NextApiResponse<SignUpResponse>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
  }

  // Rate limiting
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

  const {
    siret,
    name,
    firstname,
    role,
    email,
    precisions,
    cgu_accepted,
    operatorId,
  }: SignUpRequestBody = req.body;

  // Validation
  const requiredFields: (keyof SignUpRequestBody)[] = [
    "siret",
    "name",
    "firstname",
    "role",
    "email",
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

  const fieldsToValidateLength: (keyof SignUpRequestBody)[] = [
    "siret",
    "name",
    "firstname",
    "role",
    "email",
    "precisions",
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

  let recordToAdd: Record<string, string | number> | null = null;
  const tableName = "Formulaire_Groupe_Pilote";

  try {
    const commune = await findOrganizationsWithOperators(siret);
    if (!commune) {
      Sentry.captureMessage("Commune not found during signup", {
        level: "warning",
        extra: { siret },
      });
      return res
        .status(404)
        .json({ success: false, message: "Collectivité non trouvée pour le SIRET fourni." });
    }

    const fullName = firstname ? `${firstname} ${name}` : name;

    // Resolve operator info from form selection
    const selectedOperator = operatorId
      ? (commune.operators || []).find((op) => op.id === operatorId)
      : null;
    const opsnName = selectedOperator?.name || "";
    const membreOpsn = selectedOperator ? (selectedOperator.isAdherent ? "Oui" : "Non") : "";

    recordToAdd = {
      Nom: fullName,
      Prenom: firstname || "",
      Mail: email,
      Fonction: role,
      Structure: commune.name,
      SIRET: commune.siret,
      Telephone: commune.phone || "",
      ...(commune.type === "commune" ? { CP: commune.zipcode || "" } : {}),
      OPSN: opsnName,
      Membre_OPSN: membreOpsn,
      Precisions: precisions || "",
      IP: ip,
    };

    const apiKey = process.env.GRIST_API_KEY;
    const docId = process.env.GRIST_DOC_ID_SIGNUP;
    const server =
      process.env.GRIST_SELF_MANAGED === "Y" ? process.env.GRIST_SELF_MANAGED_HOME : undefined;

    if (!apiKey || !docId) {
      console.error("GRIST_API_KEY or GRIST_DOC_ID is not configured.");
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

    // Post to Messages API (non-blocking)
    const messagesEndpoint = process.env.SIGNUP_MESSAGES_API_ENDPOINT;
    const messagesChannelId = process.env.SIGNUP_MESSAGES_CHANNEL_ID;
    if (messagesEndpoint && messagesChannelId) {
      const textBody = [
        `Nouvelle inscription depuis le formulaire de contact`,
        ``,
        `Nom: ${recordToAdd.Nom}`,
        `Email: ${recordToAdd.Mail}`,
        `Fonction: ${recordToAdd.Fonction}`,
        `Structure: ${recordToAdd.Structure} (SIRET: ${recordToAdd.SIRET})`,
        `Téléphone: ${recordToAdd.Telephone || "Inconnu"}`,
        recordToAdd.CP ? `Code postal: ${recordToAdd.CP}` : "",
        recordToAdd.OPSN ? `OPSN: ${recordToAdd.OPSN}` : "",
        recordToAdd.Membre_OPSN ? `Membre OPSN: ${recordToAdd.Membre_OPSN}` : "",
        recordToAdd.Precisions ? `Précisions: ${recordToAdd.Precisions}` : "",
      ].join("\n");

      fetch(`${messagesEndpoint}deliver/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Channel-ID": messagesChannelId,
        },
        body: JSON.stringify({ email, textBody }),
      }).catch((err) => {
        console.error("Messages API Error:", err);
        Sentry.captureException(err, {
          tags: { api_route: "/api/communes/signup", target: "messages" },
        });
      });
    }

    return res
      .status(201)
      .json({ success: true, message: "Inscription réussie !", rowId: addedRowIds[0] });
  } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    console.error("Signup API Error:", error);
    Sentry.captureException(error, {
      extra: { requestBody: req.body, gristRecordAttempt: recordToAdd },
      tags: { api_route: "/api/communes/signup" },
    });

    let userMessage =
      "Échec du traitement de l'inscription. Veuillez réessayer plus tard ou nous contacter.";
    if (error.response) {
      console.error("Grist API Error Status:", error.response.status);
      console.error("Grist API Error Data:", error.response.data);
      const errorDetail = error.response.data?.error || JSON.stringify(error.response.data);
      if (error.response.status === 404) {
        userMessage = `Erreur service distant: Ressource non trouvée (${errorDetail}). Vérifiez le nom de la table ('${tableName}') ou l'ID du document.`;
      } else if (error.response.status === 400) {
        userMessage = `Erreur service distant: Données invalides (${errorDetail}). Vérifiez les noms/types des colonnes: ${Object.keys(recordToAdd || {}).join(", ")}.`;
      } else {
        userMessage = `Erreur service distant (${error.response.status}): ${errorDetail}. Veuillez réessayer plus tard ou nous contacter.`;
      }
      Sentry.setContext("Grist Error Detail", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.message) {
      userMessage = `Échec du traitement de l'inscription: ${error.message}. Veuillez réessayer plus tard ou nous contacter.`;
    }

    return res.status(500).json({
      success: false,
      message: userMessage,
    });
  }
}
