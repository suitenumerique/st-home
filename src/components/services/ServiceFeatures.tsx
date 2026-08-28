import { type ServiceFeatureRow, type ServiceFeaturesBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";

// Each row carries its own air, so the gap between two of them is twice this.
const ROW_PADDING = 60;

const ICON_SIZE = 24;
// DSFR `$blue-ecume-850-active`, `$yellow-tournesol-850-active` and
// `$green-archipel-850-active`, written out because react-dsfr exposes a CSS
// variable for each shade but not for the active variant of its palette entry.
// Rows take their tint from their position, so every service repeats the order
// set on Messages.
const ICON_COLORS = ["#6b93f6", "#a88e26", "#419ca4"];

function FeatureRow({
  row,
  rowIndex,
  reversed,
}: {
  row: ServiceFeatureRow;
  /** Position in the page, which decides the tint of the bullets. */
  rowIndex: number;
  reversed: boolean;
}) {
  const { screenshot } = row;

  return (
    <div
      style={{ paddingTop: ROW_PADDING, paddingBottom: ROW_PADDING }}
      className={
        fr.cx("fr-grid-row", "fr-grid-row--middle") +
        ` ${styles.featureRow}` +
        (reversed ? ` ${styles.featureRowReversed}` : "")
      }
    >
      <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
        <h2 className={fr.cx("fr-h2", "fr-mb-2w")}>{row.title}</h2>
        <p className={fr.cx("fr-text--md", "fr-mb-4w")}>{row.description}</p>

        {row.highlights && (
          <ul
            className={
              `${fr.cx("fr-raw-list", "fr-mb-4w")} ${styles.featureHighlights}` +
              (row.highlightColumns === 2 ? ` ${styles.featureHighlightsTwoColumns}` : "")
            }
          >
            {row.highlights.map((highlight, index) => (
              <li key={index} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <highlight.icon
                  width={ICON_SIZE}
                  height={ICON_SIZE}
                  aria-hidden="true"
                  focusable="false"
                  style={{ color: ICON_COLORS[rowIndex % ICON_COLORS.length], flexShrink: 0 }}
                />
                <span className={fr.cx("fr-text--sm", "fr-mb-0")}>{highlight.label}</span>
              </li>
            ))}
          </ul>
        )}

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
    // No spacing of its own, unlike the other sections: the rows carry their
    // own padding, and adding the shared gap on top would double it.
    <section className={fr.cx("fr-container")}>
      {block.rows.map((row, index) => (
        <FeatureRow key={index} row={row} rowIndex={index} reversed={index % 2 === 1} />
      ))}
    </section>
  );
}
