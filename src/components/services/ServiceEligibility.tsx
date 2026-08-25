import CommuneSearch, { type Commune } from "@/components/CommuneSearch";
import { useSmallScreen } from "@/lib/hooks";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import { type ReactNode, useState } from "react";

const ANCT_THRESHOLDS: Record<string, number> = { commune: 3500, epci: 15000 };
const PLACEHOLDER = "Entrez le nom de votre territoire ou son code postal";
const PLACEHOLDER_SMALL_SCREEN = "Nom ou code postal";
const CONTACT_EMAIL = "contact@suite.anct.gouv.fr";

type Operator = {
  id: string;
  name: string;
  shortname: string | null;
  name_with_article: string | null;
  status: string | null;
  departments: string[] | null;
  isPerimetre: boolean | null;
};

type Organization = {
  siret: string;
  type: string;
  population: number;
  operators?: Operator[];
};

type Eligibility =
  { kind: "operator"; operator: Operator } | { kind: "anct" } | { kind: "self-hosted" };

type State =
  | { status: "idle" }
  | { status: "loading"; commune: Commune }
  | { status: "ready"; commune: Commune; eligibility: Eligibility }
  | { status: "error"; commune: Commune };

function partnerOperator(operators: Operator[]): Operator | null {
  const partners = operators
    .filter((op) => op.isPerimetre && op.status === "partenaire_avec_services")
    .sort((a, b) => {
      const departments = (a.departments?.length ?? 0) - (b.departments?.length ?? 0);
      return departments !== 0 ? departments : a.id.localeCompare(b.id);
    });

  return partners[0] ?? null;
}

function eligibilityOf(organization: Organization): Eligibility {
  const threshold = ANCT_THRESHOLDS[organization.type];

  if (threshold !== undefined && organization.population >= threshold) {
    return { kind: "self-hosted" };
  }

  const operator = partnerOperator(organization.operators ?? []);

  return operator ? { kind: "operator", operator } : { kind: "anct" };
}

function operatorLabel(operator: Operator): string {
  return operator.name_with_article ?? operator.shortname ?? operator.name;
}

export default function ServiceEligibility({
  selfHostingUrl,
  serviceName,
}: {
  selfHostingUrl?: string;
  serviceName: string;
}) {
  const isSmallScreen = useSmallScreen(1000);
  const [state, setState] = useState<State>({ status: "idle" });
  const [searchKey, setSearchKey] = useState(0);

  const select = async (commune: Commune) => {
    setState({ status: "loading", commune });

    try {
      const response = await fetch(`/api/communes/${commune.siret}`);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const organization: Organization = await response.json();

      setState({ status: "ready", commune, eligibility: eligibilityOf(organization) });
    } catch (error) {
      console.error("Error fetching organization", error);
      setState({ status: "error", commune });
    }
  };

  const reset = () => {
    setState({ status: "idle" });
    setSearchKey((key) => key + 1);
  };

  return (
    <>
      <div
        className={`${styles.heroSearch} ${state.status !== "idle" ? styles.heroSearchSelected : ""}`}
      >
        <CommuneSearch
          key={searchKey}
          smallButton
          placeholder={isSmallScreen ? PLACEHOLDER_SMALL_SCREEN : PLACEHOLDER}
          onSelect={select}
          onButtonClick={reset}
        />
      </div>

      {state.status === "idle" ? (
        <div className={styles.heroSearchText}>
          <h2 className={fr.cx("fr-h4", "fr-mt-3w", "fr-mb-1w")}>
            Découvrez vos modalités d&rsquo;accès
          </h2>
          <p className={fr.cx("fr-mb-0")}>
            Selon votre administration et sa localité, les conditions d&rsquo;accès au service
            peuvent varier.
          </p>
        </div>
      ) : (
        <div className={`${styles.heroSearchText} ${styles.heroSearchResult}`}>
          {state.status === "loading" && <p className={fr.cx("fr-mt-3w", "fr-mb-0")}>Recherche…</p>}

          {state.status === "error" && (
            <p className={fr.cx("fr-mt-3w", "fr-mb-0")}>
              Vos modalités d&rsquo;accès n&rsquo;ont pas pu être chargées.{" "}
              <Link href={`/bienvenue/${state.commune.siret}`}>
                Voir la page de votre territoire
              </Link>
              .
            </p>
          )}

          {state.status === "ready" && (
            <Result
              commune={state.commune}
              eligibility={state.eligibility}
              serviceName={serviceName}
              selfHostingUrl={selfHostingUrl}
            />
          )}
        </div>
      )}
    </>
  );
}

function Result({
  commune,
  eligibility,
  serviceName,
  selfHostingUrl,
}: {
  commune: Commune;
  eligibility: Eligibility;
  serviceName: string;
  selfHostingUrl?: string;
}) {
  const allServicesLink = {
    text: "Voir tous les services accessibles",
    href: `/bienvenue/${commune.siret}`,
  };

  const contactLink = { text: "Contacter", href: `/bienvenue/${commune.siret}/contact` };

  const { title, description, primaryLink, footnote } = ((): {
    title: string;
    description: ReactNode;
    primaryLink: { text: string; href: string } | null;
    footnote: ReactNode | null;
  } => {
    switch (eligibility.kind) {
      case "operator":
        return {
          title: `Accéder à ${serviceName} avec ${operatorLabel(eligibility.operator)}`,
          description: (
            <>
              La structure de mutualisation partenaire peut accompagner votre structure à la mise en
              œuvre des services de la Suite territoriale.
            </>
          ),
          primaryLink: contactLink,
          footnote: <>Si vous avez une question sur ce partenaire, </>,
        };
      case "anct":
        return {
          title: `Accéder à ${serviceName} avec l’ANCT`,
          description: (
            <>
              L&rsquo;Agence nationale de la cohésion des territoires (ANCT) peut accompagner votre
              structure à la mise en œuvre des services de la Suite territoriale.
            </>
          ),
          primaryLink: contactLink,
          footnote: null,
        };
      case "self-hosted":
        return {
          title: `Autohéberger ${serviceName} sur votre instance`,
          description: (
            <>
              Votre structure dépasse les seuils d&rsquo;éligibilité. Installez et administrez{" "}
              {serviceName} directement sur votre propre infrastructure.
            </>
          ),
          primaryLink: selfHostingUrl
            ? { text: "Guide d’autohébergement", href: selfHostingUrl }
            : null,
          footnote: <>Si vous avez une question, </>,
        };
    }
  })();

  return (
    <>
      <h2 className={fr.cx("fr-h4", "fr-mt-3w", "fr-mb-1w")}>{title}</h2>
      <p className={fr.cx("fr-mb-3w")}>{description}</p>

      <div
        style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}
        className={fr.cx("fr-mb-2w")}
      >
        {primaryLink && (
          <Link href={primaryLink.href} className={fr.cx("fr-btn")}>
            {primaryLink.text}
          </Link>
        )}
        <Link href={allServicesLink.href} className={fr.cx("fr-btn", "fr-btn--secondary")}>
          {allServicesLink.text}
        </Link>
      </div>

      {footnote && (
        <p
          className={fr.cx("fr-text--sm", "fr-mb-0")}
          style={{ color: "var(--text-mention-grey)" }}
        >
          {footnote}
          <a href={`mailto:${CONTACT_EMAIL}`}>contactez-nous</a>.
        </p>
      )}
    </>
  );
}
