import { isSharedAddress } from "@/lib/proconnect/sharedAddresses";
import { expect, test } from "vitest";

test.each([
  "contact@brigny.fr",
  "Accueil@brigny.fr",
  "admin@brigny.fr",
  "mairie@brigny.fr",
  "secrétariat@brigny.fr",
  "etat-civil@brigny.fr",
  "etat.civil@brigny.fr",
  "contact.mairie@brigny.fr",
  "mairie-brigny@brigny.fr",
  "accueil2@brigny.fr",
])("%s is shared", (email) => {
  expect(isSharedAddress(email)).toBe(true);
});

test.each([
  "alice.nguyen@brigny.fr",
  "martine.dupont@brigny.fr",
  "jean-marc.contacte@brigny.fr",
  "eaubonne.martin@brigny.fr",
])("%s is nominative", (email) => {
  expect(isSharedAddress(email)).toBe(false);
});
