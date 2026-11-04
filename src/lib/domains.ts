// The lists the RPNT checks of the data pipeline run on, documented in the file
// itself and also read by data/tasks/defs.py.
import domains from "../../data/defs/domains.json";

type Groups = { groups: { items: { value: string }[] }[] };

const values = ({ groups }: Groups) => groups.flatMap((group) => group.items.map((i) => i.value));

export const ALLOWED_EXTENSIONS: string[] = values(domains.extensions_allowed);

const GENERIC_EMAIL_DOMAINS = values(domains.generic_email_domains);
const GENERIC_WEBSITE_DOMAINS = values(domains.generic_website_domains);

/** Webmail, ISPs and shared mailboxes. Matched exactly, as the pipeline does. */
export function isGenericEmailDomain(domain: string): boolean {
  return GENERIC_EMAIL_DOMAINS.includes(domain);
}

/** Platforms shared by many collectivités: the listed domains and their subdomains. */
export function isGenericWebsiteDomain(domain: string): boolean {
  return GENERIC_WEBSITE_DOMAINS.some(
    (generic) => domain === generic || domain.endsWith(`.${generic}`),
  );
}
