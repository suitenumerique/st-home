import CommuneSearch, { type Commune } from "@/components/CommuneSearch";
import { useSmallScreen } from "@/lib/hooks";
import { type ServiceHeroBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import { useRouter } from "next/router";

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

// Vertical rhythm from the mockup: the service name sits ~150px below the header.
const CONTENT_PADDING_TOP = 150;

export default function ServiceHero({ hero }: { hero: ServiceHeroBlock }) {
  const router = useRouter();
  const isSmallScreen = useSmallScreen(1000);

  const { eligibilitySearch, illustration } = hero;

  return (
    <section style={{ backgroundImage: HERO_BACKGROUND }}>
      <div
        className={fr.cx("fr-container", "fr-pb-6w")}
        style={{ paddingTop: CONTENT_PADDING_TOP }}
      >
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--middle")}>
          <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
            <h1 className={fr.cx("fr-mb-2w")}>
              <span style={{ display: "block" }}>{hero.name},</span>
              <span style={{ display: "block", fontWeight: 400 }}>{hero.tagline}</span>
            </h1>

            <p className={fr.cx("fr-text--lg", "fr-mb-4w")}>{hero.description}</p>

            {eligibilitySearch && (
              <>
                <h2 className={fr.cx("fr-text--lg", "fr-text--bold", "fr-mb-1w")}>
                  {eligibilitySearch.title}
                </h2>
                <CommuneSearch
                  smallButton
                  placeholder={
                    isSmallScreen
                      ? eligibilitySearch.placeholderSmallScreen
                      : eligibilitySearch.placeholder
                  }
                  onSelect={(commune: Commune) => router.push(`/bienvenue/${commune.siret}`)}
                  style={{ backgroundColor: "white" }}
                />
              </>
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
    </section>
  );
}
