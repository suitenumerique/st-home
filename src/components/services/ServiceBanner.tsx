import { type ServiceBannerBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";

const SECTION_PADDING = 60;
// Displayed size, whatever the intrinsic size of the asset.
const ILLUSTRATION_WIDTH = 300;

/**
 * A tinted band pointing somewhere off the page, with an illustration standing
 * on its bottom edge: the illustration overflows the band's bottom padding and
 * is cropped by it, as in the mockup.
 */
export default function ServiceBanner({ block }: { block: ServiceBannerBlock }) {
  const { illustration } = block;

  return (
    <section style={{ backgroundColor: "var(--background-alt-blue-france)", overflow: "hidden" }}>
      <div
        className={fr.cx("fr-container")}
        style={{ paddingTop: SECTION_PADDING, paddingBottom: SECTION_PADDING }}
      >
        <div className={fr.cx("fr-grid-row", "fr-grid-row--bottom")}>
          <div className={fr.cx("fr-col-12", "fr-col-md-7")}>
            <h2 className={fr.cx("fr-text--lg", "fr-text--bold", "fr-mb-2w")}>{block.title}</h2>
            <p className={fr.cx("fr-text--md", "fr-mb-3w")}>{block.description}</p>

            <Link
              href={block.link.href}
              className={fr.cx(
                "fr-btn",
                "fr-btn--secondary",
                "fr-btn--icon-right",
                "fr-icon-arrow-right-up-line",
              )}
            >
              {block.link.text}
            </Link>
          </div>

          {illustration && (
            <div
              className={fr.cx("fr-col-12", "fr-col-md-5")}
              // Cancels the band's bottom padding: the illustration sits on the
              // edge and is cropped by it.
              style={{ marginBottom: -SECTION_PADDING, display: "flex", justifyContent: "center" }}
            >
              <Image
                src={illustration.src}
                alt={illustration.alt}
                width={illustration.width}
                height={illustration.height}
                sizes={`${ILLUSTRATION_WIDTH}px`}
                style={{ width: "100%", height: "auto", maxWidth: ILLUSTRATION_WIDTH }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
