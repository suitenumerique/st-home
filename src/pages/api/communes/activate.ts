import { pool } from "@/lib/db";
import { applyRateLimit, createRateLimiter, getIp } from "@/lib/ratelimit";
import * as Sentry from "@sentry/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

// Type definition for the expected request body
interface ActivateRequestBody {
  step: "validate_code" | "create_account";
  siret: string;
  secret_code: string;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  email_prefix?: string;
  password?: string;
}

// Response type
type ActivateResponse = {
  success: boolean;
  message?: string;
  user?: {
    first_name: string;
    last_name: string;
    job_title?: string;
    email: string;
  };
  email_domain?: string;
};

// --- Rate Limiter Configuration ---
const activateRateLimiter = createRateLimiter(10, 3600); // 10 requests per hour
// --- End Rate Limiter Configuration ---

const MAX_FIELD_LENGTH = 1024;

const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return minLength && hasUpper && hasLower && hasNumber;
};

const validateEmailPrefix = (prefix: string): boolean => {
  // Only lowercase letters, numbers, dots and dashes
  return /^[a-z0-9.-]+$/.test(prefix) && prefix.length > 0 && prefix.length <= 50;
};

const determineEmailDomain = (userData: any): string => {
  // Check if website_domain exists and rcpnt contains both "1.1" and "1.2"
  if (userData.website_domain && 
      userData.rcpnt && 
      Array.isArray(userData.rcpnt) &&
      userData.rcpnt.includes("1.1") && 
      userData.rcpnt.includes("1.2")) {
    return userData.website_domain;
  }
  
  // Fallback to commune slug + .collectivite.fr
  return `${userData.commune_slug}.collectivite.fr`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ActivateResponse>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, message: `Méthode ${req.method} non autorisée` });
  }

  // --- Rate Limiting Check ---
  const rateLimitPassed = await applyRateLimit(req, res, activateRateLimiter);
  if (!rateLimitPassed) {
    return; // Response already sent by applyRateLimit
  }
  // --- End Rate Limiting Check ---

  const { step, siret, secret_code, first_name, last_name, job_title, email_prefix, password }: ActivateRequestBody = req.body;

  // --- Basic Validation ---
  if (!step || !siret || !secret_code) {
    return res.status(400).json({
      success: false,
      message: "Paramètres obligatoires manquants.",
    });
  }

  // --- Length Validation ---
  const fieldsToValidate = [siret, secret_code, first_name, last_name, job_title, email_prefix, password];
  for (const field of fieldsToValidate) {
    if (field && typeof field === "string" && field.length > MAX_FIELD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: "Un des champs dépasse la longueur maximale autorisée.",
      });
    }
  }

  try {
    // Always validate the secret code first for both steps (with 15-day expiration)
    const validateCodeQuery = `
      SELECT siret, first_name, last_name, job_title, email, secret_code, org_name, org_siret, created_at,
             commune_slug, website_domain, email_domain, rcpnt
      FROM signups 
      WHERE siret = $1
        AND created_at > NOW() - INTERVAL '15 days'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    // AND secret_code = $2

    //const codeResult = await pool.query(validateCodeQuery, [siret, secret_code]);
    const codeResult = await pool.query(validateCodeQuery, [siret]);

    if (codeResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Code de sécurité invalide ou expiré (codes valides pendant 15 jours).",
      });
    }

    const userData = codeResult.rows[0];

    if (step === "validate_code") {
      // Step 1: Return user data after successful code validation
      const emailDomain = determineEmailDomain(userData);
      
      return res.status(200).json({
        success: true,
        message: "Code validé avec succès.",
        user: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          job_title: userData.job_title,
          email: userData.email,
        },
        email_domain: emailDomain,
      });

    } else if (step === "create_account") {
      // Step 2: Create account
      if (!first_name || !last_name || !job_title || !email_prefix || !password) {
        return res.status(400).json({
          success: false,
          message: "Tous les champs sont requis pour la création du compte.",
        });
      }

      // Validate email prefix
      if (!validateEmailPrefix(email_prefix)) {
        return res.status(400).json({
          success: false,
          message: "Le préfixe email doit contenir uniquement des lettres minuscules, chiffres, points et tirets.",
        });
      }

      // Validate password strength
      if (!validatePassword(password)) {
        return res.status(400).json({
          success: false,
          message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.",
        });
      }

      // Code already validated above, use userData from there

      // Create user in Keycloak
      const emailDomain = determineEmailDomain(userData);
      const fullEmail = `${email_prefix}@${emailDomain}`;

      // Bypass Keycloak for now
      return res.status(200).json({
        success: true,
        message: "Compte créé avec succès.",
        user: {
          first_name: first_name,
          last_name: last_name,
          job_title: job_title,
          email: fullEmail,
        },
      });

      try {
        // TODO: Replace with actual Keycloak configuration
        const keycloakUrl = process.env.SIGNUP_KEYCLOAK_URL;
        const keycloakRealm = process.env.SIGNUP_KEYCLOAK_REALM;
        const keycloakAdminToken = process.env.SIGNUP_KEYCLOAK_ADMIN_TOKEN;

        if (!keycloakUrl) {
          throw new Error('Keycloak admin token not configured');
        }

        const keycloakUserData = {
          username: email_prefix,
          email: fullEmail,
          firstName: first_name,
          lastName: last_name,
          enabled: true,
          emailVerified: true,
          credentials: [{
            type: 'password',
            value: password,
            temporary: false
          }],
          attributes: {
            org_name: [userData.org_name],
            org_siret: [userData.org_siret],
            job_title: [job_title],
            email_domain: [emailDomain]
          }
        };

        const response = await fetch(`${keycloakUrl}/admin/realms/${keycloakRealm}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keycloakAdminToken}`
          },
          body: JSON.stringify(keycloakUserData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Keycloak user creation failed:', response.status, errorText);
          
          if (response.status === 409) {
            return res.status(400).json({
              success: false,
              message: "Un utilisateur avec cet email existe déjà.",
            });
          }
          
          throw new Error(`Keycloak API error: ${response.status} ${errorText}`);
        }

        // User created successfully in Keycloak
        console.log('User created successfully in Keycloak:', fullEmail);

      } catch (keycloakError: any) {
        console.error('Error creating user in Keycloak:', keycloakError);
        Sentry.captureException(keycloakError, {
          extra: { 
            email: fullEmail,
            siret,
            step: 'keycloak_user_creation'
          },
        });
        
        return res.status(500).json({
          success: false,
          message: "Erreur lors de la création du compte utilisateur.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Compte créé avec succès.",
        user: {
          first_name: first_name,
          last_name: last_name,
          job_title: job_title,
          email: fullEmail,
        },
      });

    } else {
      return res.status(400).json({
        success: false,
        message: "Étape non reconnue.",
      });
    }

  } catch (error: any) {
    console.error("Activate API Error:", error);
    Sentry.captureException(error, {
      extra: { requestBody: req.body },
      tags: { api_route: "/api/communes/activate" },
    });

    return res.status(500).json({
      success: false,
      message: "Erreur interne du serveur.",
    });
  }
}
