import {
  findAllServices,
  findOrganizationServicesBySiret,
  findOrganizationsWithOperators,
  findServicesByOperatorIds,
} from "@/lib/db";
import servicesConfig from "@/components/map/features/deploiement/servicesConfig";
import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";

import Newsletter from "@/components/Newsletter";
import DepartmentPresenceView from "@/components/onboarding/DepartmentPresenceView";
import ErrorView from "@/components/onboarding/ErrorView";
import OPSNBasicView from "@/components/onboarding/OPSNBasicView";
import OPSNServicesView from "@/components/onboarding/OPSNServicesView";
import OrganisationPresenceView from "@/components/onboarding/OrganisationPresenceView";
import SuiteServicesBasicView from "@/components/onboarding/SuiteServicesBasicView";
import SuiteServicesView from "@/components/onboarding/SuiteServicesView";
import UsedServicesView from "@/components/onboarding/UsedServicesView";
import TrialContact from "@/components/TrialContact";

import { type Commune, type OperatorWithRole, type Service } from "@/lib/schema";

/**
 * OPSN display cases:
 *
 * 1. No OPSN (no perimetre operators):
 *    → SuiteServicesBasicView only
 *
 * 2. OPSN without status "partenaire_avec_services":
 *    → OPSNBasicView (TODO) + SuiteServicesBasicView
 *
 * 3. OPSN with status "partenaire_avec_services":
 *    → OPSNServicesView (with operator's services)
 *    → SuiteServicesView (all services minus OPSN services)
 *
 * Multiple OPSNs are sorted: partenaire_avec_services first (then by service
 * count desc), then other OPSNs. Ties broken by operator ID asc.
 *
 * After the OPSN/Suite blocks, all cases show:
 *    → UsedServicesView (if any)
 *    → MutualisationView
 *    → DepartmentPresenceView
 */

// An OPSN operator enriched with its associated services
interface OpsnOperator extends OperatorWithRole {
  services: Service[];
}

interface PageProps {
  commune?: Commune;
  error?: string;
  allServices: Service[];
  // Sorted list of perimetre operators with their services
  opsnOperators: OpsnOperator[];
  // Services not covered by any OPSN with partenaire_avec_services status
  suiteServices: Service[];
  usedServices: Service[];
  // Whether any OPSN has partenaire_avec_services status
  hasOpsnWithServices: boolean;
}

