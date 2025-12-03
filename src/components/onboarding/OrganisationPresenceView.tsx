import type { Commune } from "@/lib/onboarding";
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
    <>
      <p>
        Voici la situation de la collectivité par rapport au{" "}
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
    </>
  );
}
