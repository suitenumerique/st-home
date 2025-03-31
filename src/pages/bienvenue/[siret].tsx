import { findOrganizationsWithStructures } from "@/lib/db";
import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
// Import view components
import ActiveInRegieView from "@/components/onboarding/ActiveInRegieView";
import ComingSoonView from "@/components/onboarding/ComingSoonView";
import CommuneInfo from "@/components/onboarding/CommuneInfo";
import ContactUsView from "@/components/onboarding/ContactUsView";
import ErrorView from "@/components/onboarding/ErrorView";
import OPSNChoiceView from "@/components/onboarding/OPSNChoiceView";
import OPSNProConnectView from "@/components/onboarding/OPSNProConnectView";
import UniqueCodeRequestView from "@/components/onboarding/UniqueCodeRequestView";

import ContactUs from "@/components/ContactUs";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Link from "next/link";
import { useRouter } from "next/router";

// Import types and functions
import {
  determineOnboardingCase,
  type Commune,
  type OnboardingProps,
} from "@/lib/onboarding";
import { OnboardingCase } from "@/types/onboarding";

interface PageProps extends OnboardingProps {
  commune?: Commune;
}

export default function Bienvenue(props: PageProps) {
  const { commune, onboardingCase, error } = props;

  const router = useRouter();

  const getCommuneContent = (_commune: Commune) => {
    switch (onboardingCase) {
      case OnboardingCase.ACTIVE_IN_REGIE:
        return <ActiveInRegieView commune={_commune} />;
      case OnboardingCase.OPSN_CHOICE:
        if (!_commune.structures) {
          return <ErrorView error="Configuration invalide" />;
        }
        return (
          <OPSNChoiceView
            commune={{ ..._commune, structures: _commune.structures }}
          />
        );
      case OnboardingCase.OPSN_PROCONNECT:
        return <OPSNProConnectView commune={_commune} />;
      case OnboardingCase.CONTACT_US:
        return <ContactUsView commune={_commune} />;
      case OnboardingCase.UNIQUE_CODE_REQUEST:
        return <UniqueCodeRequestView commune={_commune} />;
      case OnboardingCase.COMING_SOON:
        return <ComingSoonView commune={_commune} />;
      default:
        return <ErrorView error="Cas non géré" />;
    }
  };

  // Get the main content based on the onboarding case
  const GetMainContent = () => {
    if (!commune || onboardingCase === OnboardingCase.ERROR) {
      return <ErrorView error={error} />;
    }

    return (
      <div className={fr.cx("fr-mb-4w")}>
        <div
          style={{ float: "right" }}
          className={fr.cx("fr-mt-1w", "fr-hidden", "fr-unhidden-sm")}
        >
          <Tag>
            <Link href={commune.url_service_public || ""} target="_blank">
              Commune
            </Link>
          </Tag>
          &nbsp;
          <Tag>
            <span
              onClick={(e) => {
                // Easter egg to go to the future page
                e.preventDefault();
                e.stopPropagation();
                if (e.altKey) {
                  router.push(`/bienvenue/${commune.siret}?futur=1`);
                }
              }}
            >
              {commune.zipcode}
            </span>
          </Tag>
        </div>
        <h1
          className={fr.cx("fr-h1")}
          style={{ color: "var(--text-title-blue-france)" }}
        >
          {commune.name}
        </h1>
        <p>
          Voici la situation de la présence numérique de la commune, évaluée par
          rapport à notre{" "}
          <Link href="/conformite/referentiel">Référentiel de Conformité</Link>{" "}
          :
        </p>
        <CommuneInfo commune={commune} />
        {getCommuneContent(commune)}
      </div>
    );
  };

  const currentPageLabel = !commune?.name
    ? "Éligibilité"
    : `Éligibilité de ${commune.name} (${commune.zipcode})`;

  return (
    <div className={fr.cx("fr-container") + " st-bienvenue-page"}>
      <NextSeo
        title={currentPageLabel}
        description="Test d'éligibilité à la Suite territoriale"
      />
      <div>
        <Breadcrumb
          currentPageLabel={currentPageLabel}
          segments={[
            {
              label: "Présentation",
              linkProps: {
                href: "/",
              },
            },
          ]}
        />
      </div>
      <div className={fr.cx("fr-card--shadow", "fr-p-4w", "fr-mb-4w")}>
        {GetMainContent()}
      </div>
      <div className={fr.cx("fr-my-12w")}>
        <div className={fr.cx("fr-grid-row")}>
          <div className={fr.cx("fr-col-offset-lg-2", "fr-col-lg-8")}>
            <ContactUs />
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  const { siret, direct, structureId, isExistingMember, futur } = context.query;

  if (!siret || typeof siret !== "string") {
    return {
      props: determineOnboardingCase(
        null,
        {},
        "Identifiant de commune invalide",
      ),
    };
  }

  // Fetch the commune with its structures
  const commune = await findOrganizationsWithStructures(siret);

  if (!commune) {
    return {
      props: determineOnboardingCase(
        null,
        {},
        `La Suite territoriale n'est disponible que pour les communes françaises. Le SIRET ${siret} ne correspond à aucune d'entre elles.`,
      ),
    };
  }

  // Convert the Drizzle result to the Commune type
  const communeData: Commune = JSON.parse(JSON.stringify(commune));

  // Determine the onboarding case with options
  return {
    props: {
      commune: communeData,
      ...determineOnboardingCase(communeData, {
        direct: direct === "1",
        structureId: typeof structureId === "string" ? structureId : undefined,
        isExistingMember: isExistingMember === "true",
        comingSoon: futur !== "1",
      }),
    },
  };
};
