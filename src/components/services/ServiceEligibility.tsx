import CommuneSearch, { type Commune } from "@/components/CommuneSearch";
import { useSmallScreen } from "@/lib/hooks";
import { capitalizeFirst } from "@/lib/string";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import { type ReactNode, useRef, useState } from "react";

const ANCT_THRESHOLDS: Record<string, number> = { commune: 3500, epci: 15000 };
const PLACEHOLDER = "Entrez le nom de votre territoire ou son code postal";
const PLACEHOLDER_SMALL_SCREEN = "Nom ou code postal";
const CONTACT_EMAIL = "contact@suite.anct.gouv.fr";
// Offered to the collectivités above the ANCT thresholds. One guide covers every service, so it lives here rather than
// with each service.
const SELF_HOSTING_URL =
  "https://docs.numerique.gouv.fr/docs/440cb67a-093c-4901-ac88-702c7b298ff5/";

export type Operator = {
  id: string;
  name: string;
  shortname: string | null;
  name_with_article: string | null;
  status: string | null;
  departments: string[] | null;
  isPerimetre: boolean | null;
};

export type Organization = {
  siret: string;
  type: string;
  population: number;
  operators?: Operator[];
};

export type Eligibility =
  | { kind: "operator"; operator: Operator }
  | { kind: "operator-soon"; operator: Operator }
  | { kind: "operator-above-threshold"; operator: Operator }
  | { kind: "anct" }
  | { kind: "self-hosted" };

// A collectivité is in the périmètre of an OPSN that either already offers the
// services ("partenaire_avec_services") or is on its way to ("partenaire",
// "intention"). /bienvenue/[siret] shows both, so this block must too.
const WITH_SERVICES = "partenaire_avec_services";
const PARTNER_STATUSES = [WITH_SERVICES, "partenaire", "intention"];

type State =
  | { status: "idle" }
  | { status: "loading"; commune: Commune }
  | { status: "ready"; commune: Commune; eligibility: Eligibility }
  | { status: "error"; commune: Commune };

// Same ordering as the OPSN blocks of /bienvenue/[siret]: narrowest perimeter
// first, then the ones already offering the services. Both pages must name the
// same OPSN for a collectivité covered by several.
function partnerOperator(operators: Operator[]): Operator | null {
  const partners = operators
    .filter((op) => op.isPerimetre && op.status !== null && PARTNER_STATUSES.includes(op.status))
    .sort((a, b) => {
      const departments = (a.departments?.length ?? 0) - (b.departments?.length ?? 0);
      if (departments !== 0) return departments;

      const services = (b.status === WITH_SERVICES ? 1 : 0) - (a.status === WITH_SERVICES ? 1 : 0);
      if (services !== 0) return services;

      return a.id.localeCompare(b.id);
    });

  return partners[0] ?? null;
}

export function eligibilityOf(organization: Organization): Eligibility {
  const operator = partnerOperator(organization.operators ?? []);
  const threshold = ANCT_THRESHOLDS[organization.type];
  const aboveThreshold = threshold !== undefined && organization.population >= threshold;

  // Above the thresholds, the OPSN may still offer something, but self-hosting
  // is an option too.
  if (operator && aboveThreshold) return { kind: "operator-above-threshold", operator };

  if (operator) {
    return operator.status === WITH_SERVICES
      ? { kind: "operator", operator }
      : { kind: "operator-soon", operator };
  }

  if (aboveThreshold) return { kind: "self-hosted" };

  return { kind: "anct" };
}

function operatorLabel(operator: Operator): string {
  return operator.name_with_article ?? operator.shortname ?? operator.name;
}

