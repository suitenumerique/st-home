import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import Link from "next/link";
import { getBadge, type CommuneInfoProps } from "./CommuneInfo";

/**
 * Component showing detailed EPCI information in expandable sections
 */
export default function EpciInfo({ commune }: CommuneInfoProps) {
  const isEligible = commune.st_eligible;

  return (
    <div className={fr.cx("fr-mb-4w")}>
      <div className={fr.cx("fr-accordions-group")}>
        {/* Eligibility */}
        <Accordion
          titleAs="h2"
          defaultExpanded
          label={
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
              <span className={fr.cx("fr-icon-user-line", "fr-mr-1w")} aria-hidden="true" />
              Éligible à la Suite territoriale :&nbsp;
              <div className={fr.cx("fr-ml-2w")}>
                {isEligible ? getBadge("success", "Oui") : getBadge("info", "Nous contacter")}
              </div>
            </div>
          }
        >
          <ul>
            <li>
              <strong>Population de l&rsquo;EPCI :</strong>{" "}
              {commune.population.toLocaleString("fr-FR")} habitants
            </li>
          </ul>
          <div className={fr.cx("fr-mt-2w")}>
            {isEligible ? (
              <p>
                <span
                  className={fr.cx("fr-icon-success-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-success)" }}
                  aria-hidden="true"
                ></span>
                L&rsquo;EPCI est éligible à la Suite territoriale. Vous pouvez dès à présent
                rejoindre le Groupe pilote ci-dessous.
              </p>
            ) : (
              <p>
                <span
                  className={fr.cx("fr-icon-info-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-info)" }}
                  aria-hidden="true"
                ></span>
                L&rsquo;EPCI n&rsquo;est pas directement éligible mais peut bénéficier d&rsquo;un
                accompagnement spécifique.{" "}
                <Link href="mailto:lasuiteterritoriale@anct.gouv.fr" className={fr.cx("fr-link")}>
                  Contactez-nous pour en discuter
                </Link>{" "}
                !
              </p>
            )}
          </div>
        </Accordion>
      </div>
    </div>
  );
}
