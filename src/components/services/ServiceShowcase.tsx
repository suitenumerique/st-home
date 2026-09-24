import { CONTAINER_CONTENT_WIDTH, type ServiceShowcaseBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";

const SECTION_PADDING_TOP = 60;
const SECTION_PADDING_BOTTOM = 120;

export default function ServiceShowcase({ block }: { block: ServiceShowcaseBlock }) {
  const { illustration } = block;

  return (
    <section
      className={fr.cx("fr-container")}
      style={{ paddingTop: SECTION_PADDING_TOP, paddingBottom: SECTION_PADDING_BOTTOM }}
    >
      <h2 className={fr.cx("fr-h2", "fr-mb-2w")}>{block.title}</h2>
      <p className={fr.cx("fr-text--md", "fr-mb-4w")}>{block.description}</p>

      <Image
        src={illustration.src}
        alt={illustration.alt}
        width={illustration.width}
        height={illustration.height}
        sizes={`(min-width: 78rem) ${CONTAINER_CONTENT_WIDTH}px, 100vw`}
        style={{ width: "100%", height: "auto" }}
      />
    </section>
  );
}
