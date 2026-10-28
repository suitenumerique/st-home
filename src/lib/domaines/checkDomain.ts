import { GENERIC_DOMAINS } from "@/lib/genericDomains";

export type DomainCheck =
  | { kind: "compliant"; siret?: string }
  | { kind: "homonym"; name: string; siret?: string }
  | { kind: "generic"; domain: string }
  | { kind: "accent" }
  | { kind: "extension"; extension: string }
  | { kind: "invalid" };

export type DomainLookup = { homonym: string | null; siret: string | null };

// The .fr and the extensions of the regions and overseas territories.
const COMPLIANT_EXTENSIONS = [
  "fr",
  "re",
  "yt",
  "pm",
  "wf",
  "tf",
  "gp",
  "mq",
  "gf",
  "nc",
  "pf",
  "bl",
  "mf",
  "bzh",
  "alsace",
  "corsica",
  "paris",
  "eus",
];

// Real extensions, just not meant for a collectivité. Any other one is taken
// for a typo.
const OTHER_EXTENSIONS = [
  "com",
  "net",
  "org",
  "eu",
  "info",
  "biz",
  "io",
  "co",
  "me",
  "online",
  "site",
  "website",
  "xyz",
  "be",
  "ch",
  "de",
  "es",
  "it",
  "uk",
  "ca",
];

const HOSTNAME = /^[\p{L}\p{N}-]+(\.[\p{L}\p{N}-]+)+$/u;
const NAME_PREFIX = /^(mairie|ville|commune)-/;

/** The domain of an email address or a website, or null when it has none. */
export function parseDomain(input: string): string | null {
  const value = input.trim().toLowerCase();
  const domain = value.includes("@")
    ? value.slice(value.lastIndexOf("@") + 1)
    : value
        .replace(/^[a-z]+:\/\//, "")
        .split(/[/?#:]/)[0]
        .replace(/^www\./, "");

  return HOSTNAME.test(domain) ? domain : null;
}

/** Every check but the homonym one, which needs the list of communes. */
export function checkDomainFormat(domain: string): DomainCheck {
  const extension = domain.slice(domain.lastIndexOf(".") + 1);

  if (!COMPLIANT_EXTENSIONS.includes(extension) && !OTHER_EXTENSIONS.includes(extension)) {
    return { kind: "invalid" };
  }
  if (GENERIC_DOMAINS.includes(domain)) return { kind: "generic", domain };
  if (/[^\x00-\x7f]/.test(domain) || domain.split(".").some((label) => label.startsWith("xn--"))) {
    return { kind: "accent" };
  }
  if (!COMPLIANT_EXTENSIONS.includes(extension)) return { kind: "extension", extension };

  return { kind: "compliant" };
}

/**
 * The commune name the domain spells, compared without accents or separators,
 * or null when a department number already sets it apart.
 */
export function homonymKey(domain: string): string | null {
  const labels = domain.split(".");
  const name = labels[labels.length - 2].replace(NAME_PREFIX, "");

  return /\d$/.test(name) ? null : name.replace(/[^a-z0-9]/g, "");
}

/**
 * An input without a domain is invalid. The lookup adds the collectivité the
 * domain belongs to and its homonyms; it never fails the check.
 */
export async function checkDomain(input: string): Promise<DomainCheck> {
  const domain = parseDomain(input);
  if (!domain) return { kind: "invalid" };

  const check = checkDomainFormat(domain);
  if (check.kind !== "compliant") return check;

  try {
    const response = await fetch("/api/domaines/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { homonym, siret } = (await response.json()) as DomainLookup;
    const found = siret ? { siret } : {};
    return homonym ? { kind: "homonym", name: homonym, ...found } : { ...check, ...found };
  } catch (error) {
    console.error("Error looking up the domain", error);
    return check;
  }
}
