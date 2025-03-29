import { mutualizationStructures, organizations } from "@/lib/schema";
import { OnboardingCase } from "@/types/onboarding";
import { type InferSelectModel } from "drizzle-orm";

// Define types from Drizzle schema
export type Organization = InferSelectModel<typeof organizations>;
export type Structure = InferSelectModel<typeof mutualizationStructures>;

// Define the commune type with optional structures
export type Commune = Organization & {
  structures?: Structure[];
};

export interface OnboardingProps {
  onboardingCase: OnboardingCase;
  error?: string;
  population?: number;
  isProConnectEnabled?: boolean;
  structureId?: string;
  isExistingMember?: boolean;
}

export interface OnboardingOptions {
  direct?: boolean;
  structureId?: string;
  isExistingMember?: boolean;
  comingSoon?: boolean;
}

/**
 * Determines the onboarding case based on the available data
 */
export function determineOnboardingCase(
  commune: Commune | null,
  options: OnboardingOptions = {},
  error?: string,
): OnboardingProps {
  // Error case
  if (error || !commune) {
    return {
      onboardingCase: OnboardingCase.ERROR,
      error: error || "Commune introuvable",
    };
  }

  // Coming soon case
  if (options.comingSoon) {
    return {
      onboardingCase: OnboardingCase.COMING_SOON,
    };
  }

  // Check if organization is active in Régie
  if (commune.st_active) {
    return {
      onboardingCase: OnboardingCase.ACTIVE_IN_REGIE,
    };
  }

  // Direct registration path
  if (options.direct || commune.structures?.length === 0) {
    return {
      onboardingCase:
        commune.population <= 3500
          ? OnboardingCase.UNIQUE_CODE_REQUEST
          : OnboardingCase.CONTACT_US,
      population: commune.population,
    };
  }

  // If a structureId is provided, go directly to contact form
  if (options.structureId) {
    // Check if the ID belongs to a mutualization structure
    const structure = commune.structures?.find(
      (structure) => structure.id === options.structureId,
    );
    if (structure) {
      return {
        onboardingCase: OnboardingCase.CONTACT_US,
        structureId: options.structureId,
        isExistingMember: options.isExistingMember,
      };
    } else {
      return {
        onboardingCase: OnboardingCase.ERROR,
        error: "Structure introuvable",
      };
    }
  }

  // Show the choice view because the commune has structures
  return {
    onboardingCase: OnboardingCase.OPSN_CHOICE,
  };
}
