import { type ServiceOfferItem, type ServiceOffersBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";
import Image from "next/image";
import Link from "next/link";

const SECTION_PADDING_BOTTOM = 120;
const CARD_SHADOW = "0 0 10px rgb(0 0 0 / 10%)";
const LOGO_HEIGHT = 44;

function OfferItems({ items }: { items: ServiceOfferItem[] }) {
  return (
    <ul className={fr.cx("fr-raw-list", "fr-mb-0")}>
      {items.map((item, index) => (
        <li
          key={index}
          className={fr.cx("fr-mb-1w")}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
        >
          <span
            className={fr.cx("fr-icon-check-line", "fr-icon--sm")}
            style={{ color: "var(--text-mention-grey)" }}
            aria-hidden="true"
          />
          <span>{item.label}</span>
          {item.tooltip && (
            <span style={{ marginLeft: "auto" }}>
              <Tooltip kind="click" title={item.tooltip} />
            </span>
          )}
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
              <h3
                className={fr.cx("fr-h5", "fr-mb-2w")}
                style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
              >
                <Image
                  src={offer.logo.src}
                  alt=""
                  width={offer.logo.width}
                  height={offer.logo.height}
                  style={{ width: "auto", height: LOGO_HEIGHT }}
                />
                <span style={{ textTransform: "uppercase" }}>{offer.name}</span>
              </h3>
              <p
                className={fr.cx("fr-text--xs", "fr-mb-2w")}
                style={{ color: "var(--text-mention-grey)" }}
              >
                {offer.tagline}
              </p>
              <div
                className={fr.cx("fr-mb-3w")}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <p className={fr.cx("fr-h2", "fr-mb-0")} style={{ whiteSpace: "nowrap" }}>
                  {offer.price}
                </p>
                <p className={fr.cx("fr-text--xs", "fr-mb-0")} style={{ lineHeight: 1.3 }}>
                  {block.priceTerms}
                  <br />
                  {offer.yearlyPrice}
                </p>
              </div>
              <Link
                href={offer.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={fr.cx(
                  "fr-btn",
                  "fr-btn--icon-right",
                  "fr-icon-arrow-right-up-line",
                  "fr-mb-3w",
                )}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {offer.link.text}
              </Link>

              <p className={fr.cx("fr-text--md", "fr-text--bold", "fr-mb-1w")}>Inclus&nbsp;:</p>
              <OfferItems items={offer.included} />

              {offer.options && (
                <div
                  className={fr.cx("fr-p-2w", "fr-mt-2w")}
                  style={{
                    background: "var(--background-alt-grey)",
                    borderRadius: "4px",
                  }}
                >
                  <p className={fr.cx("fr-text--xs", "fr-text--bold", "fr-mb-1v")}>
                    {offer.options.length > 1 ? "Options en supplément" : "Option en supplément"}
                    &nbsp;:
                  </p>
                  <ul
                    className={fr.cx("fr-text--xs", "fr-mb-0")}
                    style={{ listStyleType: "disc", listStylePosition: "inside", paddingLeft: 0 }}
                  >
                    {offer.options.map((option, optionIndex) => (
                      <li key={optionIndex}>
                        {option.label}
                        {option.tooltip && <Tooltip kind="click" title={option.tooltip} />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p
        className={fr.cx("fr-text--xs", "fr-mt-4w", "fr-mb-2w")}
        style={{ textAlign: "center", color: "var(--text-mention-grey)" }}
      >
        {block.footnote}
      </p>

      {block.link && (
        <p className={fr.cx("fr-text--sm", "fr-mb-0")} style={{ textAlign: "center" }}>
          {block.link.lead}{" "}
          <Link
            href={block.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={fr.cx(
              "fr-link",
              "fr-link--sm",
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
