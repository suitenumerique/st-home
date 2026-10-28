import { type ServiceOfferItem, type ServiceOffersBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";
import Link from "next/link";

const SECTION_PADDING_BOTTOM = 120;
const CARD_SHADOW = "0 0 10px rgb(0 0 0 / 10%)";

function OfferItems({ items }: { items: ServiceOfferItem[] }) {
  return (
    <ul className={fr.cx("fr-raw-list", "fr-mb-0")}>
      {items.map((item, index) => (
        <li
          key={index}
          className={fr.cx("fr-text--sm", "fr-mb-1v")}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <span
            className={fr.cx("fr-icon-check-line", "fr-icon--sm")}
            style={{ color: "var(--text-action-high-blue-france)" }}
            aria-hidden="true"
          />
          <span>{item.label}</span>
          {item.tooltip && <Tooltip kind="click" title={item.tooltip} />}
        </li>
      ))}
    </ul>
  );
}

export default function ServiceOffers({ block }: { block: ServiceOffersBlock }) {
  return (
    <section
      id={block.id}
      className={fr.cx("fr-container")}
      style={{ paddingBottom: SECTION_PADDING_BOTTOM }}
    >
      <h2 className={fr.cx("fr-h2", "fr-mb-2w")}>{block.title}</h2>
      <p className={fr.cx("fr-text--md", "fr-mb-4w")}>{block.description}</p>

      <ul className={fr.cx("fr-raw-list", "fr-grid-row", "fr-grid-row--gutters")}>
        {block.offers.map((offer, index) => (
          <li key={index} className={fr.cx("fr-col-12", "fr-col-md-4")}>
            <div
              className={fr.cx("fr-p-3w")}
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--border-default-grey)",
                borderRadius: "8px",
                boxShadow: CARD_SHADOW,
              }}
            >
              <h3 className={fr.cx("fr-h4", "fr-mb-1w")}>{offer.name}</h3>
              <p className={fr.cx("fr-text--sm", "fr-mb-2w")}>{offer.tagline}</p>
              <p className={fr.cx("fr-text--lg", "fr-text--bold", "fr-mb-0")}>{offer.price}</p>
              <p
                className={fr.cx("fr-text--sm", "fr-mb-3w")}
                style={{ color: "var(--text-mention-grey)" }}
              >
                {offer.yearlyPrice}
              </p>

              <p className={fr.cx("fr-text--sm", "fr-text--bold", "fr-mb-1w")}>Inclus</p>
              <OfferItems items={offer.included} />

              {offer.options && (
                <>
                  <p className={fr.cx("fr-text--sm", "fr-text--bold", "fr-mt-2w", "fr-mb-1w")}>
                    En option
                  </p>
                  <OfferItems items={offer.options} />
                </>
              )}

              <div className={fr.cx("fr-pt-3w")} style={{ marginTop: "auto" }}>
                <Link
                  href={offer.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={fr.cx(
                    "fr-btn",
                    "fr-btn--secondary",
                    "fr-btn--icon-right",
                    "fr-icon-arrow-right-up-line",
                  )}
                >
                  {offer.link.text}
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {block.link && (
        <p className={fr.cx("fr-mt-4w", "fr-mb-0")} style={{ textAlign: "center" }}>
          <Link
            href={block.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={fr.cx("fr-link", "fr-link--icon-right", "fr-icon-arrow-right-up-line")}
          >
            {block.link.text}
          </Link>
        </p>
      )}
    </section>
  );
}
