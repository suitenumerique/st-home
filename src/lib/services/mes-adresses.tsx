import Link from "next/link";
import { type ServicePage } from "./types";

const MES_ADRESSES_URL = "https://mes-adresses.data.gouv.fr/";
const DEMO_URL = "https://demo.mes-adresses.fr/";
const PARTNERS_URL = "https://adresse.data.gouv.fr/communaute/charte-base-adresse-locale";
const SIGNALEMENTS_URL = "https://signalement.adresse.data.gouv.fr/";
const DEPLOYMENT_MAP_URL = "/cartographie-deploiement?service_ids=1";
const HELP_CENTRE_URL = "https://aide.suite.anct.gouv.fr/socle/mes-adresses";
const PARTNER_CENTRE_URL =
  "https://docs.numerique.gouv.fr/docs/a85b4b1f-790f-4e55-b097-91eac06d69a6/";
const PUBLISHING_DOC_URL =
  "https://aide.suite.anct.gouv.fr/socle/mes-adresses/publier-une-base-adresse-locale/generalites-sur-la-publication";
const DEPLOYMENT_BAL_URL = "https://adresse.data.gouv.fr/deploiement-bal";
const COMMUNE_PAGES_URL = "https://adresse.data.gouv.fr/commune";
const ANNUAIRE_ADMINISTRATION_URL = "https://lannuaire.service-public.gouv.fr/";

