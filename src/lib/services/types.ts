import { type FrIconClassName, type RiIconClassName } from "@codegouvfr/react-dsfr";
import { type ReactNode } from "react";

// A service page is described by data, not by a bespoke page component: every
// service renders the same blocks in the same order, and a block is displayed
// only when the service declares it. New blocks get a type here and a component
// in src/components/services/, wired once in src/pages/services/[slug].tsx.

/** Illustration displayed next to the hero text. */
export type ServiceIllustration = {
  src: string;
  /** Empty string when the illustration is purely decorative. */
  alt: string;
  width: number;
  height: number;
};

/** Commune search sending visitors to their eligibility page (/bienvenue/[siret]). */
export type ServiceEligibilitySearch = {
  title: ReactNode;
  placeholder: string;
  /** Shorter placeholder used on small screens, where the full one is truncated. */
  placeholderSmallScreen: string;
};

export type ServiceHeroBlock = {
  /** Service name, emphasized first line of the <h1>. */
  name: string;
  /** Second line of the <h1>, in regular weight. */
  tagline: ReactNode;
  description: ReactNode;
  illustration?: ServiceIllustration;
  /** Omitted for services whose access does not depend on the collectivité. */
  eligibilitySearch?: ServiceEligibilitySearch;
};

/** One "icon + label" entry of a feature row's list. */
export type ServiceFeatureHighlight = {
  icon: FrIconClassName | RiIconClassName;
  label: ReactNode;
};

export type ServiceLink = {
  text: string;
  href: string;
};

/**
 * A feature row: text on one side, screenshot on the other. Rows alternate
 * sides automatically, so the order in the array is the order on the page.
 */
export type ServiceFeatureRow = {
  title: ReactNode;
  description: ReactNode;
  highlights: ServiceFeatureHighlight[];
  /** Lay the highlights out on two columns instead of one. */
  highlightColumns?: 1 | 2;
  link?: ServiceLink;
  /** Omitted while the screenshot is not available: the row renders text-only. */
  screenshot?: ServiceIllustration;
};

export type ServiceFeaturesBlock = {
  rows: ServiceFeatureRow[];
};

/** One of the bordered cards of the ProConnect block. */
export type ServiceProConnectCard = {
  icon: FrIconClassName | RiIconClassName;
  title: ReactNode;
  description: ReactNode;
};

/**
 * Centered block explaining how ProConnect gates access to the service. Its
 * wording is service-specific, so each service declares its own.
 */
export type ServiceProConnectBlock = {
  logo?: ServiceIllustration;
  title: ReactNode;
  description: ReactNode;
  cards: ServiceProConnectCard[];
  link?: ServiceLink;
};

export type ServicePage = {
  /** URL segment: /services/<slug>. */
  slug: string;
  /** Label in the "Services numériques" header dropdown. */
  navLabel: string;
  seo: {
    title: string;
    description: string;
  };
  /** The only mandatory block. */
  hero: ServiceHeroBlock;
  features?: ServiceFeaturesBlock;
  proConnect?: ServiceProConnectBlock;
};
