import { type ServicePartnersBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";

const SECTION_PADDING = 60;
const LOGOS_GAP = 40;
// Every logo is laid out to the same height, its width following its ratio.
const LOGO_HEIGHT = 70;
const COLUMN_SPLIT = {
  4: ["fr-col-md-4", "fr-col-md-8"],
  5: ["fr-col-md-5", "fr-col-md-7"],
} as const;

/** The national partners of a service, as a row of logos next to a short text. */
export default function ServicePartners({ block }: { block: ServicePartnersBlock }) {
  const [textColumn, logosColumn] = COLUMN_SPLIT[block.textColumns ?? 4];

  return (
    <section style={block.tinted ? { backgroundColor: "var(--background-alt-grey)" } : undefined}>
      <div
        className={fr.cx("fr-container")}
        style={{ paddingTop: SECTION_PADDING, paddingBottom: SECTION_PADDING }}
      >
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--middle")}>
          <div className={fr.cx("fr-col-12", textColumn)}>
            <h2 className={fr.cx("fr-text--lg", "fr-text--bold", "fr-mb-1w")}>{block.title}</h2>
            <p className={fr.cx("fr-text--sm", "fr-mb-0")}>{block.description}</p>

            {block.link && (
              <Link
                href={block.link.href}
                className={fr.cx(
                  "fr-btn",
                  "fr-btn--secondary",
                  "fr-btn--icon-right",
                  "fr-icon-arrow-right-up-line",
                  "fr-mt-3w",
                )}
              >
                {block.link.text}
              </Link>
            )}
          </div>

          <div className={fr.cx("fr-col-12", logosColumn)}>
            <ul
              className={fr.cx("fr-raw-list")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: block.logosAlign === "right" ? "flex-end" : "space-between",
                gap: block.logosAlign === "right" ? LOGOS_GAP : "2rem",
                // One row, whatever the width: below the container it scrolls
                // rather than wrapping or overflowing the page.
                flexWrap: "nowrap",
                overflowX: "auto",
              }}
            >
              {block.logos.map((logo, index) => {
                const height = logo.displayHeight ?? LOGO_HEIGHT;
                const image = (
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width}
                    height={logo.height}
                    // Laid out to a fixed height, so the width follows the ratio.
                    sizes={`${Math.round((height * logo.width) / logo.height)}px`}
                    style={{ display: "block", width: "auto", height }}
                  />
                );

                return (
                  <li key={index} style={{ flex: "0 0 auto" }}>
                    {logo.href ? (
                      <Link
                        href={logo.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={fr.cx("fr-raw-link")}
                      >
                        {image}
                      </Link>
                    ) : (
                      image
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
