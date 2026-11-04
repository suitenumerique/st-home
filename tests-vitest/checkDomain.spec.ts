import { checkDomainFormat, homonymKeys, parseDomain } from "@/lib/domaines/checkDomain";
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

test.each(["contac", "contact@", "brigny", "brigny .fr", "", `${"a".repeat(251)}.fr`])(
  "%s has no domain",
  (input) => {
    expect(parseDomain(input)).toBeNull();
  },
);

test.each([
  ["brigny.fr", "compliant"],
  ["brigny.bzh", "compliant"],
  ["brigny.yt", "compliant"],
  ["brigny.eu", "compliant"],
  ["brigny.eus", "invalid"],
  ["brigny.bl", "invalid"],
  ["brigny.free.fr", "generic"],
  ["brigny.wixsite.com", "generic"],
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
  ["brigny.fr", ["brigny"]],
  ["mairie-brigny.fr", ["mairiebrigny", "brigny"]],
  ["ville-saint-denis.fr", ["villesaintdenis", "saintdenis"]],
  ["ville-sur-tourbe.fr", ["villesurtourbe", "surtourbe"]],
  ["brigny71.fr", []],
  ["mairie-brigny-71.fr", []],
])("%s compares as %j", (domain, keys) => {
  expect(homonymKeys(domain)).toEqual(keys);
});
