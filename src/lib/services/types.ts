import { type IconProps } from "@/components/icons/uikit";
import { type ComponentType, type ReactNode } from "react";

/** Illustration displayed next to the hero text. */
export type ServiceIllustration = {
  src: string;
  /** Empty string when the illustration is purely decorative. */
  alt: string;
  width: number;
  height: number;
};

export const ELIGIBILITY_SEARCH_ANCHOR = "modalites-acces";

export const CONTAINER_CONTENT_WIDTH = 1248 - 48;

export const HERO_COLUMN_SPLIT = {
  6: ["fr-col-md-6", "fr-col-md-6"],
  7: ["fr-col-md-7", "fr-col-md-5"],
  8: ["fr-col-md-8", "fr-col-md-4"],
  9: ["fr-col-md-9", "fr-col-md-3"],
} as const;

export type HeroTextColumns = keyof typeof HERO_COLUMN_SPLIT;

export const DEFAULT_HERO_TEXT_COLUMNS: HeroTextColumns = 7;

export type ServiceHeroBlock = {
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
  textColumns?: HeroTextColumns;
  eligibilitySearch?: boolean;
};

export type ServiceFeatureHighlight = {
  icon: ComponentType<IconProps>;
  label: ReactNode;
};

export type ServiceLink = {
  text: string;
  href: string;
};

export type ServiceFeatureRow = {
  title: ReactNode;
  titleOnOneLine?: boolean;
  description: ReactNode;
  highlights?: ServiceFeatureHighlight[];
  highlightColumns?: 1 | 2;
  link?: ServiceLink;
  screenshot?: ServiceIllustration;
};

export type ServiceFeaturesBlock = {
  rows: ServiceFeatureRow[];
};

export type ServiceStep = {
  title: ReactNode;
  description: ReactNode;
  href?: string;
};

export type ServiceStepsBlock = {
  title: ReactNode;
  description: ReactNode;
  steps: ServiceStep[];
  link?: ServiceLink;
};

export type ServiceShowcaseBlock = {
  title: ReactNode;
  description: ReactNode;
  illustration: ServiceIllustration;
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

export type ServiceHelpArticle = {
  title: ReactNode;
  description?: ReactNode;
  href: string;
};

export type ServiceHelpBlock = {
  title: ReactNode;
  description: ReactNode;
  articles: ServiceHelpArticle[];
};

export type ServiceBannerBlock = {
  title: ReactNode;
  description: ReactNode;
  link: ServiceLink;
  illustration?: ServiceIllustration;
};

export type ServicePartnerLogo = ServiceIllustration & {
  displayHeight?: number;
};

export type ServicePartnersBlock = {
  title: ReactNode;
  description: ReactNode;
  logos: ServicePartnerLogo[];
  link?: ServiceLink;
  tinted?: boolean;
  logosAlign?: "spread" | "right";
};

export type ServiceTestimonial = {
  quote: ReactNode;
  author: ReactNode;
  link?: ServiceLink;
};

export type ServiceTestimonialsBlock = {
  link?: {
    href: string;
    text: (adoptionCount: number) => ReactNode;
  };
  testimonials: ServiceTestimonial[];
};

export type ServiceFaqItem = {
  question: ReactNode;
  answer: NonNullable<ReactNode>;
};

export type ServiceFaqBlock = {
  title: ReactNode;
  description?: ReactNode;
  items: ServiceFaqItem[];
};

export type ServiceTrialHeading = {
  lead: string;
  action: string;
};

export type ServicePage = {
  slug: string;
  navLabel: string;
  deploymentServiceId?: number;
  seo: {
    title: string;
    description: string;
  };
  repositoryUrl?: string;
  proConnect?: boolean;
  foundations?: boolean;
  trialHeading?: ServiceTrialHeading;
  trialCta?: ServiceLink;
  hero: ServiceHeroBlock;
  showcase?: ServiceShowcaseBlock;
  cases?: ServiceCasesBlock;
  criteria?: ServiceCriteriaBlock;
  help?: ServiceHelpBlock;
  steps?: ServiceStepsBlock;
  banner?: ServiceBannerBlock;
  partners?: ServicePartnersBlock;
  features?: ServiceFeaturesBlock;
  testimonials?: ServiceTestimonialsBlock;
  faq?: ServiceFaqBlock;
};
