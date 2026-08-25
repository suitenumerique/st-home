import CommuneSearch, { type Commune } from "@/components/CommuneSearch";
import { openFeedbackWidget } from "@/components/FeedbackWidget";
import { useSmallScreen } from "@/lib/hooks";
import { type ServiceEligibilitySearch } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import { type ReactNode, useState } from "react";

/**
 * Population thresholds of the ANCT offer, as used by the bienvenue page: under
 * them the collectivité is equipped by a partner or by the ANCT itself, above
 * them it runs the service on its own infrastructure. Types absent from this
 * map (département, région) are never above a threshold, as there.
 */
const ANCT_THRESHOLDS: Record<string, number> = { commune: 3500, epci: 15000 };

/** The operators returned by /api/communes/[siret], narrowed to what is used here. */
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

/** What the visitor is offered once their territory is known. */
type Eligibility =
  { kind: "operator"; operator: Operator } | { kind: "anct" } | { kind: "self-hosted" };

type State =
  | { status: "idle" }
  | { status: "loading"; commune: Commune }
  | { status: "ready"; commune: Commune; eligibility: Eligibility }
  | { status: "error"; commune: Commune };

/**
 * A structure de mutualisation covering the territory *and* offering services.
 * Same filter and order as the OPSN blocks of the bienvenue page: the operators
 * scoped to fewer departments come first, as the more local ones.
 */
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

/** "Mégalis", "l'ANCT": the name as it reads after "avec". */
function operatorLabel(operator: Operator): string {
  return operator.name_with_article ?? operator.shortname ?? operator.name;
}

export default function ServiceEligibility({
  search,
  serviceName,
}: {
  search: ServiceEligibilitySearch;
  /** Named in the result headings: "Accéder à Messages avec…". */
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

  // Remounting the search is how it gets emptied: the field keeps its own text,
  // and the reset button has no other way to clear it.
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
          placeholder={isSmallScreen ? search.placeholderSmallScreen : search.placeholder}
          onSelect={select}
          onInputChange={(_, reason) => {
            // "reset" is the field being filled from the selection itself;
            // anything the visitor types or clears drops the result.
            if (reason !== "reset") setState({ status: "idle" });
          }}
          onButtonClick={reset}
        />
      </div>

      {state.status === "idle" ? (
        <div className={styles.heroSearchText}>
          <h2 className={fr.cx("fr-h4", "fr-mt-3w", "fr-mb-1w")}>{search.title}</h2>
          {search.description && <p className={fr.cx("fr-mb-0")}>{search.description}</p>}
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
              selfHostingUrl={search.selfHostingUrl}
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
    /** Absent while the self-hosting guide has no URL. */
    primaryLink: { text: string; href: string } | null;
    /** Lead-in of the closing line, which ends on the "contactez-nous" link. */
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
          <Link
            href={`/bienvenue/${commune.siret}/contact`}
            onClick={(event) => {
              // The widget is the quickest way to reach us; the contact page of
              // the territory stands in when it is not configured.
              if (openFeedbackWidget()) event.preventDefault();
            }}
          >
            contactez-nous
          </Link>
          .
        </p>
      )}
    </>
  );
}
