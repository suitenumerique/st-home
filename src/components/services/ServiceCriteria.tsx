import { CONTAINER_CONTENT_WIDTH, type ServiceCriteriaBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";

const SECTION_PADDING_BOTTOM = 120;
const MEDIA_HEIGHT = 155;
const TEXT_PADDING_BOTTOM = 28;

export default function ServiceCriteria({ block }: { block: ServiceCriteriaBlock }) {
  return (
    <section className={fr.cx("fr-container")} style={{ paddingBottom: SECTION_PADDING_BOTTOM }}>
      <h2 className={fr.cx("fr-h2", "fr-mb-2w")}>{block.title}</h2>
      <p className={fr.cx("fr-text--md", "fr-mb-4w")}>{block.description}</p>

      <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
        {block.criteria.map((criterion, index) => (
          <div key={index} className={fr.cx("fr-col-12", "fr-col-md-4")}>
            <div className={styles.criterionCard}>
              <div className={fr.cx("fr-p-3w")} style={{ paddingBottom: TEXT_PADDING_BOTTOM }}>
                <h3 className={`${fr.cx("fr-text--md", "fr-mb-2w")} ${styles.criterionTitle}`}>
                  {criterion.title}
                </h3>
                <p className={fr.cx("fr-text--sm", "fr-mb-0")}>{criterion.description}</p>
              </div>

              <div className={styles.criterionMedia} style={{ height: MEDIA_HEIGHT }}>
                <Image
                  src={criterion.illustration.src}
                  alt={criterion.illustration.alt}
                  width={criterion.illustration.width}
                  height={criterion.illustration.height}
                  sizes={`(min-width: 78rem) ${Math.round(CONTAINER_CONTENT_WIDTH / 3)}px, (min-width: 48em) 33vw, 100vw`}
                  className={styles.criterionImage}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {block.link && (
        <p className={fr.cx("fr-mt-6w", "fr-mb-0")} style={{ textAlign: "center" }}>
          <Link
            href={block.link.href}
            className={fr.cx(
              "fr-link",
              "fr-link--lg",
              "fr-link--icon-right",
              "fr-icon-arrow-right-up-line",
            )}
          >
            {block.link.text}
          </Link>
        </p>
      )}
    </section>
  );
}
