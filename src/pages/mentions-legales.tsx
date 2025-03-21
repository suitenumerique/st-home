import { fr } from "@codegouvfr/react-dsfr";
import { NextPage } from "next";
import { NextSeo } from "next-seo";

const MentionsLegales: NextPage = () => {
  return (
    <>
      <NextSeo
        title="Mentions légales"
        description="Mentions légales de la Suite territoriale"
      />

      <div className={fr.cx("fr-py-6w", "fr-container")}>
        <h1>Mentions légales</h1>

        <section className={fr.cx("fr-mt-4w")}>
          <h2>Éditeur de la plateforme</h2>
          <p>
            La Suite territoriale est éditée au sein de l’Incubateur des
            Territoires de l’Agence nationale de la cohésion des territoires
            (ANCT) située :
          </p>
          <blockquote>
            ANCT
            <br />
            20 avenue de Ségur
            <br />
            75007 Paris
            <br />
            France
            <br />
            Téléphone : 01 85 58 60 00
          </blockquote>
        </section>

        <section className={fr.cx("fr-mt-4w")}>
          <h2>Directeur de la publication</h2>
          <p>
            Le directeur de publication est Monsieur Stanislas BOURRON,
            Directeur général de l’ANCT
          </p>
        </section>

        <section className={fr.cx("fr-mt-4w")}>
          <h2>Hébergement du site</h2>
          <p>La plateforme est hébergée par :</p>
          <blockquote>
            Scalingo SAS
            <br />
            3 place de Haguenau
            <br />
            67100 Strasbourg
            <br />
            France
          </blockquote>
        </section>
      </div>
    </>
  );
};

export default MentionsLegales;
