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

/**
 * `id` of the hero eligibility search. Blocks further down the page link to it
 * to send visitors back up to the search instead of off to another page.
 */
export const ELIGIBILITY_SEARCH_ANCHOR = "modalites-acces";

/** Commune search sending visitors to their eligibility page (/bienvenue/[siret]). */
export type ServiceEligibilitySearch = {
  title: ReactNode;
  placeholder: string;
  /** Shorter placeholder used on small screens, where the full one is truncated. */
  placeholderSmallScreen: string;
};

export type ServiceHeroBlock = {
  /**
   * Service name. Displayed as the emphasized first line of the <h1>, unless
   * `logo` is set — it then only names the service for assistive technologies.
   */
  name: string;
  /** Logotype replacing the service name at the top of the <h1>. */
  logo?: Omit<ServiceIllustration, "alt">;
  /** Second line of the <h1>, in regular weight. */
  tagline: ReactNode;
  description: ReactNode;
  illustration?: ServiceIllustration;
  /** Product screenshot spanning the full viewport width, under the hero text. */
  screenshot?: ServiceIllustration;
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
  /** Monochrome pictogram, to the left of the card text. */
  icon: ServiceIllustration;
  /** Doubles as the card's link. */
  title: ReactNode;
  href: string;
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

export type ServiceTestimonial = {
  quote: ReactNode;
  /** The collectivité behind the quote, displayed under it. */
  author: ReactNode;
};

/**
 * Quotes from collectivités using the service, shown one at a time with
 * previous/next controls.
 */
export type ServiceTestimonialsBlock = {
  /** Displayed above the quotes, typically towards the deployment map. */
  link?: ServiceLink;
  testimonials: ServiceTestimonial[];
};

/** One of the pillars of the "fondements essentiels" block. */
export type ServiceFoundation = {
  icon: ServiceIllustration;
  title: ReactNode;
  description: ReactNode;
};

/**
 * Closing block: what every service of the Suite guarantees, followed by an
 * invitation to contribute.
 */
export type ServiceFoundationsBlock = {
  title: ReactNode;
  description: ReactNode;
  foundations: ServiceFoundation[];
  callToAction?: {
    text: ReactNode;
    primaryLink: ServiceLink;
    secondaryLink?: ServiceLink;
  };
};

export type ServiceFaqItem = {
  question: ReactNode;
  /** Non-nullable: it is the content of the DSFR accordion. */
  answer: NonNullable<ReactNode>;
};

/** Frequently asked questions, one accordion per question. */
export type ServiceFaqBlock = {
  title: ReactNode;
  /** Sits under the title, typically pointing at the help centre. */
  description?: ReactNode;
  items: ServiceFaqItem[];
};

/**
 * Closing call to action, reusing the shared "Intéressé ? Testez !" visual of
 * the other pages.
 */
export type ServiceTrialBlock = {
  /** Primary button, typically back up to the hero eligibility search. */
  accessLink: ServiceLink;
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
  testimonials?: ServiceTestimonialsBlock;
  foundations?: ServiceFoundationsBlock;
  faq?: ServiceFaqBlock;
  trial?: ServiceTrialBlock;
};
