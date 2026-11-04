import { compactName } from "@/lib/string";

// "mairie-brigny", "mairiedebrigny", "ville-d-orsay", "communeboz": the prefix is not
// part of the name. The "d" of "mairiedruillat" is, hence a variant per prefix.
const PREFIXES = [/^(mairie|ville|commune)-?/, /^(mairie|ville|commune)-?de?-?/];
const SUFFIX = /-?mairie$/;

/**
 * The compact names (see `compactName`) the domain may spell, or none when a
 * department number already sets it apart. Domains write "bourgenbresse" as
 * often as "bourg-en-bresse". The prefix of "mairie-brigny" is not part of the
 * name, but that of "ville-la-grand" is: every spelling is a candidate.
 */
export function homonymKeys(domain: string): string[] {
  const labels = domain.split(".");
  const label = labels[labels.length - 2];
  if (/\d$/.test(label)) return [];

  const spellings = [
    label,
    label.replace(SUFFIX, ""),
    ...PREFIXES.map((p) => label.replace(p, "")),
  ];

  return [...new Set(spellings.map(compactName).filter(Boolean))];
}
