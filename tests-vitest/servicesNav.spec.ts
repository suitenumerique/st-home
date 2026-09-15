import { servicePages } from "@/lib/services";
import { getServicesNavLinks, servicesNav } from "@/lib/services/nav";
import { expect, test } from "vitest";

// `nav.ts` duplicates the slug and label of each service page so that the
// layout does not have to import the pages themselves. Keep the two in sync.
test("the header dropdown matches the service pages", () => {
  expect(servicesNav).toEqual(
    servicePages.map((page) => ({ slug: page.slug, navLabel: page.navLabel })),
  );
});

test("the header dropdown links to the overview page and to every service", () => {
  expect(getServicesNavLinks()).toEqual([
    { text: "Vue d'ensemble", href: "/services" },
    ...servicePages.map((page) => ({ text: page.navLabel, href: `/services/${page.slug}` })),
  ]);
});
