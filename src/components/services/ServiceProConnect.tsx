import { ELIGIBILITY_SEARCH_ANCHOR, type ServicePage } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";

// Air above and below the block, as in the mockup.
const SECTION_PADDING = 120;
const LOGO_SIZE = 100;

const INTRO_MAX_WIDTH = "40rem";
const CARDS_MAX_WIDTH = "45rem";
const DOMAINES_URL = "/services/domaines";
const MESSAGES_URL = "/services/messages";
const REFERENTIEL_URL = "/conformite/referentiel";

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
    description: <>Avec Domaines, réservez votre nom de domaine conforme.</>,
  },
  {
    icon: { src: "/images/rcpnt-messagerie-mono.svg", width: 33, height: 35 },
    title: <>Adresses mails nominatives</>,
    slug: "messages",
    href: MESSAGES_URL,
    description: <>Avec Messages, créez des adresses de messageries professionnelles.</>,
  },
];

export default function ServiceProConnect({ service }: { service: ServicePage }) {
  return (
    <section
      className={fr.cx("fr-container")}
      style={{ paddingTop: SECTION_PADDING, paddingBottom: SECTION_PADDING }}
    >
      {/* The logo and the heading span the container: at 32px the heading needs
          more than the width of the text below it to hold on one line. */}
      <div style={{ textAlign: "center" }}>
        <Image
          src="/images/logo-proconnect-new.svg"
          alt="ProConnect"
          width={LOGO_SIZE}
          height={LOGO_SIZE}
          // The asset is 100×112: bounding it to a square keeps its ratio and
          // lands it on the 100px of the mockup.
          style={{ width: "auto", height: "auto", maxWidth: LOGO_SIZE, maxHeight: LOGO_SIZE }}
          className={fr.cx("fr-mb-2w")}
        />
        <h2 className={fr.cx("fr-h2", "fr-mb-2w")}>
          Une authentification sécurisée avec ProConnect
        </h2>
      </div>

      <div style={{ maxWidth: CARDS_MAX_WIDTH, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: INTRO_MAX_WIDTH, margin: "0 auto" }}>
          <p className={fr.cx("fr-text--md", "fr-mb-4w")}>
            L&rsquo;authentification ProConnect nécessite un nom de domaine conforme au{" "}
            <Link href={REFERENTIEL_URL}>Référentiel de la Présence numérique des territoires</Link>
            , et des adresses de messagerie nominatives utilisant ce nom de domaine.
          </p>
        </div>

        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
          {cards.map((card, index) => (
            <div key={index} className={fr.cx("fr-col-12", "fr-col-sm-6")}>
              <div
                className={`${fr.cx("fr-p-3w")} ${styles.linkCard}`}
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
                    <Link
                      href={cardHref(card, service)}
                      className={fr.cx(
                        "fr-link",
                        "fr-raw-link",
                        "fr-link--icon-right",
                        "fr-icon-arrow-right-line",
                      )}
                    >
                      <span className={styles.linkCardOverlay} aria-hidden="true" />
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
  return card.slug === service.slug && service.hero.eligibilitySearch
    ? `#${ELIGIBILITY_SEARCH_ANCHOR}`
    : card.href;
}
