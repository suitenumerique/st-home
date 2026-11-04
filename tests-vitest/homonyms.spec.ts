import { homonymKeys } from "@/lib/domaines/homonyms";
import { compactName, unaccent } from "@/lib/string";
import { expect, test } from "vitest";

test.each([
  ["Saint-Étienne", "saint etienne"],
  ["St Etienne", "saint etienne"],
  ["ST-ETIENNE", "saint etienne"],
  ["St.-Alban", "saint alban"],
  ["Ste-Croix", "sainte croix"],
  ["Bourg-St.-Christophe", "bourg saint christophe"],
  ["Œuilly", "oeuilly"],
  ["Marcq-en-Barœul", "marcq en baroeul"],
  ["Cæn", "caen"],
  ["L'Haÿ-les-Roses", "lhay les roses"],
  ["L’Isle-Adam", "lile adam"],
  ["L'Île-Adam", "lile adam"],
  ["Île-d'Yeu", "ile dyeu"],
  ["Isle-sur-la-Sorgue", "ile sur la sorgue"],
  ["Les Isles-Bardel", "les iles bardel"],
  ["Boisleux-au-Mont", "boisleux au mont"],
  ["Castelnau-le-Lez", "castelnau le les"],
  ["Saint-André-lez-Lille", "saint andre les lille"],
  ["Saint-André-lès-Lille", "saint andre les lille"],
  ["Lezoux", "lezoux"],
  ["Mt de Marsan", "mont de marsan"],
  ["Mt.-Blanc", "mont blanc"],
  ["Mont-de-Marsan", "mont de marsan"],
  ["Mtoto", "mtoto"],
  ["Marolles  lès  Bailly", "marolles les bailly"],
  ["  Brigny ", "brigny"],
])("%s is searched as %s", (name, searched) => {
  expect(unaccent(name)).toBe(searched);
});

test.each([
  ["Bourg-en-Bresse", "bourgenbresse"],
  ["bourgenbresse", "bourgenbresse"],
  ["L Abergement-Clémenciat", "labergementclemenciat"],
  ["L'Abergement-Clémenciat", "labergementclemenciat"],
  ["L'Isle-Adam", "lileadam"],
  ["lisleadam", "lileadam"],
  ["Boisleux", "boileux"],
])("%s is compared as %s", (name, compact) => {
  expect(compactName(name)).toBe(compact);
});

// In the order they settle it: the first spelling a commune has wins.
test.each([
  ["brigny.fr", ["brigny"]],
  ["mairie-brigny.fr", ["mairiebrigny", "brigny"]],
  ["mairiebrigny.fr", ["mairiebrigny", "brigny"]],
  ["mairiedebrigny.fr", ["mairiedebrigny", "debrigny", "brigny"]],
  ["mairie-de-brigny.fr", ["mairiedebrigny", "debrigny", "brigny"]],
  ["ville-d-orsay.fr", ["villedorsay", "dorsay", "orsay"]],
  ["communeboz.fr", ["communeboz", "boz"]],
  ["bonifacio-mairie.fr", ["bonifaciomairie", "bonifacio"]],
  ["ville-sur-tourbe.fr", ["villesurtourbe", "surtourbe"]],
  ["villedaigne.fr", ["villedaigne", "daigne", "aigne"]],
  ["bourgenbresse.fr", ["bourgenbresse"]],
  ["st-denis.fr", ["saintdenis"]],
  ["l-isle-adam.fr", ["lileadam"]],
  ["lisle-adam.fr", ["lileadam"]],
  ["boisleux.fr", ["boileux"]],
  ["saint-andre-lez-lille.fr", ["saintandreleslille"]],
  ["saint-andre-les-lille.fr", ["saintandreleslille"]],
  ["mt-de-marsan.fr", ["montdemarsan"]],
  ["saint-jean-d-angely.fr", ["saintjeandangely"]],
  ["brigny71.fr", []],
  ["beny01.fr", []],
  ["mairie-brigny-71.fr", []],
])("%s may be named after %j", (domain, keys) => {
  expect(homonymKeys(domain)).toEqual(keys);
});
