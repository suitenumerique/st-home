import CommuneSearch, { type Commune } from "@/components/CommuneSearch";
import Newsletter from "@/components/Newsletter";
import { useSmallScreen } from "@/lib/hooks";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";

const PLACEHOLDER = "Entrez le nom de votre territoire ou son code postal";
const PLACEHOLDER_SMALL_SCREEN = "Nom ou code postal";

const HERO_BACKGROUND =
  "linear-gradient(180deg, rgba(0, 0, 145, 0.04) 0%, rgba(0, 0, 145, 0.01) 100%)";
const HERO_PADDING = 140;
const TITLE_FONT_SIZE = 48;
const TITLE_LINE_HEIGHT = 56;
const LEAD_FONT_SIZE = 20;
const LEAD_LINE_HEIGHT = 32;
const TITLE_MAX_WIDTH = 900;

export default function Territoires() {
  const router = useRouter();
  const isSmallScreen = useSmallScreen(1000);

  const handleSelect = (commune: Commune) => {
    router.push(`/bienvenue/${commune.siret}`);
  };

  return (
    <>
      <NextSeo
        title="Services numériques de votre territoire"
        description="Consultez les services numériques simples, souverains et sécurisés accessibles pour vos territoires."
      />

      <section style={{ backgroundImage: HERO_BACKGROUND }}>
        <div
          className={fr.cx("fr-container")}
          style={{ paddingTop: HERO_PADDING, paddingBottom: HERO_PADDING }}
        >
          <h1
            className={fr.cx("fr-mb-5w")}
            style={{
              fontSize: TITLE_FONT_SIZE,
              lineHeight: `${TITLE_LINE_HEIGHT}px`,
              textAlign: "center",
              textWrap: "balance",
              maxWidth: TITLE_MAX_WIDTH,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Consultez les services numériques accessibles pour vos territoires
          </h1>
          <p
            className={fr.cx("fr-mb-5w")}
            style={{
              fontSize: LEAD_FONT_SIZE,
              lineHeight: `${LEAD_LINE_HEIGHT}px`,
              textAlign: "center",
            }}
          >
            Découvrez des services simples, souverains et sécurisés
          </p>

          <div className={styles.heroSearch}>
            <CommuneSearch
              smallButton
              placeholder={isSmallScreen ? PLACEHOLDER_SMALL_SCREEN : PLACEHOLDER}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: "var(--background-alt-blue-france)" }}>
        <div className={fr.cx("fr-container")}>
          <Newsletter />
        </div>
      </section>
    </>
  );
}
