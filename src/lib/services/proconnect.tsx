import Link from "next/link";
import { type ServicePage } from "./types";

const TERRITOIRES_URL = "/territoires";
const PARTNER_SPACE_URL = "https://partenaires.proconnect.gouv.fr/";
const DOMAINES_URL = "/services/domaines";
const MESSAGES_URL = "/services/messages";
const PROCONNECT_URL = "https://www.proconnect.gouv.fr/";
const ACCOUNT_DELETION_HELP_URL =
  "https://proconnect.crisp.help/fr/article/comment-supprimer-mon-compte-nlsvh2/";
const HELP_CENTRE_URL = "https://aide.suite.anct.gouv.fr/socle/proconnect";

const proconnect: ServicePage = {
  slug: "proconnect",
  navLabel: "ProConnect",
  proConnect: false,
  foundations: false,
  trialHeading: { lead: "ProConnecté ?", action: "Cliquez !" },
  trialCta: { text: "Découvrir mes services", href: TERRITOIRES_URL },
  seo: {
    title: "ProConnect, l’identité numérique des agents publics et des élus",
    description:
      "Accédez aux services de la Suite territoriale et aux démarches de l’État avec une seule adresse de messagerie professionnelle, sans nouveau mot de passe.",
  },

  hero: {
    name: "ProConnect",
    logo: {
      src: "/images/services-logos/proconnect.svg",
      width: 168,
      height: 40,
    },
    tagline: <>Connectez-vous à tous vos services en un clic</>,
    description: (
      <>
        Accédez à l&rsquo;ensemble de vos services numériques avec un seul identifiant et un seul
        mot de passe.
      </>
    ),
    illustration: {
      src: "/images/services-illlu/proconnect-hero.webp",
      alt: "",
      width: 1480,
      height: 1480,
    },
  },

  showcase: {
    title: <>Comment fonctionne ProConnect&nbsp;?</>,
    description: (
      <>
        ProConnect fédère les différents fournisseurs d&rsquo;identité des organisations publiques.
        Ils maintiennent à jour leurs annuaires qui répertorient les informations des agents publics
        et des élus&nbsp;: nom, prénom, fonction et adresse de messagerie professionnelle.
      </>
    ),
    card: {
      title: <>Des annuaires locaux</>,
      description: (
        <>
          Pour les collectivités territoriales, ces annuaires sont opérés et maintenus par les
          structures de mutualisation de votre territoire ou par l&rsquo;ANCT.
        </>
      ),
      stats: [
        { stat: "identityProviders", label: <>fournisseurs d&rsquo;identité locaux</> },
        { stat: "proconnectedOrganizations", label: <>collectivités proconnectées</> },
      ],
      background: {
        src: "/images/services-illlu/proconnect-top.webp",
        alt: "",
        width: 4800,
        height: 988,
      },
    },
  },

  prerequisites: {
    title: <>Quels sont les prérequis de ProConnect&nbsp;?</>,
    description: (
      <>
        Pour que ProConnect vous reconnaisse et vous rattache automatiquement à votre collectivité,
        deux éléments sont essentiels&nbsp;:
      </>
    ),
    illustrations: [
      {
        src: "/images/services-illlu/proconnect-middle-1.webp",
        alt: "Un nom de domaine institutionnel et conforme pour votre collectivité",
        width: 2336,
        height: 984,
      },
      {
        src: "/images/services-illlu/proconnect-middle-2.webp",
        alt: "Une adresse de messagerie nominative et professionnelle",
        width: 2336,
        height: 984,
      },
    ],
  },

  timeline: {
    title: <>Comment créer mon compte ProConnect&nbsp;?</>,
    description: (
      <>
        L&rsquo;ANCT et les structures de mutualisation des territoires peuvent vous accompagner, à
        chaque étape, dans la création de votre compte ProConnect.
      </>
    ),
    steps: [
      { text: "Obtenir un nom de domaine conforme pour ma collectivité", href: DOMAINES_URL },
      { text: "Créer mon adresse de messagerie nominative", href: MESSAGES_URL },
      {
        text: "Créer mon compte ProConnect avec mon fournisseur d’identité",
        href: TERRITOIRES_URL,
      },
    ],
  },

  emailCheck: true,

  partners: {
    title: <>Toujours plus de partenaires</>,
    description: (
      <>
        Devenez partenaire et intégrez ProConnect à votre service pour simplifier
        l&rsquo;identification des professionnels du public et du privé.
      </>
    ),
    link: { text: "Accéder à l’espace partenaire", href: PARTNER_SPACE_URL },
    logosAlign: "right",
    textColumns: 5,
    logos: [
      { src: "/images/logo-anct-small.png", alt: "ANCT", width: 58, height: 70, displayHeight: 60 },
      { src: "/images/logo-anssi.png", alt: "ANSSI", width: 70, height: 70, displayHeight: 60 },
      { src: "/images/logo-ign.png", alt: "IGN", width: 116, height: 56, displayHeight: 56 },
      {
        src: "/images/logo-gendarmerie.png",
        alt: "Gendarmerie nationale",
        width: 155,
        height: 32,
        displayHeight: 32,
      },
      { src: "/images/logo-pix.png", alt: "Pix", width: 96, height: 80, displayHeight: 50 },
    ],
  },

  faq: {
    title: <>Questions fréquentes</>,
    description: (
      <>
        Pour en savoir plus, consultez le{" "}
        <Link href={HELP_CENTRE_URL} target="_blank" rel="noopener noreferrer">
          Centre d&rsquo;aide
        </Link>
        .
      </>
    ),
    items: [
      {
        question: (
          <>Puis-je me connecter avec une adresse partagée, comme accueil@ ou contact@&nbsp;?</>
        ),
        answer: (
          <p>
            Non. Les adresses de messagerie partagées comme <i>contact@brigny.fr</i> ne permettent
            pas de créer un compte ProConnect. Seule votre adresse de messagerie nominative
            (ex&nbsp;: <i>martine.dupont@brigny.fr</i>) permet d&rsquo;être identifié comme agent
            public ou élu de votre collectivité.
          </p>
        ),
      },
      {
        question: <>Puis-je me connecter avec une adresse Gmail, Orange ou Wanadoo&nbsp;?</>,
        answer: (
          <p>
            Non. Les adresses de messagerie génériques comme <i>brigny@wanadoo.fr</i> ou{" "}
            <i>brigny@gmail.com</i> ne permettent pas de créer un compte ProConnect. Seul le nom de
            domaine institutionnel de votre collectivité permet de vous identifier comme agent ou
            élu de votre organisation.
          </p>
        ),
      },
      {
        question: (
          <>
            Que faire si j&rsquo;ai déjà un compte ProConnect avec une adresse personnelle ou
            générique&nbsp;?
          </>
        ),
        answer: (
          <p>
            Certains agents et élus des collectivités ont effectivement déjà un compte ProConnect
            créé en autonomie. Dans ce cas, le compte est intégré à un annuaire «&nbsp;par
            défaut&nbsp;», ProConnect Identité, opéré par la Direction interministérielle du
            numérique. Il est insuffisamment sécurisé, en ce qu&rsquo;il ne permet pas de vous
            identifier comme agent ou élu de votre collectivité et ne sera bientôt plus accepté par
            plusieurs services. Contactez votre structure de mutualisation ou l&rsquo;ANCT pour plus
            d&rsquo;informations.
          </p>
        ),
      },
      {
        question: <>Que faire si je change de collectivité ou si je quitte mes fonctions&nbsp;?</>,
        answer: (
          <>
            <p>
              <strong>Vous changez d&rsquo;organisation</strong>
              <br />
              Vous devez obligatoirement créer un nouveau compte ProConnect, avec votre nouvelle
              adresse de messagerie nominative. Il est techniquement impossible de transférer un
              compte existant vers une nouvelle adresse de messagerie ou de fusionner deux comptes.
              <br />
              La migration de vos données (historique, dossiers, démarches en cours) est à réaliser
              sur chaque service que vous utilisez. Rapprochez-vous de leur support pour en savoir
              plus.
            </p>
            <p>
              <strong>Vous quittez vos fonctions</strong>
              <br />
              Pour supprimer votre compte, rendez-vous sur{" "}
              <Link href={PROCONNECT_URL} target="_blank" rel="noopener noreferrer">
                votre compte ProConnect
              </Link>
              , rubrique Mon Compte (
              <Link href={ACCOUNT_DELETION_HELP_URL} target="_blank" rel="noopener noreferrer">
                en savoir plus
              </Link>
              ).
            </p>
          </>
        ),
      },
      {
        question: <>Comment faire si je travaille pour plusieurs collectivités&nbsp;?</>,
        answer: (
          <p>
            Votre compte ProConnect vous permet d&rsquo;être rattaché à plusieurs organisations pour
            lesquelles vous travaillez. Lors de la création de votre compte, ou au sein de votre
            espace personnel ProConnect (rubrique «&nbsp;Organisations&nbsp;»), saisissez le SIRET
            de vos organisations.
          </p>
        ),
      },
      {
        question: <>Quelle est la différence entre ProConnect et FranceConnect&nbsp;?</>,
        answer: (
          <p>
            FranceConnect sert aux particuliers, pour accéder à leurs démarches personnelles
            (impôts, santé, etc.). ProConnect sert aux professionnels, élus et agents de votre
            collectivité, pour accéder aux services, comme ceux de La Suite territoriale. Les deux
            sont des dispositifs de l&rsquo;État qui vous évitent de créer un compte sur chaque
            service.
          </p>
        ),
      },
    ],
  },
};

export default proconnect;
