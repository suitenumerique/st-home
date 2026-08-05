import messages from "./messages";
import { type ServicePage } from "./types";

export * from "./types";

/**
 * Services that have their own page under /services/<slug>, in header dropdown
 * order. Adding a service here creates its route and its dropdown entry.
 */
const servicePages: ServicePage[] = [messages];

export function getServicePage(slug: string): ServicePage | undefined {
  return servicePages.find((page) => page.slug === slug);
}

export function getServicePageSlugs(): string[] {
  return servicePages.map((page) => page.slug);
}

export type ServicesNavLink = {
  text: string;
  href: string;
};

/**
 * Entries of the "Services numériques" header dropdown: the legacy CMS-driven
 * overview page, then the services that already have a dedicated page.
 */
export function getServicesNavLinks(): ServicesNavLink[] {
  return [
    { text: "Vue d'ensemble", href: "/services" },
    ...servicePages.map((page) => ({ text: page.navLabel, href: `/services/${page.slug}` })),
  ];
}
