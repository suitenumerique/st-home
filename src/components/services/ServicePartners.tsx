import { type ServicePartnersBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";

const SECTION_PADDING = 60;
const LOGOS_GAP = 40;
const LOGO_HEIGHT = 70;

export default function ServicePartners({ block }: { block: ServicePartnersBlock }) {
  return (
    <section style={block.tinted ? { backgroundColor: "var(--background-alt-grey)" } : undefined}>
      <div
        className={fr.cx("fr-container")}
        style={{ paddingTop: SECTION_PADDING, paddingBottom: SECTION_PADDING }}
      >
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--middle")}>
          <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
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

          <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
            <ul
              className={fr.cx("fr-raw-list")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: block.logosAlign === "right" ? "flex-end" : "space-between",
                gap: block.logosAlign === "right" ? LOGOS_GAP : "2rem",
                flexWrap: "nowrap",
                overflowX: "auto",
              }}
            >
              {block.logos.map((logo, index) => {
                const height = logo.displayHeight ?? LOGO_HEIGHT;

                return (
                  <li key={index} style={{ flex: "0 0 auto" }}>
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.width}
                      height={logo.height}
                      sizes={`${Math.round((height * logo.width) / logo.height)}px`}
                      style={{ width: "auto", height }}
                    />
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