export default function ServiceEligibility({ serviceName }: { serviceName: string }) {
  const isSmallScreen = useSmallScreen(1000);
  const [state, setState] = useState<State>({ status: "idle" });
  const [searchKey, setSearchKey] = useState(0);
  // Picking a second territory while the first request is in flight must not let
  // the slower response overwrite the newer one.
  const requestId = useRef(0);

  const select = async (commune: Commune) => {
    const id = ++requestId.current;

    setState({ status: "loading", commune });

    try {
      const response = await fetch(`/api/communes/${commune.siret}`);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const organization: Organization = await response.json();

      if (id !== requestId.current) return;

      setState({ status: "ready", commune, eligibility: eligibilityOf(organization) });
    } catch (error) {
      console.error("Error fetching organization", error);
      if (id !== requestId.current) return;
      setState({ status: "error", commune });
    }
  };

  const reset = () => {
    requestId.current++;
    setState({ status: "idle" });
    setSearchKey((key) => key + 1);
  };

  return (
    <>
      <div className={styles.heroSearch}>
        <CommuneSearch
          key={searchKey}
          smallButton
          placeholder={isSmallScreen ? PLACEHOLDER_SMALL_SCREEN : PLACEHOLDER}
          onSelect={select}
        />

        {/*
         * Own button rather than the search bar's: react-dsfr hides its own one
         * as soon as the input holds text, and wiring `onButtonClick` would make
         * it swallow the Enter key that accepts a suggestion.
         */}
        {state.status !== "idle" && (
          <button
            type="button"
            className={`${fr.cx("fr-btn")} ${styles.heroSearchReset}`}
            onClick={reset}
          >
            <span className={fr.cx("fr-sr-only")}>Rechercher un autre territoire</span>
          </button>
        )}
      </div>

      {state.status === "idle" ? (
        <div className={styles.heroSearchText}>
          <h2 className={fr.cx("fr-h2", "fr-mt-3w", "fr-mb-1w")}>
            Découvrez vos modalités d&rsquo;accès
          </h2>
          <p className={`${fr.cx("fr-text--md", "fr-mb-0")} ${styles.heroSearchLead}`}>
            Selon votre administration et sa localité, les conditions d&rsquo;accès au service
            peuvent varier.
          </p>
        </div>
      ) : (
        <div className={styles.heroSearchText}>
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
}: {
  commune: Commune;
  eligibility: Eligibility;
  serviceName: string;
}) {
  const contactUs = <a href={`mailto:${CONTACT_EMAIL}`}>contactez-nous</a>;

  const allServicesLink = {
    text: "Voir tous les services accessibles",
    href: `/bienvenue/${commune.siret}`,
  };

  // Passing the OPSN pre-checks it on the contact form, as the blocks of
  // /bienvenue/[siret] do.
  const contactLink = (operator?: Operator) => ({
    text: "Commencer",
    href: `/bienvenue/${commune.siret}/contact${
      operator ? `?operator=${encodeURIComponent(operator.id)}` : ""
    }`,
  });

  const { title, description, primaryLink, footnote } = ((): {
    title: string;
    description: ReactNode;
    primaryLink: { text: string; href: string } | null;
    footnote: ReactNode | null;
  } => {
    switch (eligibility.kind) {
      case "operator":
        return {
          title: `Accédez à ${serviceName} avec ${operatorLabel(eligibility.operator)}`,
          description: (
            <>
              La structure de mutualisation de votre territoire peut accompagner votre collectivité
              à la mise en œuvre des services de la Suite territoriale.
            </>
          ),
          primaryLink: contactLink(eligibility.operator),
          footnote: <>Si vous avez une question sur ce partenaire, {contactUs}.</>,
        };
      case "operator-soon":
        return {
          title: `Accédez bientôt à ${serviceName} avec ${operatorLabel(eligibility.operator)}`,
          description: (
            <>
              <strong>{capitalizeFirst(operatorLabel(eligibility.operator))}</strong> fait évoluer
              son offre de services pour accompagner prochainement les collectivités adhérentes dans
              la mise en place d&rsquo;une sélection d&rsquo;outils.
            </>
          ),
          primaryLink: contactLink(eligibility.operator),
          footnote: <>Si vous avez une question sur ce partenaire, {contactUs}.</>,
        };
      case "operator-above-threshold":
        return {
          title: `Coopérez avec ${operatorLabel(eligibility.operator)} pour utiliser ${serviceName}`,
          description: (
            <>
              Contactez la structure de mutualisation de votre territoire pour connaître les
              possibilités disponibles pour votre collectivité ou autohébergez le service en
              autonomie.
            </>
          ),
          primaryLink: contactLink(eligibility.operator),
          footnote: (
            <>
              Si vous souhaitez créer votre propre instance, consultez le{" "}
              <a href={SELF_HOSTING_URL} target="_blank" rel="noopener noreferrer">
                guide d&rsquo;autohébergement
              </a>
              .
            </>
          ),
        };
      case "anct":
        return {
          title: `Accédez à ${serviceName} avec l’ANCT`,
          description: (
            <>
              L&rsquo;Agence nationale de la cohésion des territoires (ANCT) peut accompagner votre
              collectivité à la mise en œuvre des services de la Suite territoriale.
            </>
          ),
          primaryLink: contactLink(),
          footnote: null,
        };
      case "self-hosted":
        return {
          title: `Autohébergez ${serviceName} sur votre instance`,
          description: (
            <>
              Votre collectivité dépasse les seuils d&rsquo;éligibilité. Installez et administrez{" "}
              {serviceName} directement sur votre propre infrastructure.
            </>
          ),
          primaryLink: { text: "Guide d’autohébergement", href: SELF_HOSTING_URL },
          footnote: <>Si vous avez une question, {contactUs}.</>,
        };
    }
  })();

  return (
    <>
      <h2 className={fr.cx("fr-h2", "fr-mt-3w", "fr-mb-1w")}>{title}</h2>
      <p className={fr.cx("fr-text--md", "fr-mb-3w")}>{description}</p>

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
        </p>
      )}
    </>
  );
}
