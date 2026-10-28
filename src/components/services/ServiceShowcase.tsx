import {
  CONTAINER_CONTENT_WIDTH,
  type DeploymentStats,
  type ServiceShowcaseBlock,
} from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";

const SECTION_PADDING_TOP = 60;
const SECTION_PADDING_BOTTOM = 120;
const CARD_RADIUS = 8;

export default function ServiceShowcase({
  block,
  stats,
}: {
  block: ServiceShowcaseBlock;
  stats: DeploymentStats | null;
}) {
  const { card } = block;

  return (
    <section
      className={fr.cx("fr-container")}
      style={{ paddingTop: SECTION_PADDING_TOP, paddingBottom: SECTION_PADDING_BOTTOM }}
    >
      <h2 className={fr.cx("fr-h2", "fr-mb-2w")}>{block.title}</h2>
      <p className={fr.cx("fr-text--md", "fr-mb-4w")}>{block.description}</p>

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: CARD_RADIUS,
          backgroundColor: "var(--background-alt-grey)",
        }}
      >
        {/* The map sits on the right of the image, the left being the card's grey:
            on mobile the text takes the whole card and the map would run under it. */}
        <div className={fr.cx("fr-hidden", "fr-unhidden-md")}>
          <Image
            src={card.background.src}
            alt={card.background.alt}
            fill
            sizes={`(min-width: 78rem) ${CONTAINER_CONTENT_WIDTH}px, 100vw`}
            style={{ objectFit: "cover", objectPosition: "right center" }}
          />
        </div>

        <div className={fr.cx("fr-grid-row")} style={{ position: "relative" }}>
          <div className={fr.cx("fr-col-12", "fr-col-md-7", "fr-p-3w")}>
            <h3 className={fr.cx("fr-h5", "fr-mb-2w")}>{card.title}</h3>
            <p className={fr.cx("fr-text--md", "fr-mb-3w")}>{card.description}</p>

            {stats && (
              <ul
                className={fr.cx("fr-raw-list", "fr-pt-3w")}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1.5rem 3rem",
                  borderTop: "1px solid var(--border-default-grey)",
                }}
              >
                {card.stats.map((stat, index) => (
                  <li key={index}>
                    <p className={fr.cx("fr-h4", "fr-mb-0")}>
                      {stats[stat.stat].toLocaleString("fr-FR")}
                    </p>
                    <p className={fr.cx("fr-text--xs", "fr-mb-0")}>{stat.label}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
