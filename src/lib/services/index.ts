import annuaire from "./annuaire";
import domaines from "./domaines";
import fichiers from "./fichiers";
import mesAdresses from "./mes-adresses";
import messages from "./messages";
import proconnect from "./proconnect";
import rendezVous from "./rendez-vous";
import { type ServicePage } from "./types";

export * from "./types";

export const servicePages: ServicePage[] = [
  proconnect,
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
