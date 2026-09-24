import { type ServiceHelpBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";

const SECTION_PADDING_TOP = 120;
const SECTION_PADDING_BOTTOM = 120;

export default function ServiceHelp({ block }: { block: ServiceHelpBlock }) {
  return (
    <section
      className={fr.cx("fr-container")}
      style={{ paddingTop: SECTION_PADDING_TOP, paddingBottom: SECTION_PADDING_BOTTOM }}
    >
      <h2 className={fr.cx("fr-h2", "fr-mb-2w")}>{block.title}</h2>
      <p className={fr.cx("fr-text--md", "fr-mb-4w")}>{block.description}</p>

      <ul className={fr.cx("fr-raw-list", "fr-grid-row", "fr-grid-row--gutters")}>
        {block.articles.map((article, index) => (
          <li key={index} className={fr.cx("fr-col-12", "fr-col-md-4")}>
            <div
              className={`${fr.cx("fr-p-3w")} ${styles.linkCard} ${styles.helpCard}`}
              style={{ height: "100%" }}
            >
              <h3 className={`${fr.cx("fr-text--md", "fr-mb-1w")} ${styles.criterionTitle}`}>
                <Link
                  href={article.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={fr.cx("fr-link", "fr-raw-link")}
                >
                  <span className={styles.linkCardOverlay} aria-hidden="true" />
                  {article.title}
                </Link>
              </h3>

              {article.description && (
                <p className={fr.cx("fr-text--sm", "fr-mb-0")}>{article.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
