import { Commune, determineOnboardingCase } from "@/lib/onboarding";
import { OnboardingCase } from "@/types/onboarding";
import { describe, expect, it } from "vitest";
import testCommunes from "../data/dumps-sample/communes.json";
import testStructures from "../data/dumps-sample/structures.json";

// Helper function to prepare test data
function prepareTestCommune(communeData: any, structureIds: number[] = []): Commune {
  // Create base commune from test data
  const commune: Commune = {
    ...communeData,
    name_unaccent: communeData.name, // Add required field
    structures: [], // Will be populated if needed
  };

  // Add structures if provided
  if (structureIds.length > 0) {
    commune.structures = structureIds
      .map((id) => {
        const structure = testStructures.find((s) => s.id === id);
        if (!structure) return null;
        return {
          id: String(structure.id),
          name: structure.Nom,
          shortname: structure.Sigle,
          type: structure.Typologie,
          website: structure.Site_web,
        };
      })
      .filter(Boolean) as any;
  }

  return commune;
}

// Prepare test communes
const smallCommune = prepareTestCommune(testCommunes[0]); // L'Abergement-Clémenciat, pop 859
const communeWithOPSN = prepareTestCommune(testCommunes[0], [131]); // SIEA is an OPSN
const activeInRegieCommune = prepareTestCommune(testCommunes[3]); // Ambérieux-en-Dombes, st_active: true
const largeCommune = prepareTestCommune(testCommunes[2]); // Ambérieu-en-Bugey, pop 15554

describe("determineOnboardingCase", () => {
  // it("should return COMING_SOON when comingSoon option is true", () => {
  //   const result = determineOnboardingCase(smallCommune, { comingSoon: true });
  //   expect(result.onboardingCase).toBe(OnboardingCase.COMING_SOON);
  // });

  it("should return ERROR case when error is provided", () => {
    const result = determineOnboardingCase(null, {}, "Test error");
    expect(result.onboardingCase).toBe(OnboardingCase.ERROR);
    expect(result.error).toBe("Test error");
  });

  it("should return ACTIVE_IN_REGIE case when organization is active in Régie", () => {
    const result = determineOnboardingCase(activeInRegieCommune);
    expect(result.onboardingCase).toBe(OnboardingCase.ACTIVE_IN_REGIE);
  });

  // it("should return UNIQUE_CODE_REQUEST case when population is less than 3500", () => {
  //   const result = determineOnboardingCase(smallCommune);
  //   expect(result.onboardingCase).toBe(OnboardingCase.UNIQUE_CODE_REQUEST);
  //   expect(result.population).toBe(smallCommune.population);
  // });

  // it("should return CONTACT_US case when direct registration and population >= 3500", () => {
  //   const result = determineOnboardingCase(largeCommune, { direct: true });
  //   expect(result.onboardingCase).toBe(OnboardingCase.CONTACT_US);
  //   expect(result.population).toBe(largeCommune.population);
  // });

  // it("should return CONTACT_US case with structure info", () => {
  //   const result = determineOnboardingCase(communeWithOPSN, {
  //     structureId: "131",
  //     isExistingMember: true,
  //   });
  //   expect(result).toEqual({
  //     onboardingCase: OnboardingCase.CONTACT_US,
  //     structureId: "131",
  //     isExistingMember: true,
  //   });
  // });

  // it("should return ERROR case when structure is not found", () => {
  //   const result = determineOnboardingCase(communeWithOPSN, {
  //     structureId: "999",
  //   });
  //   expect(result).toEqual({
  //     onboardingCase: OnboardingCase.ERROR,
  //     error: "Structure introuvable",
  //   });
  // });

  it("should return OPSN_ZERO case by default when commune has no structures", () => {
    const result = determineOnboardingCase(largeCommune);
    expect(result).toEqual({
      onboardingCase: OnboardingCase.OPSN_ZERO,
      population: 15554,
    });
  });
  it("should return OPSN_CHOICE case by default when commune has structures", () => {
    const result = determineOnboardingCase(communeWithOPSN);
    expect(result).toEqual({
      onboardingCase: OnboardingCase.OPSN_CHOICE,
    });
  });
});