const mesAdresses: ServicePage = {
  slug: "mes-adresses",
  navLabel: "Mes Adresses",
  deploymentServiceId: 1,
  repositoryUrl: "https://github.com/BaseAdresseNationale/mes-adresses",
  trialHeading: { lead: "Concerné\u202f?", action: "Certifiez\u202f!" },
  trialCta: { text: "Commencer", href: MES_ADRESSES_URL },
  seo: {
    title: "Mes Adresses, référencez toutes les adresses de votre commune",
    description:
      "Créez ou mettez à jour la Base Adresse Locale de votre commune et alimentez la Base Adresse Nationale, pour des secours, des GPS et des livraisons qui trouvent la bonne adresse.",
  },

  hero: {
    name: "Mes Adresses",
    logo: {
      src: "/images/services-logos/adresses.png",
      width: 728,
      height: 160,
    },
    tagline: <>Référencez toutes les adresses de votre commune</>,
    description: (
      <>
        Créer ou mettre à jour votre Base Adresse Locale (BAL) pour offrir de meilleurs services à
        vos administrés.
      </>
    ),
    cta: { text: "Créer ou éditer ma base", href: MES_ADRESSES_URL },
    illustration: {
      src: "/images/services-illlu/adresses-hero.webp",
      alt: "",
      width: 980,
      height: 882,
    },
    screenshot: {
      src: "/images/services-illlu/adresses-top.webp",
      alt: "L’éditeur de Mes Adresses, avec la carte des voies de la commune et la liste des numéros",
      width: 1728,
      height: 942,
    },
  },

  // No highlight lists yet: they are planned for after the redesign of the
  // service, along with sharing.
  features: {
    rows: [
      {
        title: <>La conformité réglementaire simplifiée pour tous</>,
        description: (
          <>
            La loi 3DS a reconnu la pleine compétence des communes en matière d&rsquo;adressage :
            les communes sont en charge des dénominations des voies et lieux-dits et de leur
            numérotation. Elles doivent transmettre ces informations sous la forme d&rsquo;une Base
            Adresse Locale à la Base Adresse Nationale, base officielle des adresses en France. Ces
            données permettent de faciliter et d&rsquo;accélérer l&rsquo;arrivée des secours, la
            mise à jour des GPS, la connexion à la fibre, ou encore le référencement des
            entreprises.
          </>
        ),
        link: { text: "Essayer la démo", href: DEMO_URL },
        screenshot: {
          src: "/images/services-illlu/adresses-features-1.webp",
          alt: "",
          width: 1162,
          height: 764,
        },
      },
      {
        title: <>Déléguez la compétence en quelques clics</>,
        description: (
          <>
            Nos partenaires peuvent vous accompagner dans la création ou mise à jour de votre Base
            Adresse Locale en proposant un accompagnement et/ou des outils adaptés à votre
            territoire.
          </>
        ),
        link: { text: "Rechercher un partenaire", href: PARTNERS_URL },
        screenshot: {
          src: "/images/services-illlu/adresses-features-2.webp",
          alt: "",
          width: 1184,
          height: 682,
        },
      },
      {
        title: <>Améliorez votre base grâce aux signalements citoyens</>,
        description: (
          <>
            Pour améliorer l&rsquo;adressage en continu, communiquez sur notre service de
            signalements à destination de vos administrés. Vous recevrez une notification que vous
            pourrez valider en quelques clics.
          </>
        ),
        link: { text: "Diffuser Mes signalements", href: SIGNALEMENTS_URL },
        screenshot: {
          src: "/images/services-illlu/adresses-features-3.webp",
          alt: "",
          width: 1116,
          height: 714,
        },
      },
    ],
  },

  testimonials: {
    link: {
      href: DEPLOYMENT_MAP_URL,
      text: (count) => <>{count.toLocaleString("fr-FR")} communes l’utilisent</>,
    },
    testimonials: [
      {
        quote: (
          <>
            C&rsquo;est un outil simple et intuitif. Il retrouve les adresses déjà enregistrées, il
            n&rsquo;y a plus qu&rsquo;à vérifier. Ça permet surtout de renseigner les lieux-dits, ce
            qui est très important pour les secours.
          </>
        ),
        author: <>Commune de Nogaret (31)</>,
        link: {
          text: "Consulter l’article en entier",
          href: "https://adresse.data.gouv.fr/blog/les-bases-adresses-locales-pivot-de-la-transition-numerique-des-communes",
        },
      },
      {
        quote: (
          <>
            Lorsque j&rsquo;ai reçu le message du Programme Base Adresse Locale nous indiquant
            qu&rsquo;avec une Base Adresse Locale, la commune pouvait gérer l&rsquo;ensemble de ses
            adresses directement, j&rsquo;ai saisi l&rsquo;occasion d&rsquo;apporter moi-même les
            corrections.
          </>
        ),
        author: <>Commune de Kerfourn (56)</>,
        link: {
          text: "Consulter l’article en entier",
          href: "https://adresse.data.gouv.fr/blog/lassociation-des-maires-du-morbihan-mobilise-les-communes-sur-leurs-adresses",
        },
      },
      {
        quote: (
          <>
            La BAL est une référence sûre, partagée, au service des administrés et également des
            services municipaux. Sa pertinence est confortée par de multiples usages et sa pérennité
            est assurée par le service de proximité que constitue la Mairie (service urbanisme),
            avec une mention particulière à Mégalis Bretagne pour son accompagnement.
          </>
        ),
        author: <>Commune de Merdrignac (22)</>,
        link: {
          text: "Consulter l’article en entier",
          href: "https://adresse.data.gouv.fr/blog/lassociation-des-maires-du-morbihan-mobilise-les-communes-sur-leurs-adresses",
        },
      },
    ],
  },

  faq: {
    title: <>Questions fréquentes</>,
    description: (
      <>
        Pour en savoir plus, consultez le{" "}
        <Link href={HELP_CENTRE_URL} target="_blank" rel="noopener noreferrer">
          centre d&rsquo;aide
        </Link>{" "}
        .
      </>
    ),
    items: [
      {
        question: <>Quelle est la différence avec la Base Adresse Nationale ?</>,
        answer: (
          <p>
            La Base Adresse Nationale (BAN) répertorie l&rsquo;ensemble des adresses du territoire
            français, c&rsquo;est la base officielle de référence des adresses en France. Une Base
            Adresse Locale (BAL) est un fichier géré par une collectivité et contenant toutes ses
            adresses géolocalisées. Une fois publiée <em>via</em> Mes Adresses ou un autre moyen de
            publication, elle alimente la Base Adresse Nationale.
          </p>
        ),
      },
      {
        question: <>Pourquoi renseigner les données d&rsquo;adressage de ma commune ?</>,
        answer: (
          <p>
            Maintenir à jour les données d&rsquo;adressage de sa commune permet par exemple une
            arrivée plus rapide des services de secours, la bonne réception des colis ou le bon
            fonctionnement des services de GPS. Une fois leur BAL publiée, les communes n&rsquo;ont
            plus à transmettre leurs adresses à d&rsquo;autres acteurs, selon le principe du
            «&nbsp;Dites-le-nous une fois&nbsp;».
          </p>
        ),
      },
      {
        question: (
          <>
            Quelles collectivités sont concernées et qui peut renseigner les données
            d&rsquo;adressage ?
          </>
        ),
        answer: (
          <p>
            Les Bases Adresses Locales concernent toutes les communes de France. Depuis la loi 3DS,
            la dénomination des voies et des lieux-dits ainsi que leur numérotation relèvent de la
            compétence de la commune : celle-ci renseigne elle-même ses adresses, ou confie cette
            mission à un organisme tiers (EPCI, agence départementale ou prestataire) agissant pour
            son compte.
          </p>
        ),
      },
      {
        question: <>Comment savoir si ma commune a déjà créé sa Base Adresse Locale ?</>,
        answer: (
          <p>
            Une{" "}
            <Link href={DEPLOYMENT_BAL_URL} target="_blank" rel="noopener noreferrer">
              cartographie nationale
            </Link>{" "}
            permet de visualiser précisément l&rsquo;état du déploiement des Bases Adresses Locales
            sur l&rsquo;ensemble du territoire. Chaque commune y dispose d&rsquo;une{" "}
            <Link href={COMMUNE_PAGES_URL} target="_blank" rel="noopener noreferrer">
              page dédiée
            </Link>{" "}
            indiquant l&rsquo;état d&rsquo;avancement de sa propre base.
          </p>
        ),
      },
      {
        question: <>Comment publier la Base Adresse Locale de ma commune ?</>,
        answer: (
          <p>
            Les communes peuvent saisir et gérer directement leurs données d&rsquo;adressage depuis
            l&rsquo;outil{" "}
            <Link href={MES_ADRESSES_URL} target="_blank" rel="noopener noreferrer">
              Mes Adresses
            </Link>
            . Elles peuvent aussi s&rsquo;appuyer sur un organisme tiers qui dépose les données pour
            leur compte. Quelle que soit la méthode, les données publiées alimentent la Base Adresse
            Nationale sous deux heures. Le détail de chaque cas est publié dans{" "}
            <Link href={PUBLISHING_DOC_URL} target="_blank" rel="noopener noreferrer">
              le centre d&rsquo;aide
            </Link>
            .
          </p>
        ),
      },
      {
        question: <>Quelle adresse email utiliser pour se connecter avec ProConnect ?</>,
        answer: (
          <p>
            ProConnect est le service de l&rsquo;État permettant d&rsquo;accéder à plusieurs
            services publics numériques avec une seule identité professionnelle. La connexion à Mes
            Adresses est nécessaire pour publier une Base Adresse Locale. L&rsquo;adresse utilisée
            doit reposer sur le nom de domaine institutionnel de la commune, publié sur{" "}
            <Link href={ANNUAIRE_ADMINISTRATION_URL} target="_blank" rel="noopener noreferrer">
              l&rsquo;Annuaire de l&rsquo;administration
            </Link>
            .
          </p>
        ),
      },
    ],
  },
};

export default mesAdresses;
