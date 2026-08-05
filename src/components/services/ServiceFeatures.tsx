import { type ServiceFeatureRow, type ServiceFeaturesBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";

function FeatureRow({ row, reversed }: { row: ServiceFeatureRow; reversed: boolean }) {
  const { screenshot } = row;

  return (
    <div
      className={
        fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--middle", "fr-mb-12w") +
        ` ${styles.featureRow}` +
        (reversed ? ` ${styles.featureRowReversed}` : "")
      }
    >
      <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
        <h2 className={fr.cx("fr-h4", "fr-mb-2w")}>{row.title}</h2>
        <p className={fr.cx("fr-mb-3w")}>{row.description}</p>

        <ul className={fr.cx("fr-raw-list", "fr-mb-3w", "fr-grid-row", "fr-grid-row--gutters")}>
          {row.highlights.map((highlight, index) => (
            <li
              key={index}
              className={fr.cx(
                "fr-col-12",
                // Two columns only split once there is room for them.
                row.highlightColumns === 2 ? "fr-col-sm-6" : "fr-col-sm-12",
              )}
              style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}
            >
              <span
                className={fr.cx(highlight.icon, "fr-icon--sm")}
                aria-hidden="true"
                style={{ color: "var(--text-title-blue-france)", flexShrink: 0 }}
              />
              <span className={fr.cx("fr-text--sm", "fr-mb-0")}>{highlight.label}</span>
            </li>
          ))}
        </ul>

        {row.link && (
          <Link
            href={row.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={fr.cx("fr-link", "fr-link--icon-right", "fr-icon-arrow-right-up-line")}
          >
            {row.link.text}
          </Link>
        )}
      </div>

      {screenshot && (
        <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
          <Image
            src={screenshot.src}
            alt={screenshot.alt}
            width={screenshot.width}
            height={screenshot.height}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}
    </div>
  );
}

export default function ServiceFeatures({ block }: { block: ServiceFeaturesBlock }) {
  return (
    <section className={fr.cx("fr-container", "fr-py-10w")}>
      {block.rows.map((row, index) => (
        <FeatureRow key={index} row={row} reversed={index % 2 === 1} />
      ))}
    </section>
  );
}
