import { getServiceConfig } from "@/components/map/features/deploiement/servicesConfig";
import {
  findAllServices,
  findOperatorById,
  findOrganizationServicesBySiret,
  findOrganizationsWithOperators,
  findServicesByOperatorIds,
} from "@/lib/db";
import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";

import Newsletter from "@/components/Newsletter";
import DepartmentPresenceView from "@/components/onboarding/DepartmentPresenceView";
import ErrorView from "@/components/onboarding/ErrorView";
import OperatorServicesBlock, {
  ANCT_OPERATOR_ID,
} from "@/components/onboarding/OperatorServicesBlock";
import OPSNBasicView from "@/components/onboarding/OPSNBasicView";
import OrganisationPresenceView from "@/components/onboarding/OrganisationPresenceView";
import UsedServicesView from "@/components/onboarding/UsedServicesView";
import TrialContact from "@/components/TrialContact";

import { type Commune, type Operator, type OperatorWithRole, type Service } from "@/lib/schema";

/**
 * One block per (operator, isSocle) pair. Each operator with services contributes
 * up to two blocks (socle, non-socle). Services from one operator are never mixed
 * with services from another. ANCT's blocks contain only ANCT services that are
 * not already shown in a perimetre operator's block.
 */

type OpServices = {
  op: OperatorWithRole | Pick<Operator, "id" | "name" | "name_with_article" | "website">;
  socle: Service[];
  nonSocle: Service[];
};

interface PageProps {
  commune?: Commune;
  error?: string;
  // Perimetre operators with status partenaire_avec_services, with their socle/non-socle services
  opsnBlocks: OpServices[];
  // Perimetre operators without partenaire_avec_services status (rendered with OPSNBasicView)
  opsnWithoutServices: OperatorWithRole[];
  // ANCT block (services not already shown in any opsnBlocks)
  anctBlock: OpServices | null;
  usedServices: Service[];
}

