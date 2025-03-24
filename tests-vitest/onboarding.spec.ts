import { Commune, determineOnboardingCase } from "@/lib/onboarding";
import { OnboardingCase } from "@/types/onboarding";
import { describe, expect, it } from "vitest";
import testCommunes from "../data/test-communes.json";
import testStructures from "../data/test-structures.json";

// Helper function to prepare test data
function prepareTestCommune(
  communeData: any,
  structureIds: number[] = [],
): Commune {
  // Map the JSON structure to our Commune type
  const commune: Commune = {
    siret: communeData.SIRET,
    siren: communeData.SIREN,
    name: communeData.nom,
    name_unaccent: communeData.nom,
    slug: communeData.nom.toLowerCase().replace(/\s+/g, '-'),
    insee_geo: communeData.insee_geo,
    zipcode: communeData.cp,
    population: communeData.pmun_2024,
    website_url: null,
    website_domain: null,
    website_tld: null,
    website_compliant: false,
    domain_ownership: null,
    email_official: null,
    email_domain: null,
    email_compliant: false,
    epci_name: null,
    epci_siren: null,
    epci_population: null,
    active_in_regie: false,
    url_service_public: null,
    structures: [],
  };

  // Add structures if provided
  if (structureIds.length > 0) {
    commune.structures = structureIds
      .map((id) => {
        const structureData = testStructures.find((s) => s.id === id);
        if (!structureData) return null;

        return {
          id: String(structureData.id),
          name: structureData.Nom,
          shortname: structureData.Sigle,
          type: structureData.Typologie,
          website: structureData.Site_web,
        };
      })
      .filter(Boolean) as any;
  }

  return commune;
}

// Prepare test communes
const smallCommune = prepareTestCommune({
  ...testCommunes[0],
  pmun_2024: 821, // L'Abergement-Clémenciat has population < 3500
});

const communeWithOPSN = prepareTestCommune(testCommunes[0], [131]); // SIEA is an OPSN

// Create test communes for each case
const activeInRegieCommune = prepareTestCommune(testCommunes[0]);
const proConnectEnabledCommune = prepareTestCommune(testCommunes[0]);

describe("determineOnboardingCase", () => {


  it("should return COMING_SOON when comingSoon option is true", () => {
    const result = determineOnboardingCase(smallCommune, { comingSoon: true });
    expect(result.onboardingCase).toBe(OnboardingCase.COMING_SOON);
  });

  it("should return ERROR case when error is provided", () => {
    const result = determineOnboardingCase(null, {}, "Test error");
    expect(result.onboardingCase).toBe(OnboardingCase.ERROR);
    expect(result.error).toBe("Test error");
  });

  it("should return ACTIVE_IN_REGIE case when organization is active in Régie", () => {
    const communeWithRegie = { ...activeInRegieCommune, active_in_regie: true };
    const result = determineOnboardingCase(communeWithRegie);

    expect(result.onboardingCase).toBe(OnboardingCase.ACTIVE_IN_REGIE);
  });

  // it("should return OPSN_PROCONNECT case when OPSN is ProConnect enabled", () => {
  //   const communeWithProConnect = {
  //     ...proConnectEnabledCommune,
  //     siret: "21010002000010",
  //   };
  //   const result = determineOnboardingCase(communeWithProConnect);

  //   expect(result.onboardingCase).toBe(OnboardingCase.OPSN_PROCONNECT);
  //   expect(result.isProConnectEnabled).toBe(true);
  // });

  // it("should return OPSN_CHOICE case when OPSN is ProConnect enabled and has structures", () => {
  //   const communeWithProConnectAndStructures = {
  //     ...proConnectEnabledCommune,
  //     siret: "21010002000010",
  //     structures: [{ id: "1", name: "Test Structure" }],
  //   };
  //   const result = determineOnboardingCase(communeWithProConnectAndStructures);

  //   expect(result.onboardingCase).toBe(OnboardingCase.OPSN_CHOICE);
  //   expect(result.isProConnectEnabled).toBe(true);
  // });

  it("should return UNIQUE_CODE_REQUEST case when population is less than 3500", () => {
    const result = determineOnboardingCase(smallCommune);

    expect(result.onboardingCase).toBe(OnboardingCase.UNIQUE_CODE_REQUEST);
    expect(result.population).toBe(smallCommune.population);
  });

  it("should return CONTACT_US case when direct registration and population >= 3500", () => {
    const largeCommune = { ...activeInRegieCommune, population: 5000 };
    const result = determineOnboardingCase(largeCommune, { direct: true });

    expect(result.onboardingCase).toBe(OnboardingCase.CONTACT_US);
    expect(result.population).toBe(5000);
  });

  it("should return CONTACT_US case with structure info", () => {
    const commune = {
      ...activeInRegieCommune,
      structures: [{ id: "test-structure", name: "Test Structure" }],
    } as Commune;
    const result = determineOnboardingCase(commune, {
      structureId: "test-structure",
      isExistingMember: true,
    });
    expect(result).toEqual({
      onboardingCase: OnboardingCase.CONTACT_US,
      structureId: "test-structure",
      isExistingMember: true,
    });
  });

  it("should return ERROR case when structure is not found", () => {
    const commune = {
      ...activeInRegieCommune,
      structures: [{ id: "existing-structure", name: "Test Structure" }],
    } as Commune;
    const result = determineOnboardingCase(commune, {
      structureId: "non-existing-structure",
    });
    expect(result).toEqual({
      onboardingCase: OnboardingCase.ERROR,
      error: "Structure introuvable",
    });
  });

  it("should return OPSN_CHOICE case by default when commune has structures", () => {
    const commune = {
      ...activeInRegieCommune,
      structures: [{ id: "1", name: "Test Structure" }],
    } as Commune;
    const result = determineOnboardingCase(commune);
    expect(result).toEqual({
      onboardingCase: OnboardingCase.OPSN_CHOICE,
    });
  });

  it("should return COMING_SOON case when comingSoon option is true", () => {
    const result = determineOnboardingCase(smallCommune, { comingSoon: true });
    expect(result.onboardingCase).toBe(OnboardingCase.COMING_SOON);
  });
});
