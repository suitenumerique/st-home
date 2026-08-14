import { type ServiceProConnectBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";

// The block is one centered column, but the cards overhang the text slightly on
// each side, as in the mockups.
const INTRO_MAX_WIDTH = "40rem";
const CARDS_MAX_WIDTH = "45rem";

export default function ServiceProConnect({ block }: { block: ServiceProConnectBlock }) {
  const { logo } = block;

  return (
    // No top padding: the previous block already ends with its own, and the two
    // stacked together left far too much air above the logo.
    <section className={fr.cx("fr-container", "fr-pb-10w")}>
      <div style={{ maxWidth: CARDS_MAX_WIDTH, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: INTRO_MAX_WIDTH, margin: "0 auto" }}>
          {logo && (
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className={fr.cx("fr-mb-2w")}
            />
          )}
          <h2 className={fr.cx("fr-h4", "fr-mb-2w")}>{block.title}</h2>
          <p className={fr.cx("fr-mb-4w")}>{block.description}</p>
        </div>

        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
          {block.cards.map((card, index) => (
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
                  alt={card.icon.alt}
                  width={card.icon.width}
                  height={card.icon.height}
                  style={{ flexShrink: 0 }}
                />
                <div>
                  <h3 className={fr.cx("fr-mb-1w")}>
                    {/* `fr-raw-link` drops the underline: the arrow already
                        marks the title as the card's target. */}
                    <Link
                      href={card.href}
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

        {block.link && (
          <p className={fr.cx("fr-mt-4w", "fr-mb-0")} style={{ textAlign: "center" }}>
            <Link
              href={block.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={fr.cx("fr-link")}
            >
              {block.link.text}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