export default function Bienvenue(props: PageProps) {
  const {
    commune,
    error,
    opsnBlocks = [],
    opsnWithoutServices = [],
    anctBlock,
    usedServices = [],
  } = props;

  const GetMainContent = () => {
    if (!commune || error) {
      return <ErrorView error={error} />;
    }

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

        {(() => {
          type BlockDescriptor =
            | { kind: "operator"; key: string; block: OpServices; isSocle: boolean }
            | { kind: "opsn-basic"; key: string; operator: OperatorWithRole };

          const descriptors: BlockDescriptor[] = [];
          const pushOperator = (block: OpServices) => {
            if (block.socle.length > 0) {
              descriptors.push({
                kind: "operator",
                key: `${block.op.id}-socle`,
                block,
                isSocle: true,
              });
            }
            if (block.nonSocle.length > 0) {
              descriptors.push({
                kind: "operator",
                key: `${block.op.id}-nonsocle`,
                block,
                isSocle: false,
              });
            }
          };
          for (const b of opsnBlocks) pushOperator(b);
          for (const op of opsnWithoutServices) {
            descriptors.push({ kind: "opsn-basic", key: op.id, operator: op });
          }
          if (anctBlock) pushOperator(anctBlock);

          return (
            <>
              {descriptors.map((d, idx) => {
                const reversed = idx % 2 !== 0;
                if (d.kind === "operator") {
                  return (
                    <div key={d.key} className={fr.cx("fr-mb-15w")}>
                      <OperatorServicesBlock
                        op={d.block.op}
                        services={d.isSocle ? d.block.socle : d.block.nonSocle}
                        isSocle={d.isSocle}
                        commune={commune as Commune}
                        reversed={reversed}
                      />
                    </div>
                  );
                }
                return (
                  <div key={d.key} className={fr.cx("fr-mb-15w")}>
                    <OPSNBasicView
                      operator={d.operator}
                      commune={commune as Commune}
                      reversed={reversed}
                    />
                  </div>
                );
              })}
            </>
          );
        })()}

        {usedServices.length > 0 && (
          <div className={fr.cx("fr-mb-15w")}>
            <UsedServicesView services={usedServices} />
          </div>
        )}

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
    opsnBlocks: [],
    opsnWithoutServices: [],
    anctBlock: null,
    usedServices: [],
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

  const isVisibleSocle = (s: Service) => {
    const cfg = getServiceConfig(s);
    return cfg?.visible === true && cfg?.socle === true;
  };

  // Stable key across alias rows (e.g. all ProConnect rows share type "proconnect"
  // and resolve to the same servicesConfig entry).
  const serviceKey = (s: Service) => getServiceConfig(s)?.id ?? s.id;

  // Pin ProConnect first; otherwise preserve input order (= seed position).
  const proconnectFirst = (list: Service[]): Service[] => {
    const pc = list.filter((s) => s.type === "proconnect");
    const rest = list.filter((s) => s.type !== "proconnect");
    return [...pc, ...rest];
  };

  const organizationServices = await findOrganizationServicesBySiret(siret);
  const usedServiceIds = new Set(organizationServices.map((s) => s.id));

  // Perimetre operators (the ones rendered as OPSN blocks)
  const perimetreOperators = (commune.operators || []).filter((op) => op.isPerimetre);
  const perimetreOperatorIds = perimetreOperators.map((op) => op.id);
  const operatorServicesResult = await findServicesByOperatorIds(perimetreOperatorIds);

  const servicesByOperatorId = new Map<string, Service[]>();
  for (const row of operatorServicesResult) {
    const existing = servicesByOperatorId.get(row.operatorId) || [];
    existing.push(row.service);
    servicesByOperatorId.set(row.operatorId, existing);
  }

  // Sort perimetre operators: department-scoped first, then partenaire_avec_services first,
  // then by id. Matches the prior ordering.
  const sortedPerimetre = [...perimetreOperators].sort((a, b) => {
    const aDeptCount = a.departments?.length ?? 0;
    const bDeptCount = b.departments?.length ?? 0;
    if (aDeptCount !== bDeptCount) return aDeptCount - bDeptCount;
    const aHasServices = a.status === "partenaire_avec_services" ? 1 : 0;
    const bHasServices = b.status === "partenaire_avec_services" ? 1 : 0;
    if (aHasServices !== bHasServices) return bHasServices - aHasServices;
    return a.id.localeCompare(b.id);
  });

  // Build OPSN blocks (one per operator with status partenaire_avec_services).
  // Within each block, services keep their st_services_to_operators.position order
  // (seeded), with ProConnect pinned first.
  const opsnBlocks: OpServices[] = [];
  const shownKeys = new Set<number>();
  for (const op of sortedPerimetre) {
    if (op.status !== "partenaire_avec_services") continue;
    const opServices = (servicesByOperatorId.get(op.id) || []).filter(
      (s) => !HIDDEN_SERVICE_IDS.has(s.id),
    );
    const socle = proconnectFirst(opServices.filter(isVisibleSocle));
    const nonSocle = proconnectFirst(opServices.filter((s) => !isVisibleSocle(s)));
    if (socle.length === 0 && nonSocle.length === 0) continue;
    for (const s of opServices) shownKeys.add(serviceKey(s));
    opsnBlocks.push({ op, socle, nonSocle });
  }

  const opsnWithoutServices = sortedPerimetre.filter(
    (op) => op.status === "intention" || op.status === "partenaire",
  );

  // ANCT block: ANCT's services that haven't already been shown by an OPSN block.
  // Order comes from st_services_to_operators.position (seeded), with ProConnect first.
  const anctOperator = await findOperatorById(ANCT_OPERATOR_ID);
  let anctBlock: OpServices | null = null;
  if (anctOperator) {
    const anctServicesResult = await findServicesByOperatorIds([ANCT_OPERATOR_ID]);
    const anctServices = anctServicesResult
      .map((r) => r.service)
      .filter((s) => !HIDDEN_SERVICE_IDS.has(s.id) && !shownKeys.has(serviceKey(s)));
    const socle = proconnectFirst(anctServices.filter(isVisibleSocle));
    const nonSocle = proconnectFirst(anctServices.filter((s) => !isVisibleSocle(s)));
    if (socle.length > 0 || nonSocle.length > 0) {
      anctBlock = { op: anctOperator, socle, nonSocle };
    }
  }

  const usedServices = allServices.filter((s) => usedServiceIds.has(s.id));

  const communeData: Commune = JSON.parse(JSON.stringify(commune));

  return {
    props: {
      commune: communeData,
      opsnBlocks: JSON.parse(JSON.stringify(opsnBlocks)),
      opsnWithoutServices: JSON.parse(JSON.stringify(opsnWithoutServices)),
      anctBlock: JSON.parse(JSON.stringify(anctBlock)),
      usedServices: JSON.parse(JSON.stringify(usedServices)),
    },
  };
};
