import type { Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import type { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import Link from "next/link";

export type CommuneInfoProps = {
  commune: Commune;
};

export const getBadge = (severity: AlertProps.Severity, label: string) => {
  return (
    <Badge
      severity={severity}
      small
      style={{ marginBottom: "0.25rem", marginTop: "0.25rem" }}
    >
      {label}
    </Badge>
  );
};

/**
 * Component showing detailed commune information in expandable sections
 */
export default function CommuneInfo({ commune }: CommuneInfoProps) {
  const isEligible = commune.st_eligible;

  const issues = (commune.issues || ["IN_PROGRESS"]) as string[];
  const rcpnt = (commune.rcpnt || []) as string[];

  const inProgress = issues.includes("IN_PROGRESS");

  const websiteMissing =
    issues.includes("WEBSITE_MISSING") || issues.includes("WEBSITE_MALFORMED");
  const websiteCompliant = rcpnt.includes("1.a");

  const emailMissing =
    issues.includes("EMAIL_MISSING") || issues.includes("EMAIL_MALFORMED");

  const emailCompliant = rcpnt.includes("2.a");

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
                {inProgress &&
                  !websiteMissing &&
                  getBadge("warning", "Vérifications en cours")}
                {websiteMissing
                  ? getBadge("error", "Manquant")
                  : websiteCompliant
                    ? getBadge("success", "Conforme")
                    : getBadge("error", "Non conforme")}
              </div>
            </div>
          }
        >
          <div className={fr.cx("fr-py-1w")}>
            {websiteMissing && (
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
                  officiel connu des services de l&rsquo;État.{" "}
                  <Link href="/conformite/referentiel#1.1">
                    En savoir plus...
                  </Link>
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
                      commune.service_public_url + "/demande-de-mise-a-jour"
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
            )}

            {!websiteMissing && issues.includes("WEBSITE_DOMAIN_REDIRECT") && (
              <p>
                <span
                  className={fr.cx(
                    "fr-icon-error-line",
                    "fr-label--error",
                    "fr-mr-1w",
                  )}
                  aria-hidden="true"
                ></span>
                L&rsquo;adresse <strong>{commune.website_url}</strong> redirige
                vers un autre domaine non déclaré sur Service-Public.fr.{" "}
                <Link href="/conformite/referentiel#1.1">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!websiteMissing && rcpnt.includes("1.2") && (
              <p>
                <span
                  className={fr.cx(
                    "fr-icon-success-line",
                    "fr-label--success",
                    "fr-mr-1w",
                  )}
                  aria-hidden="true"
                ></span>
                L&rsquo;extension <strong>.{commune.website_tld}</strong> du nom
                de domaine{" "}
                <Link
                  href={commune.website_url || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {commune.website_domain}
                </Link>{" "}
                est bien souveraine.{" "}
                <Link href="/conformite/referentiel#1.2">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!websiteMissing && !rcpnt.includes("1.2") && (
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
                n&rsquo;est pas souveraine.{" "}
                <Link href="/conformite/referentiel#1.2">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!websiteMissing && issues.includes("WEBSITE_DECLARED_HTTP") && (
              <p>
                <span
                  className={fr.cx("fr-icon-warning-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-warning)" }}
                  aria-hidden="true"
                ></span>
                Le domaine{" "}
                <Link
                  href={commune.website_url || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {commune.website_domain}
                </Link>{" "}
                est déclaré en HTTP (et non HTTPS) sur Service-Public.fr.{" "}
                <Link href="/conformite/referentiel#1.7">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!websiteMissing && issues.includes("WEBSITE_HTTPS_NOWWW") && (
              <p>
                <span
                  className={fr.cx("fr-icon-warning-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-warning)" }}
                  aria-hidden="true"
                ></span>
                L&rsquo;adresse{" "}
                <strong>
                  https://
                  {(commune.website_url || "").replace(/^https?:\/\/www\./, "")}
                </strong>{" "}
                (sans www.) ne redirige pas correctement vers le site Internet
                de la commune.{" "}
                <Link href="/conformite/referentiel#1.7">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!websiteMissing && issues.includes("WEBSITE_HTTP_NOWWW") && (
              <p>
                <span
                  className={fr.cx("fr-icon-warning-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-warning)" }}
                  aria-hidden="true"
                ></span>
                L&rsquo;adresse{" "}
                <strong>
                  http://
                  {(commune.website_url || "").replace(/^https?:\/\/www\./, "")}
                </strong>{" "}
                (sans www.) ne redirige pas correctement vers le site Internet
                de la commune.{" "}
                <Link href="/conformite/referentiel#1.7">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!websiteMissing && issues.includes("WEBSITE_HTTP_REDIRECT") && (
              <p>
                <span
                  className={fr.cx(
                    "fr-icon-error-line",
                    "fr-label--error",
                    "fr-mr-1w",
                  )}
                  aria-hidden="true"
                ></span>
                L&rsquo;adresse en HTTP{" "}
                <strong>
                  http://
                  {(commune.website_url || "").replace(/^https?:\/\//, "")}
                </strong>{" "}
                ne redirige pas correctement vers la version HTTPS du site
                Internet de la commune.
                <Link href="/conformite/referentiel#1.4">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!websiteMissing && issues.includes("WEBSITE_SSL") && (
              <p>
                <span
                  className={fr.cx(
                    "fr-icon-error-line",
                    "fr-label--error",
                    "fr-mr-1w",
                  )}
                  aria-hidden="true"
                ></span>
                Le certificat SSL du site web de la commune n&rsquo;est pas
                valide.{" "}
                <Link href="/conformite/referentiel#1.5">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!websiteMissing && issues.includes("WEBSITE_DOWN") && (
              <p>
                <span
                  className={fr.cx(
                    "fr-icon-error-line",
                    "fr-label--error",
                    "fr-mr-1w",
                  )}
                  aria-hidden="true"
                ></span>
                Le site web de la commune n&rsquo;est pas joignable.{" "}
                <Link href="/conformite/referentiel#1.3">
                  En savoir plus...
                </Link>
              </p>
            )}

            {websiteCompliant && isEligible && (
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
                {inProgress &&
                  !emailMissing &&
                  getBadge("warning", "Vérifications en cours")}
                {emailMissing
                  ? getBadge("error", "Manquante")
                  : emailCompliant
                    ? getBadge("success", "Conforme")
                    : getBadge("error", "Non conforme")}
              </div>
            </div>
          }
        >
          <div className={fr.cx("fr-py-1w")}>
            {emailMissing && (
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
                  messagerie connue des services de l&rsquo;État.{" "}
                  <Link href="/conformite/referentiel#2.1">
                    En savoir plus...
                  </Link>
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
                      commune.service_public_url + "/demande-de-mise-a-jour"
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
            )}

            {!emailMissing && issues.includes("EMAIL_DOMAIN_EXTENSION") && (
              <p>
                <span
                  className={fr.cx("fr-icon-success-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-success)" }}
                  aria-hidden="true"
                ></span>
                L&rsquo;extension <strong>.{commune.email_tld}</strong> de
                l&rsquo;adresse de messagerie{" "}
                <strong>{commune.email_official}</strong> n&rsquo;est pas
                souveraine.{" "}
                <Link href="/conformite/referentiel#1.2">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!emailMissing && issues.includes("EMAIL_DOMAIN_GENERIC") && (
              <p>
                <span
                  className={fr.cx("fr-icon-error-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-error)" }}
                  aria-hidden="true"
                ></span>
                Le domaine <strong>{commune.email_domain}</strong> générique ne
                permet pas aux usagers de vérifier l&rsquo;authenticité de la
                messagerie.{" "}
                <Link href="/conformite/referentiel#2.2">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!emailMissing && issues.includes("EMAIL_DOMAIN_MISMATCH") && (
              <p>
                <span
                  className={fr.cx("fr-icon-error-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-error)" }}
                  aria-hidden="true"
                ></span>
                L&rsquo;adresse de messagerie utilise un domaine{" "}
                <strong>{commune.email_domain}</strong> différent de celui du
                site web <strong>{commune.website_domain}</strong>.{" "}
                <Link href="/conformite/referentiel#2.3">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!emailMissing && issues.includes("DNS_DOWN") && (
              <p>
                <span
                  className={fr.cx("fr-icon-error-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-error)" }}
                  aria-hidden="true"
                ></span>
                Le serveur DNS du domaine de messagerie{" "}
                <strong>{commune.email_domain}</strong> n&rsquo;est pas
                joignable.{" "}
                <Link href="/conformite/referentiel#2.4">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!emailMissing && issues.includes("DNS_MX_MISSING") && (
              <p>
                <span
                  className={fr.cx("fr-icon-error-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-error)" }}
                  aria-hidden="true"
                ></span>
                Aucun enregistrement MX n&rsquo;est configuré sur le domaine de
                messagerie <strong>{commune.email_domain}</strong>. La
                messagerie ne peut recevoir aucun email.{" "}
                <Link href="/conformite/referentiel#2.4">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!emailMissing && issues.includes("DNS_SPF_MISSING") && (
              <p>
                <span
                  className={fr.cx("fr-icon-warning-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-warning)" }}
                  aria-hidden="true"
                ></span>
                Aucun enregistrement SPF n&rsquo;est configuré sur le domaine de
                messagerie <strong>{commune.email_domain}</strong>.{" "}
                <Link href="/conformite/referentiel#2.5">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!emailMissing && issues.includes("DNS_DMARC_MISSING") && (
              <p>
                <span
                  className={fr.cx("fr-icon-warning-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-warning)" }}
                  aria-hidden="true"
                ></span>
                Aucun enregistrement DMARC n&rsquo;est configuré sur le domaine
                de messagerie <strong>{commune.email_domain}</strong>.{" "}
                <Link href="/conformite/referentiel#2.6">
                  En savoir plus...
                </Link>
              </p>
            )}

            {!emailMissing && issues.includes("DNS_DMARC_MISSING") && (
              <p>
                <span
                  className={fr.cx("fr-icon-warning-line", "fr-mr-1w")}
                  style={{ color: "var(--text-default-warning)" }}
                  aria-hidden="true"
                ></span>
                Un enregistrement DMARC existe sur le domaine de messagerie{" "}
                <strong>{commune.email_domain}</strong> mais il pourrait être
                plus strict.{" "}
                <Link href="/conformite/referentiel#2.7">
                  En savoir plus...
                </Link>
              </p>
            )}
            {(emailMissing ||
              issues.includes("EMAIL_DOMAIN_MISMATCH") ||
              issues.includes("EMAIL_DOMAIN_GENERIC") ||
              issues.includes("EMAIL_DOMAIN_EXTENSION")) &&
              isEligible && (
                <p className={fr.cx("fr-text--bold")}>
                  <Badge severity="success" noIcon as="span">
                    Bonne nouvelle !
                  </Badge>{" "}
                  La Suite territoriale peut vous aider à obtenir une adresse de
                  messagerie conforme.
                </p>
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
                {isEligible
                  ? getBadge("success", "Oui")
                  : getBadge("info", "Nous contacter")}
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

      {commune.service_public_url && (
        <p
          className={fr.cx("fr-mt-2w", "fr-text--xs", "fr-label--disabled")}
          style={{ textAlign: "right" }}
        >
          Mettre les informations à jour sur l&rsquo;
          <Link
            href={commune.service_public_url + "/demande-de-mise-a-jour"}
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
