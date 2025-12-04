import type { Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import { useState } from "react";
import CommuneInfo from "./CommuneInfo";

type OrganisationPresenceViewProps = {
  organisation: Commune;
};

/**
 * View for displaying the organisation presence
 */
export default function OrganisationPresenceView({ organisation }: OrganisationPresenceViewProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        padding: "40px 40px 32px 40px",
        borderRadius: "8px",
        border: "1px solid var(--light-border-default-grey, #DDD)",
      }}
    >
      <h3
        className={fr.cx("fr-h3", "fr-mb-1w")}
        style={{ color: "var(--light-text-default-grey, #3A3A3A)" }}
      >
        La présence numérique de la collectivité
      </h3>
      <p className="fr-mb-3w">
        Parcourez la situation de la collectivité selon le{" "}
        <Link href="/conformite/referentiel">
          Référentiel de la Présence Numérique des Territoires
        </Link>{" "}
        :
      </p>
      <CommuneInfo commune={organisation} />
      {/* <Accordion
        className="presence-accordion"
        onExpandedChange={(value) => setExpanded(value)}
        label={
          <div className="accordion-label">
            <h5 style={{ flex: 1, color: "var(--light-decisions-text-text-default-grey, #3A3A3A)" }}>Parcourez la présence numérique de la collectivité</h5>
            <i
              className={
                fr.cx("fr-icon--md", "fr-icon-arrow-down-s-line") + (expanded ? " rotate-180" : "")
              }
              aria-hidden="true"
            />
          </div>
        }
      >
        <ul>
          <CommuneInfo commune={organisation} />
        </ul>
      </Accordion> */}
    </div>
  );
}
