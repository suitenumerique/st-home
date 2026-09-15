import annuaire from "./annuaire";
import domaines from "./domaines";
import fichiers from "./fichiers";
import mesAdresses from "./mes-adresses";
import messages from "./messages";
import rendezVous from "./rendez-vous";
import { type ServicePage } from "./types";

export * from "./types";

/**
 * Services that have their own page under /services/<slug>, in header dropdown
 * order. Adding a service here creates its route; its dropdown entry lives in
 * `./nav`, which the layout imports instead of this module.
 */
export const servicePages: ServicePage[] = [
  domaines,
  messages,
  fichiers,
  rendezVous,
  annuaire,
  mesAdresses,
];

export function getServicePage(slug: string): ServicePage | undefined {
  return servicePages.find((page) => page.slug === slug);
}

export function getServicePageSlugs(): string[] {
  return servicePages.map((page) => page.slug);
}

export * from "./nav";
