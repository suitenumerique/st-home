import { type ServiceCase, type ServiceCasesBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";

const SECTION_PADDING_BOTTOM = 120;

function CaseCard({ serviceCase }: { serviceCase: ServiceCase }) {
  const { cta, steps } = serviceCase;

  return (
    <div className={`${fr.cx("fr-p-4w")} ${styles.caseCard}`}>
      <h3 className={fr.cx("fr-h5", steps ? "fr-mb-4w" : "fr-mb-2w")}>{serviceCase.title}</h3>

      {serviceCase.description && (
        <p className={fr.cx("fr-text--sm", "fr-mb-4w")}>{serviceCase.description}</p>
      )}

      {steps && (
        <ol className={`${fr.cx("fr-raw-list", "fr-mb-2w")} ${styles.caseSteps}`}>
          {steps.map((step, index) => (
            <li key={index} className={styles.caseStep}>
              <h4 className={`${fr.cx("fr-text--lg", "fr-mb-1w")} ${styles.caseStepTitle}`}>
                {step.title}
              </h4>
              <p className={fr.cx("fr-text--sm", "fr-mb-0")}>{step.description}</p>
            </li>
          ))}
        </ol>
      )}

      {cta && (
        <Link
          href={cta.href}
          className={
            fr.cx(
              "fr-btn",
              ...(cta.priority === "secondary" ? (["fr-btn--secondary"] as const) : []),
              "fr-btn--icon-right",
              "fr-icon-arrow-right-up-line",
            ) + ` ${styles.caseCta}`
          }
        >
          {cta.text}
        </Link>
      )}
    </div>
  );
}

export default function ServiceCases({ block }: { block: ServiceCasesBlock }) {
  return (
    <section className={fr.cx("fr-container")} style={{ paddingBottom: SECTION_PADDING_BOTTOM }}>
      <h2 className={fr.cx("fr-h2", "fr-mb-2w")}>{block.title}</h2>
      <p className={fr.cx("fr-text--md", "fr-mb-4w")}>{block.description}</p>

      <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
        {block.columns.map((column, columnIndex) => (
          <div key={columnIndex} className={fr.cx("fr-col-12", "fr-col-md-6")}>
            <div className={styles.caseColumn}>
              {column.map((serviceCase, index) => (
                <CaseCard key={index} serviceCase={serviceCase} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
