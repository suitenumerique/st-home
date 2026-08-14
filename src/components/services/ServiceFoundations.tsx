import { type ServiceFoundationsBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";

// The intro and the closing sentence read as prose, so they stop well before
// the pillars, which use the full width of the container.
const TEXT_MAX_WIDTH = "34rem";

export default function ServiceFoundations({ block }: { block: ServiceFoundationsBlock }) {
  const { callToAction } = block;

  return (
    <section className={fr.cx("fr-container", "fr-py-10w")}>
      <h2 className={fr.cx("fr-h4", "fr-mb-2w")}>{block.title}</h2>
      <p className={fr.cx("fr-mb-6w")} style={{ maxWidth: TEXT_MAX_WIDTH }}>
        {block.description}
      </p>

      <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
        {block.foundations.map((foundation, index) => (
          <div key={index} className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-lg-3")}>
            <Image
              src={foundation.icon.src}
              alt={foundation.icon.alt}
              width={foundation.icon.width}
              height={foundation.icon.height}
              className={fr.cx("fr-mb-2w")}
            />
            <h3 className={fr.cx("fr-text--md", "fr-text--bold", "fr-mb-1w")}>
              {foundation.title}
            </h3>
            <p className={fr.cx("fr-text--sm", "fr-mb-0")}>{foundation.description}</p>
          </div>
        ))}
      </div>

      {callToAction && (
        <div
          className={fr.cx("fr-mt-8w")}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p className={fr.cx("fr-mb-0")} style={{ maxWidth: TEXT_MAX_WIDTH }}>
            {callToAction.text}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <Link
              href={callToAction.primaryLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className={fr.cx("fr-btn")}
            >
              {callToAction.primaryLink.text}
            </Link>

            {callToAction.secondaryLink && (
              <Link
                href={callToAction.secondaryLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className={fr.cx("fr-btn", "fr-btn--secondary")}
              >
                {callToAction.secondaryLink.text}
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
