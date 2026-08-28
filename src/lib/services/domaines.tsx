import Link from "next/link";
import { type ServicePage } from "./types";

const REFERENTIEL_URL = "/conformite/referentiel";
const CONFORMITY_MAP_URL = "/conformite/cartographie";
const PARTNERS_MAP_URL = "/cartographie-deploiement";
// The help centre, and the two references the FAQ points at.
const HELP_CENTRE_URL = "https://aide.suite.anct.gouv.fr/socle";
const ANNUAIRE_SERVICE_PUBLIC_URL = "https://lannuaire.service-public.gouv.fr/";
const AFNIC_URL = "https://www.afnic.fr/";

// V1: the hero only. Features, verbatims and FAQ are still being written.
const domaines: ServicePage = {
  slug: "domaines",
  navLabel: "Domaines",
  // The page opens on its own steps, without the two shared blocks.
  proConnect: false,
  foundations: false,
  trialHeading: { lead: "Concerné\u202f?", action: "Agissez\u202f!" },
  seo: {
    title: "Domaines, dotez votre commune d’un nom de domaine conforme",
    description:
      "Réservez le nom de domaine institutionnel de votre collectivité pour garantir votre présence en ligne, votre reconnaissance officielle et des adresses de messagerie conformes.",
  },

  hero: {
    name: "Domaines",
    logo: {
      src: "/images/services-logos/domaines.png",
      width: 604,
      height: 160,
    },
    tagline: <>Dotez votre commune d&rsquo;un nom de domaine conforme</>,
    description: (
      <>
        Réservez votre nom de domaine pour garantir votre présence en ligne et assurer votre
        reconnaissance officielle.
      </>
    ),
    illustration: {
      src: "/images/services-illlu/domaines-head.png",
      alt: "",
      width: 1832,
      height: 1504,
    },
    screenshot: {
      src: "/images/services-illlu/domaines-top.webp",
      alt: "Le service Domaines, avec la recherche d’un nom de domaine pour la collectivité",
      width: 1728,
      height: 1016,
    },
  },

  steps: {
    title: <>Exigez un nom de domaine conforme</>,
    description: (
      <>
        Trouvez le nom de domaine adapté à votre collectivité et conforme aux critères de sécurité
        du <Link href={REFERENTIEL_URL}>Référentiel de la Présence numérique des territoires</Link>.
      </>
    ),
    steps: [
      {
        title: <>Choisir sa nomenclature</>,
        description: (
          <>Consultez le guide pour choisir la nomenclature adéquate pour votre collectivité.</>
        ),
        href: "https://aide.suite.anct.gouv.fr/socle/domaines/creer-mon-nom-de-domaine",
      },
      {
        title: <>Vérifier sa disponibilité</>,
        description: <>Assurez-vous que le nom de domaine sélectionné est encore disponible.</>,
        href: "https://www.afnic.fr/noms-de-domaine/tout-savoir/whois-trouver-un-nom-de-domaine/",
      },
      {
        title: <>Réserver son nom de domaine</>,
        description: <>Trouvez le bureau d&rsquo;enregistrement qui vous convient.</>,
        href: "https://www.afnic.fr/noms-de-domaine/tout-savoir/annuaire-bureaux-enregistrement/",
      },
    ],
    link: { text: "Consulter la conformité de ma commune", href: CONFORMITY_MAP_URL },
  },

  banner: {
    title: <>L&rsquo;expertise près de chez vous</>,
    description: (
      <>
        Opérateurs publics de services numériques, centres de gestion, associations
        d&rsquo;élus&hellip;
        <br />
        Rapprochez-vous du partenaire de proximité de votre territoire pour vous accompagner dans
        votre démarche.
      </>
    ),
    link: { text: "Voir la cartographie des partenaires", href: PARTNERS_MAP_URL },
    illustration: {
      src: "/images/services-illlu/expertise-locale.webp",
      alt: "",
      width: 900,
      height: 645,
    },
  },

  partners: {
    title: <>Vos partenaires nationaux</>,
    description: <>Nous travaillons ensemble pour améliorer votre quotidien.</>,
    logos: [
      { src: "/images/logo-anct-small.png", alt: "ANCT", width: 58, height: 70 },
      {
        src: "/images/logo-amf.png",
        alt: "Association des maires de France",
        width: 131,
        height: 70,
      },
      { src: "/images/logo-afnic.png", alt: "Afnic", width: 175, height: 70 },
      { src: "/images/logo-declic.png", alt: "Déclic", width: 214, height: 41, displayHeight: 40 },
      { src: "/images/logo-anssi.png", alt: "ANSSI", width: 70, height: 70 },
    ],
  },

  faq: {
    title: <>Questions fréquentes</>,
    description: (
      <>
        Pour en savoir plus, consultez le{" "}
        <Link href={HELP_CENTRE_URL} target="_blank" rel="noopener noreferrer">
          centre d&rsquo;aide
        </Link>
        .
      </>
    ),
    items: [
      {
        question: (
          <>Quelle est la différence entre un nom de domaine et une adresse de messagerie ?</>
        ),
        answer: (
          <>
            <p>
              Le nom de domaine est la partie qui identifie votre commune sur internet, par exemple{" "}
              <strong>mairie-exemple.fr</strong>. Il constitue la base commune à deux usages
              principaux :
            </p>
            <ul>
              <li>
                <strong>l&rsquo;adresse de votre site internet</strong> (https://mairie-exemple.fr)
                ;
              </li>
              <li>
                <strong>vos adresses email professionnelles</strong> (prenom.nom@mairie-exemple.fr).
              </li>
            </ul>
            <p>
              C&rsquo;est parce que ces deux usages partagent le même nom de domaine que vos
              administrés et partenaires peuvent identifier facilement une communication officielle
              de la commune.
            </p>
          </>
        ),
      },
      {
        question: (
          <>Ma commune n&rsquo;a pas besoin de site web, un nom de domaine est-il nécessaire ?</>
        ),
        answer: (
          <p>
            Oui. Le nom de domaine ne sert pas seulement à héberger un site, il conditionne vos
            adresses de messagerie professionnelles et votre authentification sur ProConnect. Il
            peut par ailleurs rediriger vers la page officielle de votre commune sur{" "}
            <Link href={ANNUAIRE_SERVICE_PUBLIC_URL} target="_blank" rel="noopener noreferrer">
              l&rsquo;Annuaire du service public
            </Link>
            , qui regroupe toutes les informations utiles à vos administrés.
          </p>
        ),
      },
      {
        question: <>Quel nom de domaine choisir pour ma commune ?</>,
        answer: (
          <p>
            La forme recommandée pour votre nom de domaine est <strong>nomdelacommune.fr</strong>.
            Si elle est indisponible, mairie-nomdelacommune.fr et ville-nomdelacommune.fr sont
            également réservés aux collectivités. En cas d&rsquo;homonymie, ajoutez simplement le
            numéro de votre département : nomdelacommune71.fr.
          </p>
        ),
      },
      {
        question: (
          <>
            Qu&rsquo;est-ce qu&rsquo;un nom de domaine conforme au Référentiel de la présence
            numérique des territoires (RPNT) ?
          </>
        ),
        answer: (
          <p>
            Un nom de domaine conforme au RPNT respecte la nomenclature recommandée et utilise une
            extension administrée par un organisme français : .fr, extensions régionales (ex. :
            .bzh) ou ultramarines (ex. : .yt). Ces extensions placent votre domaine sous protection
            juridique française et ouvrent un recours en cas d&rsquo;usurpation, contrairement au
            .com ou au .org par exemple.
          </p>
        ),
      },
      {
        question: <>Qu&rsquo;est-ce qu&rsquo;un bureau d&rsquo;enregistrement ?</>,
        answer: (
          <p>
            Un bureau d&rsquo;enregistrement (ou <em>registrar</em>) est une entreprise privée
            autorisée à vendre et gérer des noms de domaine. En France, ils sont accrédités par
            l&rsquo;Afnic,{" "}
            <Link href={AFNIC_URL} target="_blank" rel="noopener noreferrer">
              l&rsquo;Association française pour le nommage Internet en coopération
            </Link>
            .
          </p>
        ),
      },
      {
        question: <>Combien coûte un nom de domaine institutionnel conforme ?</>,
        answer: (
          <p>
            Les prix sont fixés par chaque bureau d&rsquo;enregistrement, un nom de domaine conforme
            en .fr coûtant généralement entre 5&nbsp;€ et 15&nbsp;€ par an. Au-delà, le tarif
            correspond généralement à des services associés supplémentaires : hébergement d&rsquo;un
            site, maintenance, configuration des adresses&hellip; Ces services sont facultatifs et
            le domaine seul suffit à être conforme.
          </p>
        ),
      },
    ],
  },
};

export default domaines;
