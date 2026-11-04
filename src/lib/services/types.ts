import { type IconProps } from "@/components/icons/uikit";
import { type ComponentType, type ReactNode } from "react";

// A service page is described by data, not by a bespoke page component: every
// service renders the same blocks in the same order, and a block is displayed
// only when the service declares it. New blocks get a type here and a component
// in src/components/services/, wired once in src/pages/services/[slug].tsx.

/**
 * Illustration displayed next to the hero text. `width` and `height` are the
 * file's; the file is exported at twice its displayed width, no more (see
 * "Images des pages services" in the README).
 */
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
 * Widest a full-width image inside `fr-container` is ever laid out: the
 * container caps at 78rem and keeps 1.5rem of padding on each side. `sizes`
 * must state this rather than the 78rem, because 1200 is one of Next's
 * `deviceSizes` and anything above it costs the 1920 variant instead.
 */
export const CONTAINER_CONTENT_WIDTH = 1248 - 48;

/**
 * Width of the hero text and of the illustration facing it, as columns of the
 * twelve of the DSFR grid. Spelled out rather than computed: `fr.cx` takes the
 * class names as literals.
 */
export const HERO_COLUMN_SPLIT = {
  6: ["fr-col-md-6", "fr-col-md-6"],
  7: ["fr-col-md-7", "fr-col-md-5"],
  8: ["fr-col-md-8", "fr-col-md-4"],
  9: ["fr-col-md-9", "fr-col-md-3"],
} as const;

export type HeroTextColumns = keyof typeof HERO_COLUMN_SPLIT;

/** Columns taken by the hero text when the service does not say otherwise. */
export const DEFAULT_HERO_TEXT_COLUMNS: HeroTextColumns = 7;

export type ServiceHeroBlock = {
  /**
   * Service name. Displayed as the emphasized first line of the <h1>, unless
   * `logo` is set: it then only names the service for assistive technologies.
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
  /** Primary action under the description, for the services that need no search. */
  cta?: ServiceLink;
  /**
   * Columns of twelve taken by the text next to the illustration, which takes
   * the rest. Widen it for a long tagline, so that the title reads on two lines
   * as it does on the other services. Ignored without an illustration.
   */
  textColumns?: HeroTextColumns;
  /**
   * Set to show the eligibility search under the hero. Nothing about it varies
   * between services, so it is a flag rather than a block: the field, wording
   * and results live in src/components/services/ServiceEligibility.tsx.
   * Omitted for services whose access does not depend on the collectivité.
   */
  eligibilitySearch?: boolean;
};

/** One "icon + label" entry of a feature row's list. */
export type ServiceFeatureHighlight = {
  /** One of the ui-kit icons of src/components/icons/uikit.tsx. */
  icon: ComponentType<IconProps>;
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
  /** Keep the title on one line from the full container width up. */
  titleOnOneLine?: boolean;
  description: ReactNode;
  /** Omitted for the rows that are prose only. */
  highlights?: ServiceFeatureHighlight[];
  /** Lay the highlights out on two columns instead of one. */
  highlightColumns?: 1 | 2;
  link?: ServiceLink;
  /** Omitted while the screenshot is not available: the row renders text-only. */
  screenshot?: ServiceIllustration;
};

export type ServiceFeaturesBlock = {
  rows: ServiceFeatureRow[];
};

/** One numbered card of the steps block. */
export type ServiceStep = {
  /** Doubles as the card's link when `href` is set. */
  title: ReactNode;
  description: ReactNode;
  href?: string;
};

/**
 * Numbered steps under the hero: what the visitor has to do, in order. Sits
 * before the feature rows.
 */
export type ServiceStepsBlock = {
  title: ReactNode;
  description: ReactNode;
  /** Rendered as a numbered card each, in order. */
  steps: ServiceStep[];
  link?: ServiceLink;
};

export type ServiceOfferItem = {
  label: ReactNode;
  tooltip?: ReactNode;
};

export type ServiceOffer = {
  /** Displayed in capitals next to the logo. */
  name: string;
  logo: Omit<ServiceIllustration, "alt">;
  tagline: ReactNode;
  price: ReactNode;
  yearlyPrice: ReactNode;
  included: ServiceOfferItem[];
  options?: ServiceOfferItem[];
  link: ServiceLink;
};

export type ServiceOffersBlock = {
  /** Anchor of the block, for the links of the page pointing at the offers. */
  id: string;
  title: ReactNode;
  description: ReactNode;
  offers: ServiceOffer[];
  /** Next to each price, its asterisk pointing at the footnote. */
  priceTerms: ReactNode;
  footnote: ReactNode;
  link?: ServiceLink & { lead: ReactNode };
};

