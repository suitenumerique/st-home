// Role addresses of a collectivité, used by several people: never nominative.
// Compared without accents, separators or trailing digits, so "etat-civil",
// "etat.civil" and "etatcivil2" all match "etatcivil".
const SHARED_LOCAL_PARTS = [
  "accueil",
  "adjoint",
  "admin",
  "administratif",
  "administration",
  "agencepostale",
  "assainissement",
  "bibliotheque",
  "bureau",
  "cabinet",
  "cantine",
  "ccas",
  "cimetiere",
  "commune",
  "communication",
  "compta",
  "comptabilite",
  "conseil",
  "contact",
  "courrier",
  "culture",
  "dgs",
  "direction",
  "eau",
  "ecole",
  "elections",
  "elus",
  "etatcivil",
  "facturation",
  "factures",
  "finances",
  "hello",
  "info",
  "information",
  "informations",
  "infos",
  "jeunesse",
  "maire",
  "mairie",
  "marches",
  "marchespublics",
  "mediatheque",
  "noreply",
  "office",
  "periscolaire",
  "policemunicipale",
  "police",
  "postmaster",
  "rh",
  "secretaire",
  "secretariat",
  "service",
  "services",
  "servicestechniques",
  "social",
  "sport",
  "standard",
  "support",
  "technique",
  "tourisme",
  "travaux",
  "urbanisme",
  "ville",
  "voirie",
  "webmaster",
];

const SEPARATORS = /[.\-_+]/;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\d+$/, "");
}

/**
 * Whether the address is a shared mailbox: its local part is a role word, as a
 * whole ("etat-civil@") or as its first word ("contact.mairie@", "mairie-brigny@").
 */
export function isSharedAddress(email: string): boolean {
  const localPart = email.split("@")[0] ?? "";
  const whole = normalize(localPart.replace(new RegExp(SEPARATORS, "g"), ""));
  const firstWord = normalize(localPart.split(SEPARATORS)[0] ?? "");

  return SHARED_LOCAL_PARTS.includes(whole) || SHARED_LOCAL_PARTS.includes(firstWord);
}
