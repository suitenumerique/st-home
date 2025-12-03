import {
  findAllServices,
  findOrganizationBySiren,
  findOrganizationServicesBySiret,
  findOrganizationsWithStructures,
} from "@/lib/db";
// import { getOrganizationTypeDisplay, type Organization } from "@/lib/string";
import type { Service } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";

// Import view components
import Newsletter from "@/components/Newsletter";
import ErrorView from "@/components/onboarding/ErrorView";
import MutualisationView from "@/components/onboarding/MutualisationView";
import OPSNServicesView from "@/components/onboarding/OPSNServicesView";
import OrganisationPresenceView from "@/components/onboarding/OrganisationPresenceView";
import OtherServicesView from "@/components/onboarding/OtherServicesView";
import SuiteServicesView from "@/components/onboarding/SuiteServicesView";
import UsedServicesView from "@/components/onboarding/UsedServicesView";
import TrialContact from "@/components/TrialContact";
// import ActiveInRegieView from "@/components/onboarding/ActiveInRegieView";
// import NotEligibleView from "@/components/onboarding/NotEligibleView";
// import OPSNChoiceView from "@/components/onboarding/OPSNChoiceView";
// import OPSNProConnectView from "@/components/onboarding/OPSNProConnectView";
// import OPSNZeroView from "@/components/onboarding/OPSNZeroView";
// import UniqueCodeRequestView from "@/components/onboarding/UniqueCodeRequestView";

// Import types and functions
import { determineOnboardingCase, type Commune, type OnboardingProps } from "@/lib/onboarding";
import { OnboardingCase } from "@/types/onboarding";

interface PageProps extends OnboardingProps {
  commune?: Commune & { epci_siret?: string };
  allServices: Service[];
  usedServicesIds: number[];
}

