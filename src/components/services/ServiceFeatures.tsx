import {
  type ServiceFeatureIconColor,
  type ServiceFeatureRow,
  type ServiceFeaturesBlock,
} from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";

const ICON_SIZE = 20;
const ICON_COLORS: Record<ServiceFeatureIconColor, string> = {
  "blue-ecume": "#6b93f6",
  "yellow-tournesol": "#a88e26",
  "green-archipel": "#419ca4",
};

function FeatureRow({
  row,
  reversed,
  last,
}: {
  row: ServiceFeatureRow;
  reversed: boolean;
  last: boolean;
}) {
  const { screenshot } = row;

  return (
    <div
      className={
        fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--middle", !last && "fr-mb-12w") +
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
                row.highlightColumns === 2 ? "fr-col-sm-6" : "fr-col-sm-12",
              )}
              style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}
            >
              <highlight.icon
                width={ICON_SIZE}
                height={ICON_SIZE}
                aria-hidden="true"
                focusable="false"
                style={{ color: ICON_COLORS[row.iconColor ?? "blue-ecume"], flexShrink: 0 }}
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
    <section className={`${fr.cx("fr-container")} ${styles.section}`}>
      {block.rows.map((row, index) => (
        <FeatureRow
          key={index}
          row={row}
          reversed={index % 2 === 1}
          last={index === block.rows.length - 1}
        />
      ))}
    </section>
  );
}
