import { openFeedbackWidget } from "@/components/FeedbackWidget";
import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";

const TEXT_MAX_WIDTH = "34rem";

// Air above and below the block, as in the mockup.
const SECTION_PADDING = 120;
// Where the code lives when a service does not name its own repository.
const DEFAULT_REPOSITORY_URL = process.env.NEXT_PUBLIC_APP_REPOSITORY_URL ?? "";
const CONTACT_EMAIL = "contact@suite.anct.gouv.fr";

type Foundation = {
  icon: { src: string; width: number; height: number };
  title: ReactNode;
  description: ReactNode;
};

const foundations: Foundation[] = [
  {
    icon: { src: "/images/shield-check.svg", width: 64, height: 64 },
    title: <>Sécurité avancée</>,
    description: (
      <>
        Identification unique avec ProConnect, système antivirus, contrôles d&rsquo;accès, journaux
        d&rsquo;audit détaillés, le tout conforme au RGPD.
      </>
    ),
  },
  {
    icon: { src: "/images/code.svg", width: 64, height: 64 },
    title: <>Commun numérique</>,
    description: (
      <>
        La gouvernance partagée avec nos partenaires garantit la prise en compte de vos retours et
        le maintien de tous nos codes sources ouverts.
      </>
    ),
  },
  {
    icon: { src: "/images/map-pin.svg", width: 64, height: 64 },
    title: <>Hébergement en France</>,
    description: (
      <>
        Pour une souveraineté renforcée, toutes vos données sont stockées et traitées en France,
        sous juridiction française et avec une gouvernance vérifiable.
      </>
    ),
  },
  {
    icon: { src: "/images/puzzle.svg", width: 64, height: 64 },
    title: <>Service interopérable</>,
    description: (
      <>
        Nos services sont nativement conçus pour fonctionner avec d&rsquo;autres services, pour
        toujours plus d&rsquo;efficacité et sans ressaisie de vos données.
      </>
    ),
  },
];

export default function ServiceFoundations({ repositoryUrl }: { repositoryUrl?: string }) {
  const repository = repositoryUrl ?? DEFAULT_REPOSITORY_URL;

  return (
    <section
      className={fr.cx("fr-container")}
      style={{ paddingTop: SECTION_PADDING, paddingBottom: SECTION_PADDING }}
    >
      <h2 className={fr.cx("fr-h4", "fr-mb-2w")}>Des fondements essentiels</h2>
      <p className={fr.cx("fr-text--md", "fr-mb-6w")} style={{ maxWidth: TEXT_MAX_WIDTH }}>
        Tous nos services sont conçus pour et avec les collectivités, selon des standards élevés
        garantissant l&rsquo;intégrité de vos données.
      </p>

      <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
        {foundations.map((foundation, index) => (
          <div key={index} className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-lg-3")}>
            <Image
              src={foundation.icon.src}
              alt=""
              width={foundation.icon.width}
              height={foundation.icon.height}
              className={fr.cx("fr-mb-2w")}
            />
            <h3 className={fr.cx("fr-text--md", "fr-text--bold", "fr-mb-1w")}>
              {foundation.title}
            </h3>
            <p className={fr.cx("fr-text--sm", "fr-mb-0")}>{foundation.description}</p>
          </div>
        ))}
      </div>

      <div
        className={fr.cx("fr-mt-8w")}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p className={fr.cx("fr-text--md", "fr-mb-0")} style={{ maxWidth: TEXT_MAX_WIDTH }}>
          Aidez-nous à construire un service sur mesure pour les collectivités : partagez vos
          retours ou contribuez directement au code.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <Link
            href={`mailto:${CONTACT_EMAIL}`}
            className={fr.cx("fr-btn")}
            onClick={(event) => {
              if (openFeedbackWidget()) event.preventDefault();
            }}
          >
            Partager un retour
          </Link>

          {repository && (
            <Link
              href={repository}
              target="_blank"
              rel="noopener noreferrer"
              className={fr.cx("fr-btn", "fr-btn--secondary")}
            >
              Contribuer au code
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
