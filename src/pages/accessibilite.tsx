import { fr } from "@codegouvfr/react-dsfr";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";

const Accessibilite: NextPage = () => {
  return (
    <>
      <NextSeo
        title="Déclaration d&rsquo;accessibilité"
        description="Déclaration d&rsquo;accessibilité du site suiteterritoriale.anct.gouv.fr"
      />

      <div className={fr.cx("fr-py-6w", "fr-container")}>

      <h1>Déclaration d&rsquo;accessibilité</h1>
      <p>
        Établie le <span>21 mars 2025</span>.
      </p>
      <p>
        L&rsquo;Agence Nationale de la Cohésion des Territoires s&rsquo;engage à rendre son service accessible,
        conformément à l&rsquo;article 47 de la loi n° 2005-102 du 11 février 2005.
      </p>
      <p>
        À cette fin, nous mettons en œuvre la stratégie et les actions
        suivantes&nbsp;:
      </p>
      <ul>
        <li><Link href="https://beta.gouv.fr/accessibilite/schema-pluriannuel" target="_blank" rel="noopener noreferrer">Schéma pluriannuel</Link></li>
      </ul>
      <p></p>
      <p>
        Cette déclaration d&rsquo;accessibilité s&rsquo;applique à{" "}
        <strong>La Suite territoriale - site vitrine</strong><span>{" "}
        (<span>https://suiteterritoriale.anct.gouv.fr</span>)</span>.
      </p>
      <h2>État de conformité</h2>
      <p>
        <strong>La Suite territoriale - site vitrine</strong>{" "}
        est{" "}
        <strong><span data-printfilter="lowercase">non conforme</span></strong>{" "}
        avec le{" "}
        <abbr title="Référentiel général d&rsquo;amélioration de l&rsquo;accessibilité">RGAA</abbr>. <span>Le site n&rsquo;a encore pas été audité.<br/></span>
      </p>
      <p>Cependant, un audit de conformité est en cours et l&rsquo;état de conformité sera mis à jour avant la fin de la version bêta.</p>
      <h2>Établissement de cette déclaration d&rsquo;accessibilité</h2>
      <p>
        Cette déclaration a été établie le{" "}
        <span>21 mars 2025</span>.
      </p>

      <h2>Amélioration et contact</h2>
      <p>
        Si vous n&rsquo;arrivez pas à accéder à un contenu ou à un service,
        vous pouvez contacter le responsable de{" "}
        <span>La Suite territoriale - site vitrine</span>
        pour être orienté vers une alternative accessible ou obtenir le
        contenu sous une autre forme.
      </p>
      <ul>
        <li>
        E-mail&nbsp;:{" "}
        <Link href="mailto:lasuiteterritoriale@anct.gouv.fr">lasuiteterritoriale@anct.gouv.fr</Link>
      </li>

      </ul>
      <p>
        Nous essayons de répondre dans les{" "}
        <span>2 semaines</span>.
      </p>
      <h2>Voie de recours</h2>
      <p>
        Cette procédure est à utiliser dans le cas suivant&nbsp;: vous avez
        signalé au responsable du site internet un défaut
        d&rsquo;accessibilité qui vous empêche d&rsquo;accéder à un contenu ou à un
        des services du portail et vous n&rsquo;avez pas obtenu de réponse
        satisfaisante.
      </p>
      <p>Vous pouvez&nbsp;:</p>
      <ul>
        <li>
        Écrire un message au{" "}
        <Link href="https://formulaire.defenseurdesdroits.fr/" target="_blank" rel="noopener noreferrer">Défenseur des droits</Link>
      </li>
        <li>
        Contacter{" "}
        <Link href="https://www.defenseurdesdroits.fr/saisir/delegues" target="_blank" rel="noopener noreferrer">le délégué du Défenseur des droits dans votre région</Link>
      </li>
        <li>
        Envoyer un courrier par la poste (gratuit, ne pas mettre de
        timbre)&nbsp;:<br/>
        Défenseur des droits<br/>
        Libre réponse 71120 75342 Paris CEDEX 07
        </li>
      </ul>
      <hr />
      <p>
        Cette déclaration d&rsquo;accessibilité a été créée le{" "}
        <span>21 mars 2025</span>{" "}
        grâce au{" "}
        <Link href="https://betagouv.github.io/a11y-generateur-declaration/#create" target="_blank" rel="noopener noreferrer">Générateur de Déclaration d&rsquo;Accessibilité</Link>.
      </p>




      </div>
    </>
  );
};

export default Accessibilite;
