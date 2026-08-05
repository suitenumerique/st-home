import { type ServicePage } from "./types";

// TODO: placeholders — point these at the real demo recordings and the webinar
// registration form once published.
const DEMO_URL = "https://aide.suite.anct.gouv.fr/socle/messages";
const ALL_FEATURES_URL = "https://aide.suite.anct.gouv.fr/socle/messages";
const WEBINAR_URL = "https://aide.suite.anct.gouv.fr/socle/messages";

const messages: ServicePage = {
  slug: "messages",
  navLabel: "Messages",
  seo: {
    title: "Messages, la messagerie professionnelle des collectivités",
    description:
      "Créez des adresses de messagerie nominatives ou partagées pour votre collectivité et gérez vos courriels professionnels en équipe, dans un environnement souverain et sécurisé.",
  },

  hero: {
    name: "Messages",
    tagline: <>Envoyez et recevez vos courriels en toute sécurité</>,
    description: (
      <>
        Créer des adresses nominatives ou partagées pour votre collectivité et gérer vos courriels
        professionnels en équipe.
      </>
    ),
    illustration: {
      src: "/images/services-illlu/messages-head.png",
      alt: "",
      width: 740,
      height: 740,
    },
    eligibilitySearch: {
      title: <>Découvrez vos modalités d&rsquo;accès</>,
      placeholder: "Entrez le nom de votre territoire ou son code postal",
      placeholderSmallScreen: "Nom ou code postal",
    },
  },

  features: {
    rows: [
      {
        title: <>Adapté à votre quotidien</>,
        description: (
          <>
            Changez d&rsquo;outil sans rien perdre et gagnez du temps sur vos tâches les plus
            répétitives.
          </>
        ),
        highlights: [
          { icon: "fr-icon-download-line", label: <>Importer votre ancienne boîte aux lettres</> },
          {
            icon: "fr-icon-file-text-line",
            label: <>Créer et utiliser des modèles prêt à l&rsquo;emploi</>,
          },
          { icon: "fr-icon-refresh-line", label: <>Programmer une réponse automatique</> },
        ],
        link: { text: "Regarder la démo", href: DEMO_URL },
        screenshot: {
          src: "/images/services-illlu/messages-feature-1.png",
          alt: "",
          width: 1206,
          height: 828,
        },
      },
      {
        title: <>Conçu pour le travail en équipe</>,
        description: (
          <>
            Assignez, commentez, répondez ensemble : fini les mails perdus grâce aux fonctionnalités
            collaboratives.
          </>
        ),
        highlightColumns: 2,
        highlights: [
          { icon: "fr-icon-user-add-line", label: <>Assignation</> },
          { icon: "fr-icon-team-line", label: <>Rôles différenciés</> },
          { icon: "fr-icon-chat-3-line", label: <>Commentaire interne</> },
          { icon: "fr-icon-pen-nib-line", label: <>Signature uniformisée</> },
        ],
        link: { text: "Regarder la démo", href: DEMO_URL },
        screenshot: {
          src: "/images/services-illlu/messages-feature-2.png",
          alt: "",
          width: 1206,
          height: 828,
        },
      },
      {
        title: <>Pensé en complémentarité</>,
        description: (
          <>
            Synchronisez et retrouvez un ensemble de services pour faciliter et centraliser vos
            échanges.
          </>
        ),
        highlights: [
          { icon: "fr-icon-calendar-line", label: <>Gérer vos évènements avec Calendrier</> },
          { icon: "fr-icon-user-star-line", label: <>Créer vos groupes avec Contacts</> },
          {
            icon: "fr-icon-links-line",
            label: <>Configurer des intégrations (clé API, widget, webhook)</>,
          },
        ],
        link: { text: "Voir toutes les fonctionnalités", href: ALL_FEATURES_URL },
        screenshot: {
          src: "/images/services-illlu/messages-feature-3.png",
          alt: "",
          width: 1188,
          height: 808,
        },
      },
    ],
  },

  proConnect: {
    logo: {
      src: "/images/logo-proconnect.svg",
      alt: "ProConnect",
      width: 72,
      height: 72,
    },
    title: <>Une identification sécurisée</>,
    description: (
      <>
        Grâce à l&rsquo;identification ProConnect, votre collectivité peut accéder en toute sécurité
        à{" "}
        <strong>l&rsquo;ensemble de vos services avec un seul identifiant et mot de passe.</strong>
      </>
    ),
    cards: [
      {
        icon: "fr-icon-window-line",
        title: <>Nom de domaine</>,
        description: (
          <>
            Utilisez le nom de domaine renseigné sur l&rsquo;annuaire de service-public.gouv.fr pour
            votre proconnexion. Un nom de domaine conforme à notre référentiel est vivement
            recommandé.
          </>
        ),
      },
      {
        icon: "fr-icon-mail-line",
        title: <>Adresses nominatives</>,
        description: (
          <>
            Avec Messages, créez une adresse de messagerie pour chaque membre de votre collectivité
            avec un nom de domaine conforme et être identifié en tant que représentant officiel de
            la collectivité.
          </>
        ),
      },
    ],
    link: { text: "S’inscrire à un webinaire", href: WEBINAR_URL },
  },
};

export default messages;
