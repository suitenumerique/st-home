import ServiceEligibility from "@/components/services/ServiceEligibility";
import { ELIGIBILITY_SEARCH_ANCHOR, type ServiceHeroBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";

// Hero background: blue France (#000091) fading to transparent over the first
// 540px, with no decorative pattern. Kept at a low alpha so the dark heading
// stays readable — raise this single value for a more saturated band.
const GRADIENT_ALPHA = 0.05;
// The end stop repeats the same RGB rather than `transparent` (= rgba(0,0,0,0)),
// which would interpolate through grey.
const HERO_BACKGROUND = `linear-gradient(180deg, rgba(0, 0, 145, ${GRADIENT_ALPHA}) 0%, rgba(0, 0, 145, 0) 540px)`;

// Illustrations are square-ish and much larger than their slot, so they are
// bounded by height rather than stretched to the column width. Paired with
// `width/height: auto`, the two max-* bounds keep the aspect ratio intact.
const ILLUSTRATION_MAX_HEIGHT = 370;

// Logotypes are authored at their own scale, so the hero bounds their height
// instead of trusting the intrinsic size. Paired with `width/height: auto`.
const LOGO_MAX_HEIGHT = 56;

// Vertical rhythm from the mockup: the service name sits ~150px below the header.
const CONTENT_PADDING_TOP = 150;

export default function ServiceHero({ hero }: { hero: ServiceHeroBlock }) {
  const { eligibilitySearch, illustration, screenshot } = hero;

  return (
    <section className={styles.section} style={{ backgroundImage: HERO_BACKGROUND }}>
      {/* The gradient has faded out long before the bottom of the hero, so the
          air under it is the gap to the next section, not the band. The bottom
          padding is internal spacing instead: it separates the search from the
          screenshot below, and is dropped when there is no screenshot. */}
      <div
        className={fr.cx("fr-container", screenshot && "fr-pb-6w")}
        style={{ paddingTop: CONTENT_PADDING_TOP }}
      >
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--middle")}>
          <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
            <h1 className={fr.cx("fr-mb-2w")}>
              {hero.logo ? (
                // The logotype carries the service name, so it is the accessible
                // text of the heading rather than a decorative image.
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

            {/* Last thing in the column now that the search moved out. */}
            <p className={fr.cx("fr-text--lg", "fr-mb-0")}>{hero.description}</p>
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
                // Above the fold on every service page: let Next preload it.
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
        // In its own container, outside the hero grid: it spans the full
        // content width of the page. Its drop shadow and rounded window frame
        // are baked into the asset, transparent around them.
        <div className={fr.cx("fr-container")}>
          <Image
            src={screenshot.src}
            alt={screenshot.alt}
            width={screenshot.width}
            height={screenshot.height}
            sizes="(min-width: 78rem) 1248px, 100vw"
            // Full width just under the fold: it is the LCP element.
            priority
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </div>
      )}

      {eligibilitySearch && (
        // Anchor target: blocks further down the page send visitors back up to
        // this search when they are already on the service page.
        <div id={ELIGIBILITY_SEARCH_ANCHOR} className={fr.cx("fr-container", "fr-mt-6w")}>
          <ServiceEligibility search={eligibilitySearch} serviceName={hero.name} />
        </div>
      )}
    </section>
  );
}
