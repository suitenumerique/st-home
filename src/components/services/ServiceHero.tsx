import ServiceEligibility from "@/components/services/ServiceEligibility";
import { ELIGIBILITY_SEARCH_ANCHOR, type ServiceHeroBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";

const GRADIENT_ALPHA = 0.05;
const HERO_BACKGROUND = `linear-gradient(180deg, rgba(0, 0, 145, ${GRADIENT_ALPHA}) 0%, rgba(0, 0, 145, 0) 540px)`;
const ILLUSTRATION_MAX_HEIGHT = 370;
const LOGO_MAX_HEIGHT = 56;
const CONTENT_PADDING_TOP = 150;

export default function ServiceHero({ hero }: { hero: ServiceHeroBlock }) {
  const { eligibilitySearch, illustration, screenshot } = hero;

  return (
    <section className={styles.section} style={{ backgroundImage: HERO_BACKGROUND }}>
      <div
        className={fr.cx("fr-container", screenshot && "fr-pb-6w")}
        style={{ paddingTop: CONTENT_PADDING_TOP }}
      >
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--middle")}>
          {/* Half the row next to the illustration, the whole of it without. */}
          <div className={fr.cx("fr-col-12", illustration ? "fr-col-md-6" : "fr-col-md-12")}>
            <h1 className={fr.cx("fr-mb-2w")}>
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

            <p className={fr.cx("fr-text--lg", "fr-mb-0")}>{hero.description}</p>

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
        <div id={ELIGIBILITY_SEARCH_ANCHOR} className={fr.cx("fr-container", "fr-mt-6w")}>
          <ServiceEligibility
            selfHostingUrl={eligibilitySearch.selfHostingUrl}
            serviceName={hero.name}
          />
        </div>
      )}
    </section>
  );
}
