export type ServicesNavLink = {
  text: string;
  href: string;
};

export const servicesNav: { slug: string; navLabel: string }[] = [
  { slug: "proconnect", navLabel: "ProConnect" },
  { slug: "domaines", navLabel: "Domaines" },
  { slug: "messages", navLabel: "Messages" },
  { slug: "fichiers", navLabel: "Fichiers" },
  { slug: "rendez-vous", navLabel: "Rendez-vous Service Public" },
  { slug: "annuaire", navLabel: "Annuaire des collectivités" },
  { slug: "mes-adresses", navLabel: "Mes Adresses" },
];

export function getServicesNavLinks(): ServicesNavLink[] {
  return [
    { text: "Vue d'ensemble", href: "/services" },
    ...servicesNav.map(({ slug, navLabel }) => ({ text: navLabel, href: `/services/${slug}` })),
  ];
}
