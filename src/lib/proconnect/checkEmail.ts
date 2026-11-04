export type EmailCheck =
  | { kind: "compliant"; provider: string; siret: string }
  | { kind: "shared"; provider: string }
  | {
      kind: "generic";
      domain: string;
      /** False when the domain is a custom one, just not the collectivité's. */
      genericDomain: boolean;
      organizationName: string;
      provider: string;
    }
  | { kind: "unknown" }
  | { kind: "invalid" };

export const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/**
 * `organization` is the collectivité picked when the address matched none.
 * Throws when the verification cannot be done.
 */
export async function checkEmail(
  email: string,
  organization?: { siret: string },
): Promise<EmailCheck> {
  const response = await fetch("/api/proconnect/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, siret: organization?.siret }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  return response.json();
}
