import { type ServiceProConnectBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";

// The heading and intro read as a single centered column, narrower than the
// cards below them.
const INTRO_MAX_WIDTH = "40rem";

export default function ServiceProConnect({ block }: { block: ServiceProConnectBlock }) {
  const { logo } = block;

  return (
    <section className={fr.cx("fr-container", "fr-py-10w")}>
      <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
        <div className={fr.cx("fr-col-12", "fr-col-md-10", "fr-col-lg-8")}>
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
              <div key={index} className={fr.cx("fr-col-12", "fr-col-md-6")}>
                <div
                  className={fr.cx("fr-p-3w")}
                  style={{
                    height: "100%",
                    display: "flex",
                    gap: "0.75rem",
                    border: "1px solid var(--border-default-grey)",
                  }}
                >
                  <span
                    className={fr.cx(card.icon)}
                    aria-hidden="true"
                    style={{ color: "var(--text-title-blue-france)", flexShrink: 0 }}
                  />
                  <div>
                    <h3
                      className={fr.cx("fr-text--lead", "fr-text--bold", "fr-mb-1w")}
                      style={{ color: "var(--text-title-blue-france)" }}
                    >
                      {card.title}
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
      </div>
    </section>
  );
}
