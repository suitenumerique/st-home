import { fr } from "@codegouvfr/react-dsfr";
import { NextPage } from "next";
import { NextSeo } from "next-seo";

const PolitiqueDeConfidentialite: NextPage = () => {
  return (
    <>
      <NextSeo
        title="Politique de confidentialité"
        description="Politique de confidentialité de la Suite territoriale"
      />
      <div className={fr.cx("fr-py-6w", "fr-container")}>
        <h1>Politique de confidentialité</h1>

        <section className={fr.cx("fr-mt-4w")}>
          <h2>Ce site n&rsquo;affiche pas de bannière de consentement aux cookies, pourquoi ?</h2>

          <p>
            C&rsquo;est vrai, vous n&rsquo;avez pas eu à cliquer sur un bloc qui recouvre la moitié
            de la page pour dire que vous êtes d&rsquo;accord avec le dépôt de cookies — même si
            vous ne savez pas ce que ça veut dire !
          </p>

          <p>
            Rien d&rsquo;exceptionnel, pas de passe-droit lié à un .gouv.fr. Nous respectons
            simplement la loi, qui dit que certains outils de suivi d&rsquo;audience, correctement
            configurés pour respecter la vie privée, sont exemptés d&rsquo;autorisation préalable.
          </p>

          <p>
            Nous utilisons pour cela{" "}
            <a href="https://matomo.org/" target="_blank" rel="noopener noreferrer">
              Matomo
            </a>
            , un outil{" "}
            <a href="https://matomo.org/free-software/" target="_blank" rel="noopener noreferrer">
              libre
            </a>
            , paramétré pour être en conformité avec la{" "}
            <a
              href="https://www.cnil.fr/fr/solutions-pour-la-mesure-daudience"
              target="_blank"
              rel="noopener noreferrer"
            >
              recommandation « Cookies »
            </a>{" "}
            de la CNIL. Cela signifie que votre adresse IP, par exemple, est anonymisée avant
            d&rsquo;être enregistrée. Il est donc impossible d&rsquo;associer vos visites sur ce
            site à votre personne.
          </p>
        </section>
      </div>
    </>
  );
};

export default PolitiqueDeConfidentialite;
