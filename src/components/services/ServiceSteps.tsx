import { Icon1CircleFilled, Icon2CircleFilled, Icon3CircleFilled } from "@/components/icons/uikit";
import { type ServiceStepsBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";

// Tighter above than below: the block follows the hero screenshot closely.
const SECTION_PADDING_TOP = 60;
const SECTION_PADDING_BOTTOM = 120;

// From the mockup: no offset, 10px blur, black at 10%.
const CARD_SHADOW = "0 0 10px rgb(0 0 0 / 10%)";

const BADGE_SIZE = 32;
// One per step, in order; a fourth step would need its badge added here.
const BADGES = [Icon1CircleFilled, Icon2CircleFilled, Icon3CircleFilled];

/**
 * Numbered steps under the hero: the cards sit side by side on a wide screen
 * and stack in order below the DSFR `md` breakpoint.
 */
export default function ServiceSteps({ block }: { block: ServiceStepsBlock }) {
  return (
    <section
      className={fr.cx("fr-container")}
      style={{ paddingTop: SECTION_PADDING_TOP, paddingBottom: SECTION_PADDING_BOTTOM }}
    >
      <h2 className={fr.cx("fr-h2", "fr-mb-2w")}>{block.title}</h2>
      <p className={fr.cx("fr-text--md", "fr-mb-4w")}>{block.description}</p>

      <ul className={fr.cx("fr-raw-list", "fr-grid-row", "fr-grid-row--gutters")}>
        {block.steps.map((step, index) => {
          const Badge = BADGES[index];

          return (
            <li key={index} className={fr.cx("fr-col-12", "fr-col-md-4")}>
              <div
                className={`${fr.cx("fr-p-3w")} ${styles.linkCard}`}
                style={{
                  height: "100%",
                  border: "1px solid var(--border-default-grey)",
                  borderRadius: "8px",
                  boxShadow: CARD_SHADOW,
                }}
              >
                {Badge && (
                  <Badge
                    width={BADGE_SIZE}
                    height={BADGE_SIZE}
                    aria-hidden="true"
                    focusable="false"
                    className={fr.cx("fr-mb-2w")}
                    style={{ color: "var(--background-action-high-blue-france)", display: "block" }}
                  />
                )}
                <h3 className={fr.cx("fr-text--md", "fr-text--bold", "fr-mb-1w")}>
                  {step.href ? (
                    // `fr-raw-link` drops the underline: the arrow already marks
                    // the title as the card's target.
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
                      {step.title}
                    </Link>
                  ) : (
                    step.title
                  )}
                </h3>
                <p className={fr.cx("fr-text--sm", "fr-mb-0")}>{step.description}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {block.link && (
        <p className={fr.cx("fr-mt-4w", "fr-mb-0")} style={{ textAlign: "center" }}>
          <Link
            href={block.link.href}
            className={fr.cx("fr-link", "fr-link--icon-right", "fr-icon-arrow-right-up-line")}
          >
            {block.link.text}
          </Link>
        </p>
      )}
    </section>
  );
}
