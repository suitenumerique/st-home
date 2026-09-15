/**
 * Entries of the "Services numériques" header dropdown, in order: the legacy
 * CMS-driven overview page, then the services that already have a dedicated
 * page under /services/<slug>.
 *
 * Deliberately kept out of `./index`, which holds the full content of all six
 * service pages: `PageLayout` needs these links on every page of the site, so
 * importing `./index` there would put every service definition — FAQs,
 * testimonials, the ui-kit icons — in the shared `_app` bundle.
 *
 * `tests-vitest/servicesNav.test.ts` keeps this list in sync with the service
 * pages themselves.
 */

export type ServicesNavLink = {
  text: string;
  href: string;
};

/** Slug and dropdown label of each service page, in dropdown order. */
export const servicesNav: { slug: string; navLabel: string }[] = [
  { slug: "domaines", navLabel: "Domaines" },
  { slug: "messages", navLabel: "Messages" },
  { slug: "fichiers", navLabel: "Fichiers" },
  { slug: "rendez-vous", navLabel: "Rendez-vous" },
  { slug: "annuaire", navLabel: "Annuaire des collectivités" },
  { slug: "mes-adresses", navLabel: "Mes Adresses" },
];

export function getServicesNavLinks(): ServicesNavLink[] {
  return [
    { text: "Vue d'ensemble", href: "/services" },
    ...servicesNav.map(({ slug, navLabel }) => ({ text: navLabel, href: `/services/${slug}` })),
  ];
}
