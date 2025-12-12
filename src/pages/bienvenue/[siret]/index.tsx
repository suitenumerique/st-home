import {
  findOrganizationBySiren,
  findOrganizationServicesBySiret,
  findOrganizationsWithStructures,
} from "@/lib/db";
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

// Import types and functions
import { type Commune, type Service } from "@/lib/onboarding";

interface PageProps {
  commune?: Commune & { epci_siret?: string };
  error?: string;
  allServices: Service[];
  usedServicesIds: number[];
}

type Structure = {
  id: string;
  name: string;
  shortname: string | null;
};

export default function Bienvenue(props: PageProps) {
  const { commune, error, allServices = [], usedServicesIds = [] } = props;

  const usedServices = usedServicesIds
    .map((id) => allServices.find((s) => s.id === id))
    .filter((s) => s !== undefined);

  const opsnServicesNames =
    commune?.type === "commune" ? ["Rendez-vous", "Messages"] : ["Rendez-vous"];
  if (commune?.st_eligible) {
    opsnServicesNames.push("Nom de domaine");
  }
  const opsnServices = opsnServicesNames
    .map((name) => allServices.find((s) => s.name === name))
    .filter((s) => s && !usedServices.find((us) => us.id === s.id));

  const suiteServicesNames =
    commune?.type === "commune"
      ? [
          "Fichiers",
          "Projets",
          "Grist",
          "Espace sur demande",
          "Agents en intervention",
          "Annuaire des collectivités",
          "Adresses",
          "Mon suivi social",
          "Deveco",
        ]
      : [
          "Mon suivi social",
          "Deveco",
          "Annuaire des collectivités",
          "Adresses",
        ];
  const suiteServices = suiteServicesNames
    .map((name) => allServices.find((s) => s.name === name))
    .filter((s) => s && !usedServices.find((us) => us.id === s.id));

  // Get the main content based on the onboarding case
  const GetMainContent = () => {
    if (!commune || error) {
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

        <div className={fr.cx("fr-mb-15w")}>
          <OrganisationPresenceView organisation={commune as Commune} />
        </div>

        {usedServices.length > 0 && (
          <div className={fr.cx("fr-mb-15w")}>
            <UsedServicesView services={usedServices} />
          </div>
        )}

        {commune.structures && commune.structures.length > 0 && (
          <div className={fr.cx("fr-mb-15w")}>
            <OPSNServicesView
              services={opsnServices as Service[]}
              commune={commune as Commune & { structures: Structure[] }}
            />
          </div>
        )}

        <div className={fr.cx("fr-mb-15w")}>
          <SuiteServicesView commune={commune as Commune} services={suiteServices as Service[]} />
        </div>

        {!commune.st_eligible && (
          <div className={fr.cx("fr-mb-15w")}>
            <MutualisationView
              services={
                allServices.filter((s) => {
                  return ![
                    "Aides-territoires",
                    "Mon Espace Collectivité",
                    "Administration +",
                    "Bases Adresses Locales",
                    "Nom de domaine",
                  ].includes(s.name);
                }) as Service[]
              }
              organisation={commune as Commune}
            />
          </div>
        )}

        <div className={fr.cx("fr-mb-15w")}>
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
      <section className={fr.cx("fr-py-15w", "fr-mb-15w")}>
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
  const { siret } = context.query;

  if (!siret || typeof siret !== "string") {
    return {
      props: {
        error: "Identifiant de collectivité invalide",
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
  // const allServices = await findAllServices();
  const allServices = (await import("./services.json")).default as Service[];

  const organizationServices = await findOrganizationServicesBySiret(siret);

  if (!commune) {
    return {
      props: {
        error: `La Suite territoriale n'est disponible que pour les collectivités françaises. Le SIRET ${siret} ne correspond à aucune d'entre elles.`,
        allServices: [],
        usedServicesIds: [],
      },
    };
  }

  // Convert the Drizzle result to the Commune type
  const communeData: Commune = JSON.parse(JSON.stringify(commune));

  communeData.structures = communeData.structures?.map((structure) => {
    if (structure.name === "Mégalis Bretagne") {
      structure.name = "Mégalis";
      structure.shortname = "Mégalis";
    }
    return structure;
  });

  // Determine the onboarding case with options
  return {
    props: {
      commune: communeData,
      allServices,
      usedServicesIds: organizationServices.map((service) => service.id),
    },
  };
};