export default function Bienvenue(props: PageProps) {
  const { commune, onboardingCase, error, allServices = [], usedServicesIds = [] } = props;

  const usedServices = usedServicesIds
    .map((id) => allServices.find((s) => s.id === id))
    .filter((s) => s !== undefined);

  const opsnServices = ["Messages", "Fichiers", "Rendez-vous", "Projets"]
    .map((name) => allServices.find((s) => s.name === name))
    .filter((s) => s && !usedServices.find((us) => us.id === s.id));

  const suiteServices = [
    "Domaine collectivite.fr",
    "Espace sur demande",
    "Mon suivi social",
    "Deveco",
    "Annuaire des collectivités",
    "Grist",
    "Adresses",
    "Agents en intervention",
  ]
    .map((name) => allServices.find((s) => s.name === name))
    .filter((s) => s && !usedServices.find((us) => us.id === s.id));

  // const getCommuneContent = (_commune: Commune) => {
  //   switch (onboardingCase) {
  //     case OnboardingCase.ACTIVE_IN_REGIE:
  //       return <ActiveInRegieView commune={_commune} />;
  //     case OnboardingCase.OPSN_CHOICE:
  //       if (!_commune.structures) {
  //         return <ErrorView error="Configuration invalide" />;
  //       }
  //       return <OPSNChoiceView commune={{ ..._commune, structures: _commune.structures }} />;
  //     case OnboardingCase.OPSN_PROCONNECT:
  //       return <OPSNProConnectView commune={_commune} />;
  //     case OnboardingCase.OPSN_ZERO:
  //       return <OPSNZeroView commune={_commune} />;
  //     case OnboardingCase.NOT_ELIGIBLE:
  //       return <NotEligibleView commune={_commune} />;

  //     case OnboardingCase.UNIQUE_CODE_REQUEST:
  //       return <UniqueCodeRequestView commune={_commune} />;
  //     default:
  //       return <ErrorView error="Cas non géré" />;
  //   }
  // };

  // Get the main content based on the onboarding case
  const GetMainContent = () => {
    if (!commune || onboardingCase === OnboardingCase.ERROR) {
      return <ErrorView error={error} />;
    }

    return (
      <div className={fr.cx("fr-mb-4w")}>
        <h1
          className={fr.cx("fr-h1", "fr-mb-4w")}
          style={{ color: "var(--text-title-blue-france)" }}
        >
          {commune.name}
          <span className={fr.cx("fr-text--regular")} style={{ fontSize: "2rem" }}>
            {" "}
            · {commune.type === "commune" ? ` ${commune.zipcode}` : ` ${commune.insee_dep}`}
          </span>
        </h1>

        <div className={fr.cx("fr-mb-11w")}>
          <OrganisationPresenceView organisation={commune as Commune} />
        </div>

        {usedServices.length > 0 && (
          <div className={fr.cx("fr-mb-11w")}>
            <UsedServicesView services={usedServices} />
          </div>
        )}

        {commune.st_eligible && commune.structures && commune.structures.length > 0 && (
          <div className={fr.cx("fr-mb-11w")}>
            <OPSNServicesView services={opsnServices as Service[]} commune={commune as Commune} />
          </div>
        )}

        <div className={fr.cx("fr-mb-11w")}>
          <SuiteServicesView services={suiteServices as Service[]} />
        </div>

        {!commune.st_eligible && (
          <div className={fr.cx("fr-mb-11w")}>
            <MutualisationView
              services={allServices as Service[]}
              organisation={commune as Commune}
            />
          </div>
        )}

        <div className={fr.cx("fr-mb-11w")}>
          <OtherServicesView organisation={commune as Commune} />
        </div>

        {/* <DepartmentPresenceView organisation={commune as Commune} /> */}
      </div>
    );
  };

  const currentPageBreadcrumbs = [
    {
      label: "Présentation",
      linkProps: {
        href: "/",
      },
    },
    {
      label: "Présence numérique des collectivités",
      linkProps: {
        href: "/conformite/referentiel",
      },
    },
  ];

  if (commune?.type === "commune") {
    currentPageBreadcrumbs.push({
      label: `${commune.epci_name} · ${commune.insee_dep}`,
      linkProps: {
        href: `/bienvenue/${commune.epci_siret}`,
      },
    });
  }

  let currentPageLabel;

  if (
    !commune?.type ||
    !commune.name ||
    (commune.type === "commune" && (!commune.zipcode || !commune.epci_name)) ||
    (commune.type === "epci" && !commune.insee_dep)
  ) {
    currentPageLabel = "Présence numérique des collectivités";
  } else {
    currentPageLabel = {
      commune: `${commune.name} · ${commune.zipcode}`,
      epci: `${commune.name} · ${commune.insee_dep}`,
    }[commune?.type];
  }

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #FEF5E8 0%, #FEF5E8 50%, #FFFFFF 100%)",
        backgroundSize: "100% 400px",
        backgroundRepeat: "no-repeat",
        paddingTop: "1px",
      }}
    >
      <section className={fr.cx("fr-container") + " st-bienvenue-page"}>
        <NextSeo
          title={currentPageLabel}
          description="Test d'éligibilité à la Suite territoriale"
        />
        <div>
          <Breadcrumb currentPageLabel={currentPageLabel} segments={currentPageBreadcrumbs} />
        </div>
        {GetMainContent()}
      </section>
      <section className={fr.cx("fr-py-16w")}>
        <TrialContact />
      </section>
      <section
        className={fr.cx("fr-mt-6w")}
        style={{ backgroundColor: "var(--background-alt-blue-france)" }}
      >
        <div className={fr.cx("fr-container")}>
          <Newsletter />
        </div>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const { siret, structureId } = context.query;

  if (!siret || typeof siret !== "string") {
    return {
      props: {
        ...determineOnboardingCase(null, {}, "Identifiant de collectivité invalide"),
        allServices: [],
        usedServicesIds: [],
      },
    };
  }

  // Fetch the commune with its structures
  const commune = (await findOrganizationsWithStructures(siret)) as Commune & {
    epci_siret?: string;
  };
  if (commune?.type === "commune" && commune?.epci_siren) {
    const epci = await findOrganizationBySiren(commune?.epci_siren);
    commune.epci_siret = epci?.siret;
  }
  const allServices = await findAllServices();
  const organizationServices = await findOrganizationServicesBySiret(siret);

  if (!commune) {
    return {
      props: {
        ...determineOnboardingCase(
          null,
          {},
          `La Suite territoriale n'est disponible que pour les collectivités françaises. Le SIRET ${siret} ne correspond à aucune d'entre elles.`,
        ),
        allServices: [],
        usedServicesIds: [],
      },
    };
  }

  // Convert the Drizzle result to the Commune type
  const communeData: Commune = JSON.parse(JSON.stringify(commune));

  // Determine the onboarding case with options
  return {
    props: {
      commune: communeData,
      allServices,
      usedServicesIds: organizationServices.map((service) => service.id),
      ...determineOnboardingCase(communeData, {
        structureId: typeof structureId === "string" ? structureId : null,
      }),
    },
  };
};
