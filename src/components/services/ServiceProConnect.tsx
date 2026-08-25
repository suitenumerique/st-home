import { ELIGIBILITY_SEARCH_ANCHOR, type ServicePage } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";

// The block is one centered column, but the cards overhang the text slightly on
// each side, as in the mockups.
const INTRO_MAX_WIDTH = "40rem";
const CARDS_MAX_WIDTH = "45rem";

// V1: the help centre article on domain names. TODO: point at /services/domaines
// once that page exists.
const DOMAINES_URL = "https://aide.suite.anct.gouv.fr/socle/domaines";
const MESSAGES_URL = "/services/messages";
const REFERENTIEL_URL = "/conformite/referentiel";

/**
 * `slug` names the service the card is about, when that service has a page of
 * its own: on that page the card links back up to the hero eligibility search
 * rather than off to a page the visitor is already reading.
 */
type ProConnectCard = {
  icon: { src: string; width: number; height: number };
  title: ReactNode;
  slug?: string;
  href: string;
  description: ReactNode;
};

const cards: ProConnectCard[] = [
  {
    icon: { src: "/images/rcpnt-site-mono.svg", width: 40, height: 40 },
    title: <>Nom de domaine conforme</>,
    slug: "domaines",
    href: DOMAINES_URL,
    description: <>Avec Domaines, réservez votre nom de domaine conforme</>,
  },
  {
    icon: { src: "/images/rcpnt-messagerie-mono.svg", width: 33, height: 35 },
    title: <>Adresse mail nominative</>,
    slug: "messages",
    href: MESSAGES_URL,
    description: <>Avec Messages, créez des adresses de messageries professionnelles.</>,
  },
];

/**
 * ProConnect gates the whole Suite the same way, so this block is identical on
 * every service page and its content lives here rather than in the service
 * configs. Only the card targets depend on the page being rendered.
 */
export default function ServiceProConnect({ service }: { service: ServicePage }) {
  return (
    <section className={`${fr.cx("fr-container")} ${styles.section}`}>
      <div style={{ maxWidth: CARDS_MAX_WIDTH, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: INTRO_MAX_WIDTH, margin: "0 auto" }}>
          <Image
            src="/images/logo-proconnect-new.svg"
            alt="ProConnect"
            width={100}
            height={112}
            className={fr.cx("fr-mb-2w")}
          />
          <h2 className={fr.cx("fr-h4", "fr-mb-2w")}>
            Une authentifcation sécurisée avec ProConnect
          </h2>
          <p className={fr.cx("fr-mb-4w")}>
            L&rsquo;authentification ProConnect nécessite un nom de domaine conforme au{" "}
            <Link href={REFERENTIEL_URL}>Référentiel de la Présence numérique des territoires</Link>
            , et des adresses de messagerie nominatives utilisant ce nom de domaine.
          </p>
        </div>

        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
          {cards.map((card, index) => (
            <div key={index} className={fr.cx("fr-col-12", "fr-col-sm-6")}>
              <div
                className={`${fr.cx("fr-p-3w")} ${styles.proConnectCard}`}
                style={{
                  height: "100%",
                  display: "flex",
                  gap: "0.75rem",
                  border: "1px solid var(--border-default-grey)",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgb(0 0 0 / 6%)",
                }}
              >
                <Image
                  src={card.icon.src}
                  alt=""
                  width={card.icon.width}
                  height={card.icon.height}
                  style={{ flexShrink: 0 }}
                />
                <div>
                  <h3 className={fr.cx("fr-mb-1w")}>
                    {/* `fr-raw-link` drops the underline: the arrow already
                        marks the title as the card's target. */}
                    <Link
                      href={cardHref(card, service)}
                      className={fr.cx(
                        "fr-link",
                        "fr-raw-link",
                        "fr-link--icon-right",
                        "fr-icon-arrow-right-line",
                      )}
                    >
                      <span className={styles.proConnectCardOverlay} aria-hidden="true" />
                      {card.title}
                    </Link>
                  </h3>
                  <p className={fr.cx("fr-text--sm", "fr-mb-0")}>{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function cardHref(card: ProConnectCard, service: ServicePage): string {
  // The anchor only exists when the page actually renders the search.
  return card.slug === service.slug && service.hero.eligibilitySearch
    ? `#${ELIGIBILITY_SEARCH_ANCHOR}`
    : card.href;
}
