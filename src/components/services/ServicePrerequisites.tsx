import { CONTAINER_CONTENT_WIDTH, type ServicePrerequisitesBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";

const SECTION_PADDING_BOTTOM = 120;

export default function ServicePrerequisites({ block }: { block: ServicePrerequisitesBlock }) {
  return (
    <section className={fr.cx("fr-container")} style={{ paddingBottom: SECTION_PADDING_BOTTOM }}>
      <h2 className={fr.cx("fr-h2", "fr-mb-2w")}>{block.title}</h2>
      <p className={fr.cx("fr-text--md", "fr-mb-4w")}>{block.description}</p>

      <ul className={fr.cx("fr-raw-list", "fr-grid-row", "fr-grid-row--gutters")}>
        {block.illustrations.map((illustration) => (
          <li
            key={illustration.src}
            className={fr.cx("fr-col-12", !illustration.fullWidth && "fr-col-md-6")}
          >
            <Image
              src={illustration.src}
              alt={illustration.alt}
              width={illustration.width}
              height={illustration.height}
              sizes={
                illustration.fullWidth
                  ? `(min-width: 78rem) ${CONTAINER_CONTENT_WIDTH}px, 100vw`
                  : `(min-width: 78rem) ${CONTAINER_CONTENT_WIDTH / 2}px, (min-width: 48rem) 50vw, 100vw`
              }
              style={{ display: "block", width: "100%", height: "auto" }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
