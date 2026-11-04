import { checkDomainFormat, parseDomain } from "@/lib/domaines/checkDomain";
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
  ["louhossoa.eus", "extension"],
  ["commune.bio", "extension"],
  ["monvillage.cafe", "extension"],
  ["lemanoirsurseine.ovh", "extension"],
  ["monthurel.fr.gd", "extension"],
  ["kernascleden.dzh", "invalid"],
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
