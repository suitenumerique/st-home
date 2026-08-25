import { type IconProps } from "@/components/icons/uikit";
import { type ComponentType, type ReactNode } from "react";

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

/**
 * Declares the eligibility search under the hero: the same field, wording and
 * results on every service page, so only what differs between services lives
 * here. The block itself is in src/components/services/ServiceEligibility.tsx.
 */
export type ServiceEligibilitySearch = {
  /**
   * Documentation on running the service yourself, offered to the collectivités
   * above the ANCT thresholds. Without it, that result shows no primary button.
   */
  selfHostingUrl?: string;
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
  /** One of the ui-kit icons of src/components/icons/uikit.tsx. */
  icon: ComponentType<IconProps>;
  label: ReactNode;
};

/** Tint of a feature row's highlight bullets, from the DSFR palette. */
export type ServiceFeatureIconColor = "blue-ecume" | "yellow-tournesol" | "green-archipel";

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
  /** Tint of the highlight icons. Defaults to "blue-ecume". */
  iconColor?: ServiceFeatureIconColor;
  link?: ServiceLink;
  /** Omitted while the screenshot is not available: the row renders text-only. */
  screenshot?: ServiceIllustration;
};

export type ServiceFeaturesBlock = {
  rows: ServiceFeatureRow[];
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
  /**
   * Displayed above the quotes, typically towards the deployment map. Its label
   * is built from the number of collectivités having adopted the service, so
   * the link is dropped when that count is unavailable.
   */
  link?: {
    href: string;
    text: (adoptionCount: number) => ReactNode;
  };
  testimonials: ServiceTestimonial[];
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

export type ServicePage = {
  /** URL segment: /services/<slug>. */
  slug: string;
  /** Label in the "Services numériques" header dropdown. */
  navLabel: string;
  /**
   * `st_services.id` of the service, as used by the deployment map. Set it to
   * count how many collectivités have adopted the service.
   */
  deploymentServiceId?: number;
  seo: {
    title: string;
    description: string;
  };
  /** The only mandatory block. */
  hero: ServiceHeroBlock;
  features?: ServiceFeaturesBlock;
  testimonials?: ServiceTestimonialsBlock;
  faq?: ServiceFaqBlock;
};
