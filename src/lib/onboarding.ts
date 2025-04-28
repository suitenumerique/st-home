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
  structureId?: string | null;
  isExistingMember?: boolean;
}

export interface OnboardingOptions {
  structureId?: string | null;
  isExistingMember?: boolean;
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

  // Check if organization is active in Régie
  if (commune.st_active) {
    return {
      onboardingCase: OnboardingCase.ACTIVE_IN_REGIE,
    };
  }

  // // No OPSNs available
  if (commune.structures?.length === 0) {
    // Not eligible
    if (commune.st_eligible === false) {
      return {
        onboardingCase: OnboardingCase.NOT_ELIGIBLE,
        population: commune.population,
      };
    } else {
      return {
        onboardingCase: OnboardingCase.OPSN_ZERO,
        population: commune.population,
      };
    }
  }

  // Show the choice view because the commune has structures
  return {
    onboardingCase: OnboardingCase.OPSN_CHOICE,
    structureId: options.structureId,
  };
}
