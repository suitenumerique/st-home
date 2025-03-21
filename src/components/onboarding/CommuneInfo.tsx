import type { Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import Link from "next/link";

type CommuneInfoProps = {
  commune: Commune;
};

/**
 * Component showing detailed commune information in expandable sections
 */
export default function CommuneInfo({ commune }: CommuneInfoProps) {
  const isEligible =
    commune.population <= 3500 || (commune.epci_population || 0) <= 15000;

  return (
    <div className={fr.cx("fr-mb-4w")}>
      <div className={fr.cx("fr-accordions-group")}>
        {/* Website */}
        <Accordion
          titleAs="h2"
          label={
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
              <span
                className={fr.cx("fr-icon-earth-line", "fr-mr-1w")}
                aria-hidden="true"
              />
              Nom de domaine :&nbsp;
              <span className={fr.cx("fr-text--bold")}>
                {commune.website_domain || ""}
              </span>
              &nbsp;
              <div
                className={fr.cx(
                  "fr-ml-2w",
                  "fr-badges-group",
                  "fr-badges-group--sm",
                )}
              >
                {!commune.website_domain ? (
                  <Badge
                    severity="error"
                    small
                    style={{ marginBottom: "0.25rem", marginTop: "0.25rem" }}
                  >
                    Manquant
                  </Badge>
                ) : (
                  <>
                    {commune.website_compliant !== null && (
                      <Badge
                        severity={
                          commune.website_compliant ? "success" : "error"
                        }
                        small
                        style={{
                          marginBottom: "0.25rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        {commune.website_compliant
                          ? "Conforme"
                          : "Non conforme"}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
          }
        >
          <div className={fr.cx("fr-py-1w")}>
            {!commune.website_domain ? (
              <>
                <p>
                  <span
                    className={fr.cx(
                      "fr-icon-error-line",
                      "fr-label--error",
                      "fr-mr-1w",
                    )}
                    aria-hidden="true"
                  ></span>
                  La commune ne dispose pas encore d&rsquo;un nom de domaine
                  officiel connu des services de l&rsquo;État.
                </p>
                <p>
                  <span
                    className={fr.cx(
                      "fr-icon-info-line",
                      "fr-label--info",
                      "fr-mr-1w",
                    )}
                    aria-hidden="true"
                  ></span>
                  Si vous en possédez un, vous devez le déclarer sur{" "}
                  <Link
                    href={
                      commune.url_service_public + "/demande-de-mise-a-jour"
                    }
                    target="_blank"
                    rel="noopener"
                  >
                    Service-Public.fr
                  </Link>
                  .
                </p>
                {isEligible && (
                  <p className={fr.cx("fr-text--bold")}>
                    <Badge severity="success" noIcon as="span">
                      Bonne nouvelle !
                    </Badge>{" "}
                    Si vous n&rsquo;en possédez pas, la Suite territoriale peut
                    vous accompagner à en obtenir un.
                  </p>
                )}
              </>
            ) : (
              <>
                {commune.website_compliant ? (
                  <p>
                    <span
                      className={fr.cx(
                        "fr-icon-success-line",
                        "fr-label--success",
                        "fr-mr-1w",
                      )}
                      aria-hidden="true"
                    ></span>
                    L&rsquo;extension <strong>.{commune.website_tld}</strong> du
                    nom de domaine{" "}
                    <Link
                      href={commune.website_url || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {commune.website_domain}
                    </Link>{" "}
                    est conforme aux recommandations de l&rsquo;ANCT.
                  </p>
                ) : (
                  <p>
                    <span
                      className={fr.cx(
                        "fr-icon-error-line",
                        "fr-label--error",
                        "fr-mr-1w",
                      )}
                      aria-hidden="true"
                    ></span>
                    L&rsquo;extension <strong>.{commune.website_tld}</strong> du
                    domaine{" "}
                    <Link
                      href={commune.website_url || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {commune.website_domain}
                    </Link>{" "}
                    n&rsquo;est pas conforme aux recommandations de l&rsquo;ANCT
                    dans le cadre de la Suite territoriale.
                  </p>
                )}

                {!commune.website_compliant && isEligible && (
                  <p>
                    <Badge severity="success" noIcon as="span">
                      Bonne nouvelle !
                    </Badge>{" "}
                    La Suite territoriale peut vous aider à obtenir un nom de
                    domaine conforme.
                  </p>
                )}

                {commune.website_compliant && isEligible && (
                  <p>
                    <span
                      className={fr.cx(
                        "fr-icon-success-line",
                        "fr-label--success",
                        "fr-mr-1w",
                      )}
                      aria-hidden="true"
                    ></span>
                    Vous pourrez réutiliser ce domaine au sein de la Suite
                    territoriale !
                  </p>
                )}
              </>
            )}
          </div>
        </Accordion>

        {/* Email */}
        <Accordion
          titleAs="h2"
          label={
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
              <span
                className={fr.cx("fr-icon-mail-line", "fr-mr-1w")}
                aria-hidden="true"
              />
              Adresse de messagerie :&nbsp;
              <span className={fr.cx("fr-text--bold")}>
                {commune.email_official || ""}
              </span>
              <div
                className={fr.cx(
                  "fr-ml-2w",
                  "fr-badges-group",
                  "fr-badges-group--sm",
                )}
              >
                {!commune.email_official ? (
                  <Badge
                    severity="error"
                    small
                    style={{ marginBottom: "0.25rem", marginTop: "0.25rem" }}
                  >
                    Manquante
                  </Badge>
                ) : (
                  commune.email_compliant !== null && (
                    <Badge
                      severity={commune.email_compliant ? "success" : "error"}
                      small
                      style={{ marginBottom: "0.25rem", marginTop: "0.25rem" }}
                    >
                      {commune.email_compliant ? "Conforme" : "Non conforme"}
                    </Badge>
                  )
                )}
              </div>
            </div>
          }
        >
          <div className={fr.cx("fr-py-1w")}>
            {!commune.email_official ? (
              <>
                <p>
                  <span
                    className={fr.cx(
                      "fr-icon-error-line",
                      "fr-label--error",
                      "fr-mr-1w",
                    )}
                    aria-hidden="true"
                  ></span>
                  La commune ne dispose pas encore d&rsquo;une adresse de
                  messagerie connue des services de l&rsquo;État.
                </p>
                <p>
                  <span
                    className={fr.cx(
                      "fr-icon-info-line",
                      "fr-label--info",
                      "fr-mr-1w",
                    )}
                    aria-hidden="true"
                  ></span>
                  Si vous en possédez une, vous devez la déclarer sur{" "}
                  <Link
                    href={
                      commune.url_service_public + "/demande-de-mise-a-jour"
                    }
                    target="_blank"
                    rel="noopener"
                  >
                    Service-Public.fr
                  </Link>
                  .
                </p>
                {isEligible && (
                  <p>
                    <span
                      className={fr.cx(
                        "fr-icon-success-line",
                        "fr-label--success",
                        "fr-mr-1w",
                      )}
                      aria-hidden="true"
                    ></span>
                    Si vous n&rsquo;en possédez pas, la Suite territoriale peut
                    vous aider à en obtenir une.
                  </p>
                )}
              </>
            ) : (
              <>
                {commune.email_compliant ? (
                  <p>
                    <span
                      className={fr.cx("fr-icon-success-line", "fr-mr-1w")}
                      style={{ color: "var(--text-default-success)" }}
                      aria-hidden="true"
                    ></span>
                    L&rsquo;adresse de messagerie utilise un domaine{" "}
                    <strong>{commune.email_domain}</strong> conforme aux
                    recommandations de l&rsquo;ANCT.
                  </p>
                ) : (
                  <p>
                    <span
                      className={fr.cx("fr-icon-error-line", "fr-mr-1w")}
                      style={{ color: "var(--text-default-error)" }}
                      aria-hidden="true"
                    ></span>
                    Le domaine <strong>{commune.email_domain}</strong> générique
                    n&rsquo;est pas conforme aux recommandations de l&rsquo;ANCT
                    dans le cadre de la Suite territoriale.
                  </p>
                )}

                {commune.website_domain &&
                  commune.email_compliant &&
                  commune.email_domain !== commune.website_domain && (
                    <p>
                      <span
                        className={fr.cx("fr-icon-warning-line", "fr-mr-1w")}
                        style={{ color: "var(--text-default-warning)" }}
                        aria-hidden="true"
                      ></span>
                      L&rsquo;adresse de messagerie utilise un domaine{" "}
                      <strong>{commune.email_domain}</strong> différent de celui
                      du site web <strong>{commune.website_domain}</strong>.
                    </p>
                  )}

                {!commune.email_compliant && isEligible && (
                  <p className={fr.cx("fr-text--bold")}>
                    <Badge severity="success" noIcon as="span">
                      Bonne nouvelle !
                    </Badge>{" "}
                    La Suite territoriale peut vous aider à obtenir une adresse
                    de messagerie conforme.
                  </p>
                )}
              </>
            )}
          </div>
        </Accordion>

        {/* Eligibility */}
        <Accordion
          titleAs="h2"
          label={
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
              <span
                className={fr.cx("fr-icon-user-line", "fr-mr-1w")}
                aria-hidden="true"
              />
              Éligible à la Suite territoriale :&nbsp;
              <div className={fr.cx("fr-ml-2w")}>
                {isEligible ? (
                  <Badge
                    severity="success"
                    small
                    style={{ marginBottom: "0.25rem", marginTop: "0.25rem" }}
                  >
                    Oui
                  </Badge>
                ) : (
                  <Badge
                    severity="info"
                    small
                    style={{ marginBottom: "0.25rem", marginTop: "0.25rem" }}
                  >
                    Nous contacter
                  </Badge>
                )}
              </div>
            </div>
          }
        >
          <ul>
            <li>
              <strong>Population de la commune :</strong>{" "}
              {commune.population.toLocaleString("fr-FR")} habitants
            </li>

            {commune.epci_name && commune.epci_population && (
              <li>
                <strong>Intercommunalité :</strong> {commune.epci_name},{" "}
                {commune.epci_population.toLocaleString("fr-FR")} habitants
              </li>
            )}
          </ul>
          <div className={fr.cx("fr-mt-2w")}>
            {isEligible ? (
              <p>
                <span
                  className={fr.cx("fr-icon-success-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-success)" }}
                  aria-hidden="true"
                ></span>
                La commune est éligible à la Suite territoriale. Vous pouvez dès
                à présent rejoindre le Groupe pilote ci-dessous.
              </p>
            ) : (
              <p>
                <span
                  className={fr.cx("fr-icon-info-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-info)" }}
                  aria-hidden="true"
                ></span>
                La commune n&rsquo;est pas directement éligible mais peut
                bénéficier d&rsquo;un accompagnement spécifique.{" "}
                <Link
                  href="mailto:lasuiteterritoriale@anct.gouv.fr"
                  className={fr.cx("fr-link")}
                >
                  Contactez-nous pour en discuter
                </Link>{" "}
                !
              </p>
            )}
          </div>
        </Accordion>
      </div>

      {commune.url_service_public && (
        <p
          className={fr.cx("fr-mt-2w", "fr-text--xs", "fr-label--disabled")}
          style={{ textAlign: "right" }}
        >
          Mettre les informations à jour sur l&rsquo;
          <Link
            href={commune.url_service_public + "/demande-de-mise-a-jour"}
            target="_blank"
            rel="noopener"
          >
            Annuaire du Service Public
          </Link>
        </p>
      )}
    </div>
  );
}
