import { type ServicePartnersBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";

const SECTION_PADDING = 60;
// Every logo is laid out to the same height, its width following its ratio.
const LOGO_HEIGHT = 70;

/** The national partners of a service, as a row of logos next to a short text. */
export default function ServicePartners({ block }: { block: ServicePartnersBlock }) {
  return (
    <section
      className={fr.cx("fr-container")}
      style={{ paddingTop: SECTION_PADDING, paddingBottom: SECTION_PADDING }}
    >
      <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--middle")}>
        <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
          <h2 className={fr.cx("fr-text--lg", "fr-text--bold", "fr-mb-1w")}>{block.title}</h2>
          <p className={fr.cx("fr-text--sm", "fr-mb-0")}>{block.description}</p>
        </div>

        <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
          <ul
            className={fr.cx("fr-raw-list")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "2rem",
              // One row, whatever the width: below the container it scrolls
              // rather than wrapping or overflowing the page.
              flexWrap: "nowrap",
              overflowX: "auto",
            }}
          >
            {block.logos.map((logo, index) => (
              <li key={index} style={{ flex: "0 0 auto" }}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  style={{ width: "auto", height: logo.displayHeight ?? LOGO_HEIGHT }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