export default function Bienvenue(props: PageProps) {
  const {
    commune,
    error,
    // allServices is available in props for MutualisationView (currently commented out)
    opsnOperators = [],
    suiteServices = [],
    usedServices = [],
    hasOpsnWithServices,
  } = props;

  const GetMainContent = () => {
    if (!commune || error) {
      return <ErrorView error={error} />;
    }

    // Split operators by status
    const opsnWithServices = opsnOperators.filter((op) => op.status === "partenaire_avec_services");
    const opsnWithoutServices = opsnOperators.filter(
      (op) => op.status == "intention" || op.status == "partenaire",
    );
    return (
      <div className={fr.cx("fr-mb-4w")}>
        <h1
          className={fr.cx("fr-h1", "fr-mb-2w")}
          style={{ color: "var(--text-title-blue-france)", marginTop: 0 }}
        >
          {commune.name}
          {commune.type === "commune" && commune.zipcode && (
            <span className={fr.cx("fr-text--regular")} style={{ fontSize: "2rem" }}>
              {" "}
              · {commune.zipcode}
            </span>
          )}
        </h1>

        <div className={fr.cx("fr-mb-6w")}>
          <OrganisationPresenceView organisation={commune as Commune} />
        </div>

        {/* Alternating two-column blocks: track a counter for left/right swap */}
        {(() => {
          let blockIndex = 0;

          return (
            <>
              {/* Case 3: OPSNs with partenaire_avec_services → OPSNServicesView per operator */}
              {opsnWithServices.map((op) => (
                <div key={op.id} className={fr.cx("fr-mb-15w")}>
                  <OPSNServicesView
                    operator={op}
                    services={op.services}
                    commune={commune as Commune}
                    reversed={blockIndex++ % 2 !== 0}
                  />
                </div>
              ))}

              {/* Case 2: OPSNs without partenaire_avec_services → OPSNBasicView per operator */}
              {opsnWithoutServices.map((op) => (
                <div key={op.id} className={fr.cx("fr-mb-15w")}>
                  <OPSNBasicView
                    operator={op}
                    commune={commune as Commune}
                    reversed={blockIndex++ % 2 !== 0}
                  />
                </div>
              ))}

              {/* Suite services block */}
              <div className={fr.cx("fr-mb-15w")}>
                {hasOpsnWithServices ? (
                  <SuiteServicesView
                    operator={opsnWithServices[0]}
                    commune={commune as Commune}
                    services={suiteServices}
                    reversed={blockIndex++ % 2 !== 0}
                  />
                ) : (
                  <SuiteServicesBasicView
                    commune={commune as Commune}
                    reversed={blockIndex++ % 2 !== 0}
                  />
                )}
              </div>
            </>
          );
        })()}

        {usedServices.length > 0 && (
          <div className={fr.cx("fr-mb-15w")}>
            <UsedServicesView services={usedServices} />
          </div>
        )}

        {/*
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
              })
            }
            organisation={commune as Commune}
            reversed={blockIndex++ % 2 !== 0}
          />
        </div>
        */}

        {commune.type === "commune" && (
          <div className={fr.cx("fr-mb-15w")}>
            <DepartmentPresenceView organisation={commune as Commune} />
          </div>
        )}
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

  if (!commune?.type || !commune.name) {
    currentPageLabel = "Présence numérique des collectivités";
  } else if (commune.type === "commune" && commune.zipcode) {
    currentPageLabel = `${commune.name} · ${commune.zipcode}`;
  } else {
    currentPageLabel = commune.name;
  }

  return (
    <div
      style={{
        background: [
          "radial-gradient(ellipse 50% 300px at 100% 0%, rgba(205,200,255,0.10) 0%, transparent 70%)",
          "radial-gradient(ellipse 40% 250px at 0% 0%, rgba(205,200,255,0.05) 0%, transparent 70%)",
          "linear-gradient(180deg, rgba(0,0,145,0.05) 0%, rgba(205,200,255,0.0) 5%, rgba(1,143,131,0.01) 5%, rgba(1,143,131,0.01) 6%, #FFFFFF 6%)",
        ].join(", "),
        paddingTop: "1px",
      }}
    >
      <section className={fr.cx("fr-container") + " st-bienvenue-page"}>
        <NextSeo
          title={currentPageLabel}
          description="Test d'éligibilité à la Suite territoriale"
        />
        <div style={{ marginBottom: "-1rem" }}>
          <Breadcrumb currentPageLabel={currentPageLabel} segments={currentPageBreadcrumbs} />
        </div>
        {GetMainContent()}
      </section>
      <section className={fr.cx("fr-py-15w", "fr-mb-15w")}>
        <TrialContact signupUrl={`/bienvenue/${commune?.siret}/contact`} priority="primary" />
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

  const emptyProps: PageProps = {
    allServices: [],
    opsnOperators: [],
    suiteServices: [],
    usedServices: [],
    hasOpsnWithServices: false,
  };

  if (!siret || typeof siret !== "string") {
    return { props: { ...emptyProps, error: "Identifiant de collectivité invalide" } };
  }

  const commune = await findOrganizationsWithOperators(siret);

  if (!commune) {
    return {
      props: {
        ...emptyProps,
        error: `La Suite territoriale n'est disponible que pour les collectivités françaises. Le SIRET ${siret} ne correspond à aucune d'entre elles.`,
      },
    };
  }

  // Services hidden from all views on the bienvenue page
  const HIDDEN_SERVICE_IDS = new Set([5, 6, 10, 11, 47, 48, 100]);

  const allServices = (await findAllServices()).filter((s) => !HIDDEN_SERVICE_IDS.has(s.id));
  
  const visibleSocleServices = Object.keys(servicesConfig).filter((s) => servicesConfig[s].visible && servicesConfig[s].socle);
  const socleServices = allServices.filter((s) => visibleSocleServices.includes(s.name));
  
  const organizationServices = await findOrganizationServicesBySiret(siret);
  const usedServiceIds = new Set(organizationServices.map((s) => s.id));

  // Get perimetre operators and their services
  const perimetreOperators = (commune.operators || []).filter((op) => op.isPerimetre);
  const perimetreOperatorIds = perimetreOperators.map((op) => op.id);
  const operatorServicesResult = await findServicesByOperatorIds(perimetreOperatorIds);

  // Build a map of operator ID → services
  const servicesByOperatorId = new Map<string, Service[]>();
  for (const row of operatorServicesResult) {
    const existing = servicesByOperatorId.get(row.operatorId) || [];
    existing.push(row.service);
    servicesByOperatorId.set(row.operatorId, existing);
  }

  // Enrich operators with their services and sort:
  // 1. partenaire_avec_services first (then by service count desc)
  // 2. Other OPSNs
  // 3. Ties broken by ID asc
  const opsnOperators: OpsnOperator[] = perimetreOperators
    .map((op) => ({
      ...op,
      services: socleServices,
    }))
    .sort((a, b) => {
      const aHasServices = a.status === "partenaire_avec_services" ? 1 : 0;
      const bHasServices = b.status === "partenaire_avec_services" ? 1 : 0;
      if (aHasServices !== bHasServices) return bHasServices - aHasServices;
      if (a.services.length !== b.services.length) return b.services.length - a.services.length;
      return a.id.localeCompare(b.id);
    });

  const hasOpsnWithServices = opsnOperators.some((op) => op.status === "partenaire_avec_services");

  // Collect all service IDs covered by partenaire_avec_services operators
  const opsnServiceIds = new Set<number>();
  for (const op of opsnOperators) {
    if (op.status === "partenaire_avec_services") {
      for (const s of op.services) {
        opsnServiceIds.add(s.id);
      }
    }
  }

  // Suite services = ANCT operator's services minus OPSN services minus already used
  const ANCT_OPERATOR_ID = "9f5624fc-ef99-4d10-ae3f-403a81eb16ef";
  const anctServicesResult = await findServicesByOperatorIds([ANCT_OPERATOR_ID]);
  const anctServiceIds = new Set(anctServicesResult.map((r) => r.service.id));
  const suiteServices = allServices.filter(
    (s) => anctServiceIds.has(s.id) && !opsnServiceIds.has(s.id),
  );

  const usedServices = allServices.filter((s) => usedServiceIds.has(s.id));

  const communeData: Commune = JSON.parse(JSON.stringify(commune));

  return {
    props: {
      commune: communeData,
      allServices: JSON.parse(JSON.stringify(allServices)),
      opsnOperators: JSON.parse(JSON.stringify(opsnOperators)),
      suiteServices: JSON.parse(JSON.stringify(suiteServices)),
      usedServices: JSON.parse(JSON.stringify(usedServices)),
      hasOpsnWithServices,
    },
  };
};
