import type { Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
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
      <Accordion
        className="presence-accordion"
        onExpandedChange={(value) => setExpanded(value)}
        label={
          <div className="accordion-label">
            <h3 style={{ flex: 1 }}>Parcourez la présence numérique de la collectivité</h3>
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
      </Accordion>
    </>
  );
}
