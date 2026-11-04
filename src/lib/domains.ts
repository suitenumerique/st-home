// The lists the RPNT checks of the data pipeline run on (data/tasks/defs.py),
// exported to data/domains.json.
import domains from "../../data/domains.json";

export const ALLOWED_EXTENSIONS: string[] = domains.extensions_allowed;

/** Webmail, ISPs and shared mailboxes. Matched exactly, as the pipeline does. */
export function isGenericEmailDomain(domain: string): boolean {
  return domains.generic_email_domains.includes(domain);
}

/** Platforms shared by many collectivités: the listed domains and their subdomains. */
export function isGenericWebsiteDomain(domain: string): boolean {
  return domains.generic_website_domains.some(
    (generic) => domain === generic || domain.endsWith(`.${generic}`),
  );
}
