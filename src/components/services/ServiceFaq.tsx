import { type ServiceFaqBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";

const COLUMN_MAX_WIDTH = "56rem";

// Air above and below the block, as in the mockup.
const SECTION_PADDING = 120;

export default function ServiceFaq({ block }: { block: ServiceFaqBlock }) {
  return (
    <section
      className={fr.cx("fr-container")}
      style={{ paddingTop: SECTION_PADDING, paddingBottom: SECTION_PADDING }}
    >
      <div style={{ maxWidth: COLUMN_MAX_WIDTH, margin: "0 auto" }}>
        <h2 className={fr.cx("fr-h3", "fr-mb-2w")} style={{ textAlign: "center" }}>
          {block.title}
        </h2>

        {block.description && (
          <p className={fr.cx("fr-mb-4w")} style={{ textAlign: "center" }}>
            {block.description}
          </p>
        )}

        <div className={`${fr.cx("fr-accordions-group")} ${styles.faq}`}>
          {block.items.map((item, index) => (
            <Accordion key={index} label={item.question}>
              {item.answer}
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
}