export type ServiceTimelineBlock = {
  title: ReactNode;
  description: ReactNode;
  steps: ServiceLink[];
};

export type DeploymentStatKey = "identityProviders" | "proconnectedOrganizations";

export type DeploymentStats = Record<DeploymentStatKey, number>;

export type ServiceShowcaseStat = {
  stat: DeploymentStatKey;
  label: ReactNode;
};

export type ServiceShowcaseBlock = {
  title: ReactNode;
  description: ReactNode;
  card: {
    title: ReactNode;
    description: ReactNode;
    stats: ServiceShowcaseStat[];
    background: ServiceIllustration;
  };
};

export type ServicePrerequisitesBlock = {
  title: ReactNode;
  description: ReactNode;
  /** The cards are drawn in the images, titles included: the alt text carries them. */
  illustrations: (ServiceIllustration & { fullWidth?: boolean; href?: string })[];
};

export type ServiceCaseStep = {
  title: ReactNode;
  description: ReactNode;
};

export type ServiceCase = {
  title: ReactNode;
  description?: ReactNode;
  steps?: ServiceCaseStep[];
  cta?: ServiceLink & { priority?: "primary" | "secondary" };
};

export type ServiceCasesBlock = {
  title: ReactNode;
  description: ReactNode;
  columns: ServiceCase[][];
};

export type ServiceCriterion = {
  title: ReactNode;
  description: ReactNode;
  illustration: ServiceIllustration;
};

export type ServiceCriteriaBlock = {
  title: ReactNode;
  description: ReactNode;
  criteria: ServiceCriterion[];
  link?: ServiceLink;
};

/**
 * A tinted band pointing somewhere off the page, between two sections. Its
 * illustration stands on the bottom edge of the band.
 */
export type ServiceBannerBlock = {
  title: ReactNode;
  description: ReactNode;
  link: ServiceLink;
  illustration?: ServiceIllustration;
};

/**
 * The national partners of a service, as a row of logos. Each logo is laid out
 * to the same height, so its declared size only carries its ratio.
 */
export type ServicePartnerLogo = ServiceIllustration & {
  /** Displayed height, for the logos that do not sit on the shared one. */
  displayHeight?: number;
  /** Makes the logo a link to the partner's site. */
  href?: string;
};

export type ServicePartnersBlock = {
  title: ReactNode;
  description: ReactNode;
  logos: ServicePartnerLogo[];
  link?: ServiceLink;
  tinted?: boolean;
  logosAlign?: "spread" | "right";
  /** Columns out of 12 for the text on a wide screen, 4 by default. */
  textColumns?: 4 | 5;
};

export type ServiceTestimonial = {
  quote: ReactNode;
  /** The collectivité behind the quote, displayed under it. */
  author: ReactNode;
  /** Where the quote was published, when it comes from an article. */
  link?: ServiceLink;
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

/**
 * Wording of the closing call to action: "Intéressé ? Démarrez !" reads as
 * `lead` then `action`, the second half carrying the emphasis.
 */
export type ServiceTrialHeading = {
  lead: string;
  action: string;
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
  /**
   * Source repository of the service, linked from the "fondements" block.
   * Defaults to this site's own repository.
   */
  repositoryUrl?: string;
  /** The ProConnect block is on every service page; set false to drop it. */
  proConnect?: boolean;
  /** The "fondements essentiels" block, likewise. */
  foundations?: boolean;
  /** Defaults to "Intéressé ? Testez !". */
  trialHeading?: ServiceTrialHeading;
  /**
   * Primary button of the closing block, before "Nous contacter". Services with
   * an eligibility search point at it instead, and need no `trialCta`.
   */
  trialCta?: ServiceLink;
  /** The only mandatory block. */
  hero: ServiceHeroBlock;
  showcase?: ServiceShowcaseBlock;
  prerequisites?: ServicePrerequisitesBlock;
  timeline?: ServiceTimelineBlock;
  /** The ProConnect email check, under the timeline. */
  emailCheck?: boolean;
  /** The domain check, under the prerequisites, its links pointing at this anchor. */
  domainCheck?: { offersHref: string };
  cases?: ServiceCasesBlock;
  criteria?: ServiceCriteriaBlock;
  steps?: ServiceStepsBlock;
  offers?: ServiceOffersBlock;
  banner?: ServiceBannerBlock;
  partners?: ServicePartnersBlock;
  features?: ServiceFeaturesBlock;
  testimonials?: ServiceTestimonialsBlock;
  faq?: ServiceFaqBlock;
};
