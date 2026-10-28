import { checkDomainFormat, homonymKey, parseDomain } from "@/lib/domaines/checkDomain";
import { expect, test } from "vitest";

test.each([
  ["contact@brigny.fr", "brigny.fr"],
  ["Contact@Brigny.FR", "brigny.fr"],
  ["brigny.fr", "brigny.fr"],
  ["www.brigny.fr", "brigny.fr"],
  ["https://www.brigny.fr/vie-locale?page=2", "brigny.fr"],
  ["http://mairie-brigny.fr:8080", "mairie-brigny.fr"],
])("%s has the domain %s", (input, domain) => {
  expect(parseDomain(input)).toBe(domain);
});

test.each(["contac", "contact@", "brigny", "brigny .fr", ""])("%s has no domain", (input) => {
  expect(parseDomain(input)).toBeNull();
});

test.each([
  ["brigny.fr", "compliant"],
  ["brigny.bzh", "compliant"],
  ["brigny.yt", "compliant"],
  ["brigny.com", "extension"],
  ["mairie-brégny.fr", "accent"],
  ["xn--mairie-brgny-dhb.fr", "accent"],
  ["wanadoo.fr", "generic"],
  ["gmail.com", "generic"],
  ["brigny.ff", "invalid"],
])("%s is %s", (domain, kind) => {
  expect(checkDomainFormat(domain).kind).toBe(kind);
});

test.each([
  ["brigny.fr", "brigny"],
  ["mairie-brigny.fr", "brigny"],
  ["ville-saint-denis.fr", "saintdenis"],
  ["brigny71.fr", null],
  ["mairie-brigny-71.fr", null],
])("%s compares as %s", (domain, key) => {
  expect(homonymKey(domain)).toBe(key);
});
