import type { Commune } from "@/lib/onboarding";
import { ISO_3166_1_ALPHA_2_TO_NAME } from "@/lib/string";
import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import type { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import Link from "next/link";
import { ReactNode, useState } from "react";

export type CommuneInfoProps = {
  commune: Commune;
  servicePublicUrlOnExpand?: boolean;
};

export const getBadge = (severity: AlertProps.Severity, label: string) => {
  return (
    <Badge severity={severity} small style={{ marginBottom: "0.25rem", marginTop: "0.25rem" }}>
      {label}
    </Badge>
  );
};

type MessageLineProps = {
  children: ReactNode;
  severity: AlertProps.Severity;
  rcpnt?: string;
};

export const MessageLine = ({ children, severity, rcpnt }: MessageLineProps): ReactNode => {
  return (
    <li>
      {severity === "info" && (
        <span
          className={fr.cx("fr-icon-info-line", "fr-label--info", "fr-mr-1w")}
          role="img"
          aria-label="Recommandation"
        />
      )}
      {severity === "success" && (
        <span
          className={fr.cx("fr-icon-success-line", "fr-label--success", "fr-mr-1w")}
          role="img"
          aria-label="Conforme"
        />
      )}
      {severity === "error" && (
        <span
          className={fr.cx("fr-icon-error-line", "fr-label--error", "fr-mr-1w")}
          role="img"
          aria-label="A risque"
        />
      )}
      {severity === "warning" && (
        <span
          className={fr.cx("fr-icon-warning-line", "fr-mr-1w")}
          style={{ color: "var(--text-default-warning)" }}
          role="img"
          aria-label="Attention"
        />
      )}
      {children}{" "}
      {rcpnt && (
        <Link
          href={`/conformite/referentiel#${rcpnt}`}
          style={{ color: "var(--text-default-grey)" }}
        >
          (Critère {rcpnt})
        </Link>
      )}
    </li>
  );
};

/**
 * Component showing detailed commune information in expandable sections
 */
export default function CommuneInfo({
  commune,
  servicePublicUrlOnExpand = false,
}: CommuneInfoProps) {
  const isEligible = commune.st_eligible;

  const issues = (commune.issues || ["IN_PROGRESS"]) as string[];
  const rcpnt = (commune.rcpnt || []) as string[];

  // console.log("RCPNT data", rcpnt.join(", "), issues.join(", "));

  const inProgress = issues.includes("IN_PROGRESS");

  const websiteMissing = !rcpnt.includes("1.1");
  const websiteCompliant = rcpnt.includes("1.a");
  const websiteInvalid = issues.includes("WEBSITE_MALFORMED");

  const emailMissing = !rcpnt.includes("2.1");
  const emailCompliant = rcpnt.includes("2.a");
  const emailInvalid = issues.includes("EMAIL_MALFORMED");

  const emailDomain = commune.email_domain || "";
  const websiteDomain = (commune.website_domain || "").replace(/^www\./, "");

  const hasWebsiteRecommendations = rcpnt.includes("1.a") && !rcpnt.includes("1.aa");
  const hasEmailRecommendations = rcpnt.includes("2.a") && !rcpnt.includes("2.aa");

  const [websiteExpanded, setWebsiteExpanded] = useState(false);
  const [emailExpanded, setEmailExpanded] = useState(false);

  const dilaUpdateLink = (
    <Link
      href={commune.service_public_url + "/demande-de-mise-a-jour"}
      target="_blank"
      rel="noopener"
    >
      Service-Public.gouv.fr
    </Link>
  );

  const websiteContent = (
    <>
      {issues.includes("WEBSITE_MISSING") && (
        <>
          <MessageLine severity="error" rcpnt="1.1">
            La collectivité ne dispose pas encore d&rsquo;un site internet connu des services de
            l&rsquo;État.
          </MessageLine>

          <MessageLine severity="info">
            Si vous en possédez un, vous devez le déclarer sur {dilaUpdateLink}.
          </MessageLine>

          {isEligible && (
            <li className={fr.cx("fr-text--bold")}>
              <Badge severity="success" noIcon as="span">
                Bonne nouvelle !
              </Badge>{" "}
              Si vous n&rsquo;en possédez pas, la Suite territoriale peut vous accompagner à en
              obtenir un.
            </li>
          )}
        </>
      )}

      {issues.includes("WEBSITE_MALFORMED") && (
        <MessageLine severity="error" rcpnt="1.1">
          Un site internet est déclaré pour la collectivité mais il n&rsquo;est pas formaté
          correctement. Veuillez vérifier que votre site internet correspond au format{" "}
          <strong>https://domaine.extension</strong> et qu&rsquo;il ne comporte pas d&rsquo;accents.
        </MessageLine>
      )}

      {rcpnt.includes("1.1") && (
        <>
          {rcpnt.includes("1.2") && (
            <MessageLine severity="success" rcpnt="1.2">
              L&rsquo;extension <strong>.{commune.website_tld}</strong> du nom de domaine{" "}
              <Link href={commune.website_url || ""} target="_blank" rel="noopener noreferrer">
                {websiteDomain}
              </Link>{" "}
              est bien souveraine.
            </MessageLine>
          )}

          {!rcpnt.includes("1.2") && (
            <MessageLine severity="error" rcpnt="1.2">
              L&rsquo;extension <strong>.{commune.website_tld}</strong> du nom de domaine{" "}
              <Link href={commune.website_url || ""} target="_blank" rel="noopener noreferrer">
                {websiteDomain}
              </Link>{" "}
              n&rsquo;est pas souveraine.
            </MessageLine>
          )}

          {issues.includes("EMAIL_DOMAIN_MISMATCH") && !rcpnt.includes("1.2") && (
            <MessageLine severity="error" rcpnt="2.3">
              Le site internet utilise un domaine <strong>{websiteDomain}</strong> différent de
              celui de la messagerie <strong>{emailDomain}</strong>.
            </MessageLine>
          )}

          {!rcpnt.includes("1.3") && (
            <MessageLine severity="error" rcpnt="1.3">
              Le site internet de la collectivité n&rsquo;est pas joignable.
            </MessageLine>
          )}

          {rcpnt.includes("1.3") && issues.includes("WEBSITE_HTTP_REDIRECT") && (
            <MessageLine severity="error" rcpnt="1.4">
              L&rsquo;adresse en HTTP{" "}
              <strong>
                http://
                {(commune.website_url || "").replace(/^https?:\/\//, "")}
              </strong>{" "}
              ne redirige pas tous les navigateurs vers la version HTTPS du site.
            </MessageLine>
          )}

          {rcpnt.includes("1.3") && !rcpnt.includes("1.5") && (
            <MessageLine severity="error" rcpnt="1.5">
              Le certificat SSL du site internet de la collectivité n&rsquo;est pas valide.
            </MessageLine>
          )}

          {rcpnt.includes("1.3") && rcpnt.includes("1.4") && rcpnt.includes("1.5") && (
            <MessageLine severity="success" rcpnt="1.4">
              Le site internet utilise bien HTTPS avec un certificat valide.
            </MessageLine>
          )}

          {rcpnt.includes("1.3") && !rcpnt.includes("1.6") && (
            <MessageLine severity="error" rcpnt="1.6">
              L&rsquo;adresse <strong>{commune.website_url}</strong> redirige vers un autre domaine
              non déclaré sur Service-Public.gouv.fr.
            </MessageLine>
          )}

          {rcpnt.includes("1.3") &&
            issues.includes("WEBSITE_HTTPS_NOWWW") &&
            issues.includes("WEBSITE_HTTP_NOWWW") && (
              <MessageLine severity="warning" rcpnt="1.7">
                Les adresses{" "}
                <strong>
                  http://
                  {(commune.website_url || "").replace(/^https?:\/\/www\./, "")}
                </strong>{" "}
                et{" "}
                <strong>
                  https://
                  {(commune.website_url || "").replace(/^https?:\/\/www\./, "")}
                </strong>{" "}
                (sans www.) ne redirigent pas vers le site internet de la collectivité.
              </MessageLine>
            )}

          {rcpnt.includes("1.3") &&
            issues.includes("WEBSITE_HTTPS_NOWWW") &&
            !issues.includes("WEBSITE_HTTP_NOWWW") && (
              <MessageLine severity="warning" rcpnt="1.7">
                L&rsquo;adresse{" "}
                <strong>
                  https://
                  {(commune.website_url || "").replace(/^https?:\/\/www\./, "")}
                </strong>{" "}
                (sans www.) ne redirige pas vers le site internet de la collectivité.
              </MessageLine>
            )}

          {rcpnt.includes("1.3") &&
            issues.includes("WEBSITE_HTTP_NOWWW") &&
            !issues.includes("WEBSITE_HTTPS_NOWWW") && (
              <MessageLine severity="warning" rcpnt="1.7">
                L&rsquo;adresse{" "}
                <strong>
                  http://
                  {(commune.website_url || "").replace(/^https?:\/\/www\./, "")}
                </strong>{" "}
                (sans www.) ne redirige pas vers le site internet de la collectivité.
              </MessageLine>
            )}

          {!rcpnt.includes("1.8") && (
            <MessageLine severity="warning" rcpnt="1.8">
              Le site internet{" "}
              <Link href={commune.website_url || ""} target="_blank" rel="noopener noreferrer">
                {websiteDomain}
              </Link>{" "}
              est déclaré en HTTP (et non HTTPS) sur Service-Public.gouv.fr.
            </MessageLine>
          )}

          {websiteCompliant && isEligible && (
            <MessageLine severity="success">
              Vous pourrez réutiliser ce nom de domaine au sein de la Suite territoriale !
            </MessageLine>
          )}
        </>
      )}
    </>
  );

  const emailContent = (
    <>
      {emailMissing && (
        <>
          {emailInvalid && (
            <>
              <MessageLine severity="error" rcpnt="2.1">
                Une adresse de messagerie est déclarée mais elle n&rsquo;est pas valide. Vérifiez
                qu&rsquo;elle ne contient ni espaces, ni caractères spéciaux et respecte le format{" "}
                <strong>nom@domaine.extension</strong>
              </MessageLine>
              <MessageLine severity="info">
                Vous pouvez la corriger sur {dilaUpdateLink}.
              </MessageLine>
            </>
          )}

          {!emailInvalid && (
            <>
              <MessageLine severity="error" rcpnt="2.1">
                La collectivité ne dispose pas encore d&rsquo;une adresse de messagerie connue des
                services de l&rsquo;État.
              </MessageLine>
              <MessageLine severity="info">
                Si vous en possédez une, vous devez la déclarer sur {dilaUpdateLink}.
              </MessageLine>

              {isEligible && (
                <MessageLine severity="success">
                  Si vous n&rsquo;en possédez pas, la Suite territoriale peut vous aider à en
                  obtenir une.
                </MessageLine>
              )}
            </>
          )}
        </>
      )}

      {!emailMissing && (
        <>
          {rcpnt.includes("2.2") && issues.includes("EMAIL_DOMAIN_EXTENSION") && (
            <MessageLine severity="error" rcpnt="1.2">
              L&rsquo;extension <strong>.{commune.email_tld}</strong> du domaine de messagerie{" "}
              <strong>{emailDomain}</strong> n&rsquo;est pas souveraine.
            </MessageLine>
          )}

          {rcpnt.includes("2.2") && !issues.includes("EMAIL_DOMAIN_EXTENSION") && (
            <MessageLine severity="success" rcpnt="1.2">
              L&rsquo;extension <strong>.{commune.email_tld}</strong> du domaine de messagerie{" "}
              <strong>{emailDomain}</strong> est bien souveraine.
            </MessageLine>
          )}

          {!rcpnt.includes("2.2") && (
            <MessageLine severity="error" rcpnt="2.2">
              Le domaine <strong>{emailDomain}</strong> générique ne permet pas aux usagers de
              vérifier l&rsquo;authenticité de la messagerie.
            </MessageLine>
          )}

          {rcpnt.includes("2.2") &&
            issues.includes("EMAIL_DOMAIN_MISMATCH") &&
            rcpnt.includes("1.2") && (
              <MessageLine severity="error" rcpnt="2.3">
                L&rsquo;adresse de messagerie utilise un domaine <strong>{emailDomain}</strong>{" "}
                différent de celui du site internet <strong>{websiteDomain}</strong>.
              </MessageLine>
            )}

          {rcpnt.includes("2.3") && (
            <MessageLine severity="success" rcpnt="2.3">
              L&rsquo;adresse de messagerie utilise le même domaine que le site internet.
            </MessageLine>
          )}

          {issues.includes("DNS_DOWN") && (
            <MessageLine severity="error" rcpnt="2.4">
              Le serveur DNS du domaine de messagerie <strong>{emailDomain}</strong> n&rsquo;est pas
              joignable.
            </MessageLine>
          )}

          {issues.includes("DNS_MX_MISSING") && !issues.includes("DNS_DOWN") && (
            <MessageLine severity="error" rcpnt="2.4">
              Aucun enregistrement MX n&rsquo;est configuré sur le domaine de messagerie{" "}
              <strong>{emailDomain}</strong>. La messagerie ne peut recevoir aucun email.
            </MessageLine>
          )}

          {rcpnt.includes("2.2") && rcpnt.includes("2.5") && (
            <MessageLine severity="success" rcpnt="2.5">
              L&rsquo;enregistrement SPF du domaine <strong>{emailDomain}</strong> est présent.
            </MessageLine>
          )}

          {rcpnt.includes("2.2") && !issues.includes("DNS_DOWN") && !rcpnt.includes("2.5") && (
            <MessageLine severity="info" rcpnt="2.5">
              Nous vous recommandons de configurer un enregistrement SPF sur le domaine de
              messagerie <strong>{emailDomain}</strong>.
            </MessageLine>
          )}

          {rcpnt.includes("2.2") && !issues.includes("DNS_DOWN") && !rcpnt.includes("2.6") && (
            <MessageLine severity="info" rcpnt="2.6">
              Nous vous recommandons de configurer un enregistrement DMARC sur le domaine de
              messagerie <strong>{emailDomain}</strong>.
            </MessageLine>
          )}

          {rcpnt.includes("2.2") && rcpnt.includes("2.6") && !rcpnt.includes("2.7") && (
            <MessageLine severity="success" rcpnt="2.6">
              L&rsquo;enregistrement DMARC du domaine <strong>{emailDomain}</strong> est présent.
            </MessageLine>
          )}

          {rcpnt.includes("2.2") &&
            !issues.includes("DNS_DOWN") &&
            rcpnt.includes("2.6") &&
            !rcpnt.includes("2.7") && (
              <MessageLine severity="info" rcpnt="2.7">
                Nous vous recommandons d&rsquo;utiliser une politique de quarantaine DMARC plus
                stricte.
              </MessageLine>
            )}

          {rcpnt.includes("2.2") && !issues.includes("DNS_DOWN") && rcpnt.includes("2.7") && (
            <MessageLine severity="success" rcpnt="2.7">
              L&rsquo;enregistrement DMARC du domaine <strong>{emailDomain}</strong> utilise une
              politique de quarantaine stricte.
            </MessageLine>
          )}

          {rcpnt.includes("2.1") && !issues.includes("DNS_DOWN") && !rcpnt.includes("2.8") && (
            <MessageLine severity="error" rcpnt="2.8">
              L&rsquo;enregistrement MX désigne un serveur{" "}
              {commune.email_metadata?.mx_tld && (
                <>
                  <strong>{commune.email_metadata?.mx_tld}</strong>
                </>
              )}{" "}
              situé en dehors de l&rsquo;Union européenne
              {commune.email_metadata?.mx_countries_outside_eu &&
                commune.email_metadata?.mx_countries_outside_eu.length > 0 && (
                  <>
                    {" "}
                    (
                    <strong>
                      {ISO_3166_1_ALPHA_2_TO_NAME[
                        commune.email_metadata?.mx_countries_outside_eu[0]
                      ] || commune.email_metadata?.mx_countries_outside_eu[0]}
                    </strong>
                    )
                  </>
                )}
              .
            </MessageLine>
          )}

          {rcpnt.includes("2.1") && rcpnt.includes("2.8") && (
            <MessageLine severity="success" rcpnt="2.8">
              L&rsquo;enregistrement MX désigne un serveur{" "}
              {commune.email_metadata?.mx_tld && (
                <>
                  <strong>{commune.email_metadata?.mx_tld}</strong>
                </>
              )}{" "}
              situé dans l&rsquo;Union européenne
              {commune.email_metadata?.mx_countries &&
                commune.email_metadata?.mx_countries.length > 0 && (
                  <>
                    {" "}
                    (
                    <strong>
                      {ISO_3166_1_ALPHA_2_TO_NAME[commune.email_metadata?.mx_countries[0]] ||
                        commune.email_metadata?.mx_countries[0]}
                    </strong>
                    )
                  </>
                )}
              .
            </MessageLine>
          )}

          {!emailCompliant && isEligible && (
            <li className={fr.cx("fr-text--bold")}>
              <Badge severity="success" noIcon as="span">
                Bonne nouvelle !
              </Badge>{" "}
              La Suite territoriale peut vous aider à obtenir une adresse de messagerie conforme.
            </li>
          )}

          {emailCompliant && isEligible && (
            <MessageLine severity="success">
              Vous pourrez réutiliser cette adresse de messagerie au sein de la Suite territoriale !
            </MessageLine>
          )}
        </>
      )}
    </>
  );

  return (
    <div>
      <div style={{ backgroundColor: "#FFFFFF" }}>
        {/* Website */}
        <Accordion
          titleAs="h2"
          onExpandedChange={(value) => setWebsiteExpanded(value)}
          label={
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
              <span className={fr.cx("fr-icon-global-line", "fr-mr-1w")} aria-hidden="true" />
              Site internet :&nbsp;
              <span style={{ textDecoration: "underline" }}>{commune.website_domain || ""}</span>
              &nbsp;
              <div className={fr.cx("fr-ml-2w", "fr-badges-group", "fr-badges-group--sm")}>
                {websiteInvalid
                  ? getBadge("error", "Invalide")
                  : websiteMissing
                    ? getBadge("error", "Manquant")
                    : websiteCompliant
                      ? getBadge("success", "Conforme")
                      : getBadge("error", "A risque")}
                {!inProgress && hasWebsiteRecommendations && getBadge("warning", "Recommandations")}
                {inProgress && !websiteMissing && getBadge("warning", "Vérifications en cours")}
              </div>
            </div>
          }
        >
          <ul className={fr.cx("fr-py-1w") + " rcpnt-result-list"}>{websiteContent}</ul>
        </Accordion>

        {/* Email */}
        <Accordion
          titleAs="h2"
          onExpandedChange={(value) => setEmailExpanded(value)}
          label={
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
              <span className={fr.cx("fr-icon-mail-line", "fr-mr-1w")} aria-hidden="true" />
              Adresse de messagerie :&nbsp;
              <span style={{ textDecoration: "underline" }}>
                {emailMissing ? "" : commune.email_official || ""}
              </span>
              <div className={fr.cx("fr-ml-2w", "fr-badges-group", "fr-badges-group--sm")}>
                {emailInvalid
                  ? getBadge("error", "Invalide")
                  : emailMissing
                    ? getBadge("error", "Manquante")
                    : emailCompliant
                      ? getBadge("success", "Conforme")
                      : getBadge("error", "A risque")}
                {!inProgress && hasEmailRecommendations && getBadge("warning", "Recommandations")}
                {inProgress && !emailMissing && getBadge("warning", "Vérifications en cours")}
              </div>
            </div>
          }
        >
          <ul className={fr.cx("fr-py-1w") + " rcpnt-result-list"}>{emailContent}</ul>
        </Accordion>
      </div>

      {commune.service_public_url &&
        (!servicePublicUrlOnExpand || websiteExpanded || emailExpanded) && (
          <p
            className={fr.cx("fr-mt-2w", "fr-mb-0", "fr-text--xs", "fr-label--disabled")}
            style={{ textAlign: "right" }}
          >
            {commune.issues_last_checked && (
              <>
                Dernière vérification le {String(commune.issues_last_checked).substring(8, 10)}/
                {String(commune.issues_last_checked).substring(5, 7)}/
                {String(commune.issues_last_checked).substring(0, 4)}.{" "}
              </>
            )}
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
