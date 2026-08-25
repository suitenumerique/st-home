import { type ServiceFaqBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";

// Narrower than the container: long question labels and answers stay readable.
const COLUMN_MAX_WIDTH = "56rem";

export default function ServiceFaq({ block }: { block: ServiceFaqBlock }) {
  return (
    <section className={`${fr.cx("fr-container")} ${styles.section}`}>
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
