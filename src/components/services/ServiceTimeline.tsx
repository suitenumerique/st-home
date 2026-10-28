import { type ServiceTimelineBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";

const SECTION_PADDING_BOTTOM = 120;

export default function ServiceTimeline({ block }: { block: ServiceTimelineBlock }) {
  return (
    <section className={fr.cx("fr-container")} style={{ paddingBottom: SECTION_PADDING_BOTTOM }}>
      <h2 className={fr.cx("fr-h2", "fr-mb-2w")}>{block.title}</h2>
      <p className={fr.cx("fr-text--md", "fr-mb-4w")}>{block.description}</p>

      <ol className={fr.cx("fr-raw-list", "fr-grid-row", "fr-grid-row--gutters")}>
        {block.steps.map((step, index) => (
          <li key={index} className={`${fr.cx("fr-col-12", "fr-col-md-4")} ${styles.timelineStep}`}>
            <span className={styles.timelineNumber} aria-hidden="true">
              {index + 1}
            </span>
            <div
              className={`${fr.cx("fr-p-2w")} ${styles.linkCard} ${styles.timelineCard} ${styles.interactiveCard}`}
            >
              <p className={fr.cx("fr-text--md", "fr-text--bold", "fr-mb-0")}>
                <Link
                  href={step.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={fr.cx(
                    "fr-link",
                    "fr-raw-link",
                    "fr-link--icon-right",
                    "fr-icon-arrow-right-up-line",
                  )}
                >
                  <span className={styles.linkCardOverlay} aria-hidden="true" />
                  {step.text}
                </Link>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
