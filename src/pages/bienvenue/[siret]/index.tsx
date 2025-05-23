import { findOrganizationsWithStructures } from "@/lib/db";
import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
// Import view components
import ActiveInRegieView from "@/components/onboarding/ActiveInRegieView";
import CommuneInfo from "@/components/onboarding/CommuneInfo";
import ErrorView from "@/components/onboarding/ErrorView";
import NotEligibleView from "@/components/onboarding/NotEligibleView";
import OPSNChoiceView from "@/components/onboarding/OPSNChoiceView";
import OPSNProConnectView from "@/components/onboarding/OPSNProConnectView";
import OPSNZeroView from "@/components/onboarding/OPSNZeroView";
import UniqueCodeRequestView from "@/components/onboarding/UniqueCodeRequestView";

import ContactUs from "@/components/ContactUs";
import Link from "next/link";

// Import types and functions
import { determineOnboardingCase, type Commune, type OnboardingProps } from "@/lib/onboarding";
import { OnboardingCase } from "@/types/onboarding";

interface PageProps extends OnboardingProps {
  commune?: Commune;
}

export default function Bienvenue(props: PageProps) {
  const { commune, onboardingCase, error } = props;

  const getCommuneContent = (_commune: Commune) => {
    switch (onboardingCase) {
      case OnboardingCase.ACTIVE_IN_REGIE:
        return <ActiveInRegieView commune={_commune} />;
      case OnboardingCase.OPSN_CHOICE:
        if (!_commune.structures) {
          return <ErrorView error="Configuration invalide" />;
        }
        return <OPSNChoiceView commune={{ ..._commune, structures: _commune.structures }} />;
      case OnboardingCase.OPSN_PROCONNECT:
        return <OPSNProConnectView commune={_commune} />;
      case OnboardingCase.OPSN_ZERO:
        return <OPSNZeroView commune={_commune} />;
      case OnboardingCase.NOT_ELIGIBLE:
        return <NotEligibleView commune={_commune} />;

      case OnboardingCase.UNIQUE_CODE_REQUEST:
        return <UniqueCodeRequestView commune={_commune} />;
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
          <span
            className={fr.cx("fr-text--regular", "fr-text--xl")}
            style={{ color: "var(--text-title-blue-france)" }}
          >
            {commune.type === "commune" ? commune.zipcode : "EPCI"}
          </span>
        </div>
        <h1 className={fr.cx("fr-h1")} style={{ color: "var(--text-title-blue-france)" }}>
          {commune.name}
        </h1>
        {commune.type === "commune" && (
          <>
            <p>
              Voici la situation de la présence numérique de la commune, selon notre{" "}
              <Link href="/conformite/referentiel">Référentiel de Conformité</Link> :
            </p>
            <CommuneInfo commune={commune} />
          </>
        )}

        {getCommuneContent(commune)}
      </div>
    );
  };

  const currentPageLabel = !commune?.name
    ? "Éligibilité"
    : `Éligibilité de ${commune.name} (${commune.type === "commune" ? commune.zipcode : "EPCI"})`;

  return (
    <div className={fr.cx("fr-container") + " st-bienvenue-page"}>
      <NextSeo title={currentPageLabel} description="Test d'éligibilité à la Suite territoriale" />
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
      <div className={fr.cx("fr-card--shadow", "fr-p-4w", "fr-mb-4w")}>{GetMainContent()}</div>
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

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const { siret, structureId } = context.query;

  if (!siret || typeof siret !== "string") {
    return {
      props: determineOnboardingCase(null, {}, "Identifiant de commune invalide"),
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
        structureId: typeof structureId === "string" ? structureId : null,
      }),
    },
  };
};
