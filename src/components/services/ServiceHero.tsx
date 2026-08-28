import ServiceEligibility from "@/components/services/ServiceEligibility";
import { ELIGIBILITY_SEARCH_ANCHOR, type ServiceHeroBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";

const GRADIENT_ALPHA = 0.05;
const HERO_BACKGROUND = `linear-gradient(180deg, rgba(0, 0, 145, ${GRADIENT_ALPHA}) 0%, rgba(0, 0, 145, 0) 540px)`;
// Mirror of the hero background under the eligibility block: the same tint,
// strongest along the bottom of the block and fading out over 425px going up,
// as in the mockup.
const SEARCH_BACKGROUND = `linear-gradient(0deg, rgba(0, 0, 145, ${GRADIENT_ALPHA}) 0%, rgba(0, 0, 145, 0) 425px)`;
const ILLUSTRATION_MAX_HEIGHT = 370;
const LOGO_MAX_HEIGHT = 90;
const CONTENT_PADDING_TOP = 94;
// Air between the hero text and the screenshot spanning the page below it.
const CONTENT_PADDING_BOTTOM = 60;
// Larger than the DSFR h1, as in the mockup.
const TITLE_FONT_SIZE = 50;
const TITLE_LINE_HEIGHT = 60;
// Air around the eligibility block, inside its tinted band.
const SEARCH_PADDING = 120;

export default function ServiceHero({ hero }: { hero: ServiceHeroBlock }) {
  const { eligibilitySearch, illustration, screenshot } = hero;

  return (
    <section style={{ backgroundImage: HERO_BACKGROUND }}>
      <div
        className={fr.cx("fr-container")}
        style={{
          paddingTop: CONTENT_PADDING_TOP,
          paddingBottom: screenshot ? CONTENT_PADDING_BOTTOM : undefined,
        }}
      >
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--middle")}>
          {/* Half the row next to the illustration, the whole of it without. */}
          <div className={fr.cx("fr-col-12", illustration ? "fr-col-md-6" : "fr-col-md-12")}>
            <h1
              className={fr.cx("fr-mb-2w")}
              style={{ fontSize: TITLE_FONT_SIZE, lineHeight: `${TITLE_LINE_HEIGHT}px` }}
            >
              {hero.logo ? (
                <Image
                  src={hero.logo.src}
                  alt={hero.name}
                  width={hero.logo.width}
                  height={hero.logo.height}
                  priority
                  className={fr.cx("fr-mb-2w")}
                  style={{
                    display: "block",
                    width: "auto",
                    height: "auto",
                    maxWidth: "100%",
                    maxHeight: `${LOGO_MAX_HEIGHT}px`,
                  }}
                />
              ) : (
                <span style={{ display: "block" }}>{hero.name},</span>
              )}
              <span style={{ display: "block", fontWeight: 400 }}>{hero.tagline}</span>
            </h1>

            <p className={fr.cx("fr-text--md", "fr-mb-0")}>{hero.description}</p>

            {hero.cta && (
              <Link
                href={hero.cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className={fr.cx("fr-btn", "fr-mt-4w")}
              >
                {hero.cta.text}
              </Link>
            )}
          </div>

          {illustration && (
            <div
              className={fr.cx("fr-col-12", "fr-col-md-6")}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Image
                src={illustration.src}
                alt={illustration.alt}
                width={illustration.width}
                height={illustration.height}
                priority
                style={{
                  width: "auto",
                  height: "auto",
                  maxWidth: "100%",
                  maxHeight: `${ILLUSTRATION_MAX_HEIGHT}px`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {screenshot && (
        <div className={fr.cx("fr-container")}>
          <Image
            src={screenshot.src}
            alt={screenshot.alt}
            width={screenshot.width}
            height={screenshot.height}
            sizes="(min-width: 78rem) 1248px, 100vw"
            priority
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </div>
      )}

      {eligibilitySearch && (
        // Full width, so the tint spans the viewport as the hero one does. The
        // air above the block is padding rather than margin: it belongs inside
        // the tinted band.
        <div style={{ backgroundImage: SEARCH_BACKGROUND }}>
          <div
            id={ELIGIBILITY_SEARCH_ANCHOR}
            className={fr.cx("fr-container")}
            style={{ paddingTop: SEARCH_PADDING, paddingBottom: SEARCH_PADDING }}
          >
            <ServiceEligibility
              selfHostingUrl={eligibilitySearch.selfHostingUrl}
              serviceName={hero.name}
            />
          </div>
        </div>
      )}
    </section>
  );
}
