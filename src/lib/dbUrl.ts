/**
 * pg currently treats sslmode=prefer, require and verify-ca as aliases for verify-full,
 * and warns that pg v9 will switch them to the weaker libpq semantics (no certificate
 * verification). Scalingo hands out URLs with sslmode=prefer, so we make the current,
 * stricter behavior explicit rather than inherit the downgrade on upgrade.
 *
 * Only used by the Node side: psycopg2 already applies libpq semantics.
 */
const SSLMODES_ALIASED_TO_VERIFY_FULL = ["prefer", "require", "verify-ca"];

export function normalizeSslMode(dbUrl: string): string {
  try {
    const url = new URL(dbUrl);
    if (!SSLMODES_ALIASED_TO_VERIFY_FULL.includes(url.searchParams.get("sslmode") ?? "")) {
      return dbUrl;
    }
    url.searchParams.set("sslmode", "verify-full");
    return url.toString();
  } catch {
    return dbUrl;
  }
}
