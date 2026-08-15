import Link from "next/link";
import { ELIGIBILITY_SEARCH_ANCHOR, type ServicePage } from "./types";

const DEMO_URL = "https://tube.numerique.gouv.fr/w/2UJw6Prm1XwsxxLfnjfgSJ";
const ALL_FEATURES_URL =
  "https://projets.suite.anct.gouv.fr/boards/1785606084149380144?labels=1785609198420100164";
// V1: the help centre article on domain names. TODO: point at /services/domaines
// once that page exists.
const DOMAINES_URL = "https://aide.suite.anct.gouv.fr/socle/domaines";
// The deployment map, filtered on Messages.
const DEPLOYMENT_MAP_URL = "/cartographie-deploiement?service_ids=2";
// TODO: placeholder — point this at the feedback form once it exists.
const FEEDBACK_URL = "https://aide.suite.anct.gouv.fr/socle/messages";
// The help centre, filtered on Messages, and the partner documentation.
const HELP_CENTRE_URL = "https://aide.suite.anct.gouv.fr/socle/messages";
const PARTNER_CENTRE_URL =
  "https://docs.numerique.gouv.fr/docs/a85b4b1f-790f-4e55-b097-91eac06d69a6/";
const REPOSITORY_URL = process.env.NEXT_PUBLIC_APP_REPOSITORY_URL ?? "";
// TODO: placeholder — point this at the registration form of the webinar on
// domain names and compliance once published.
const WEBINAR_URL = "https://aide.suite.anct.gouv.fr/socle/messages";

const messages: ServicePage = {
  slug: "messages",
  navLabel: "Messages",
  // Matches the service_ids filter of DEPLOYMENT_MAP_URL below.
  deploymentServiceId: 2,
  seo: {
    title: "Messages, la messagerie professionnelle des collectivités",
    description:
      "Créez des adresses de messagerie nominatives ou partagées pour votre collectivité et gérez vos courriels professionnels en équipe, dans un environnement souverain et sécurisé.",
  },

  hero: {
    name: "Messages",
    logo: {
      src: "/images/services-logos/messages.png",
      width: 568,
      height: 160,
    },
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
    screenshot: {
      src: "/images/services-illlu/messages-top.png",
      alt: "La boîte de réception de Messages, avec la liste des courriels et la conversation ouverte",
      width: 2412,
      height: 1656,
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
          { icon: "fr-icon-chat-3-line", label: <>Commentaire interne</> },
          { icon: "fr-icon-team-line", label: <>Rôles différenciés</> },
          { icon: "fr-icon-pen-nib-line", label: <>Signature uniformisée</> },
        ],
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
      src: "/images/logo-proconnect-new.svg",
      alt: "ProConnect",
      width: 100,
      height: 112,
    },
    title: <>Une identification sécurisée</>,
    description: (
      <>
        Grâce à l&rsquo;identification ProConnect, votre collectivité peut accéder en toute sécurité
        à l&rsquo;ensemble de vos services avec un seul identifiant et mot de passe.
      </>
    ),
    cards: [
      {
        icon: {
          src: "/images/rcpnt-site-mono.svg",
          alt: "",
          width: 40,
          height: 40,
        },
        title: <>Nom de domaine</>,
        href: DOMAINES_URL,
        description: (
          <>
            Utilisez le nom de domaine renseigné sur l&rsquo;annuaire de{" "}
            <Link href="https://service-public.gouv.fr" target="_blank" rel="noopener noreferrer">
              service-public.gouv.fr
            </Link>{" "}
            pour votre proconnexion. Un nom de domaine conforme à notre référentiel est vivement
            recommandé.
          </>
        ),
      },
      {
        icon: {
          src: "/images/rcpnt-messagerie-mono.svg",
          alt: "",
          width: 33,
          height: 35,
        },
        title: <>Adresses nominatives</>,
        // On the Messages page itself, the card points back up to the hero
        // search rather than off to a page the visitor is already on.
        href: `#${ELIGIBILITY_SEARCH_ANCHOR}`,
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

  testimonials: {
    link: {
      href: DEPLOYMENT_MAP_URL,
      text: (count) => <>{count.toLocaleString("fr-FR")} collectivités l’ont déjà adopté</>,
    },
    testimonials: [
      {
        quote: (
          <>
            Nous avons un maire heureux ! Il a, depuis hier, son nom de domaine et accès à Messages
            et Fichiers via ProConnect, tout fonctionne nickel. On a tout testé, l&rsquo;importation
            des boîtes aux lettres dans Messages, c&rsquo;est incroyable comme ça fonctionne bien.
          </>
        ),
        author: <>Syndicat Mixte La Fibre64 (64)</>,
      },
      {
        quote: (
          <>
            C&rsquo;est vraiment super ! J&rsquo;ai mis en place cette application sans problème et
            l&rsquo;aide est bien utile.
          </>
        ),
        author: <>Commune de Tourneville (27)</>,
      },
      {
        quote: (
          <>
            La nouvelle fonctionnalité qui permet de visualiser et imprimer les pièces jointes
            d&rsquo;un mail sans les télécharger, c&rsquo;est top ! Merci pour votre travail.
          </>
        ),
        author: <>Commune de Griesbach-au-Val (68)</>,
      },
      {
        quote: (
          <>
            Le vrai plus, c&rsquo;est de pouvoir commenter un échange ou se répartir les tâches
            entre élus directement dans la conversation. Cela évite les oublis et les allers-retours
            inutiles, et on répond plus efficacement aux sollicitations des habitants.
          </>
        ),
        author: <>Commune de Courson-Monteloup (91)</>,
      },
      {
        quote: (
          <>
            Merci de mettre ces outils en place. Ils manquaient cruellement dans les petites mairies
            (comme dans les grandes sûrement) et ont le mérite d&rsquo;être libres et souverains.
          </>
        ),
        author: <>Commune de Saint-Goussaud (23)</>,
      },
    ],
  },

  foundations: {
    title: <>Des fondements essentiels</>,
    description: (
      <>
        Tous nos services sont conçus pour et avec les collectivités, selon des standards élevés
        garantissant l&rsquo;intégrité de vos données.
      </>
    ),
    foundations: [
      {
        icon: { src: "/images/shield-check.svg", alt: "", width: 64, height: 64 },
        title: <>Sécurité avancée</>,
        description: (
          <>
            Identification unique avec ProConnect, système antivirus, contrôles d&rsquo;accès,
            journaux d&rsquo;audit détaillés, le tout conforme au RGPD.
          </>
        ),
      },
      {
        icon: { src: "/images/code.svg", alt: "", width: 64, height: 64 },
        title: <>Commun numérique</>,
        description: (
          <>
            La gouvernance partagée avec nos partenaires garantit la prise en compte de vos retours
            et le maintien de tous nos codes sources ouverts.
          </>
        ),
      },
      {
        icon: { src: "/images/map-pin.svg", alt: "", width: 64, height: 64 },
        title: <>Hébergement en France</>,
        description: (
          <>
            Pour une souveraineté renforcée, toutes vos données sont stockées et traitées en France,
            sous juridiction française et avec une gouvernance vérifiable.
          </>
        ),
      },
      {
        icon: { src: "/images/puzzle.svg", alt: "", width: 64, height: 64 },
        title: <>Service interopérable</>,
        description: (
          <>
            Nos services sont nativement conçus pour fonctionner avec d&rsquo;autres services, pour
            toujours plus d&rsquo;efficacité et sans ressaisie de vos données.
          </>
        ),
      },
    ],
    callToAction: {
      text: (
        <>
          Aidez-nous à construire un service sur mesure pour les collectivités : partagez vos
          retours ou contribuez directement au code.
        </>
      ),
      primaryLink: { text: "Partager un retour", href: FEEDBACK_URL },
      secondaryLink: { text: "Contribuer au code", href: REPOSITORY_URL },
    },
  },

  faq: {
    title: <>Questions fréquentes</>,
    description: (
      <>
        Pour en savoir plus, consultez le{" "}
        <Link href={HELP_CENTRE_URL} target="_blank" rel="noopener noreferrer">
          centre d&rsquo;aide
        </Link>{" "}
        ou le{" "}
        <Link href={PARTNER_CENTRE_URL} target="_blank" rel="noopener noreferrer">
          centre partenaire
        </Link>
        .
      </>
    ),
    items: [
      {
        question: <>Quelle est la capacité de stockage de ma boîte aux lettres ?</>,
        answer: (
          <>
            <p>
              La capacité de stockage des boîtes aux lettres fournies par la Suite territoriale est
              fixée par chaque structure de mutualisation partenaire.
            </p>
            <p>
              Lorsque l&rsquo;ANCT outille en direct les collectivités qui ne bénéficient pas de la
              présence d&rsquo;une structure de mutualisation sur leur département, la capacité de
              stockage de Messages est limitée à 10 Go. Elle est corrélée aux besoins des agents et
              élus pour un usage strictement professionnel.
            </p>
          </>
        ),
      },
      {
        question: <>Puis-je utiliser la Messagerie avec mon nom de domaine actuel ?</>,
        answer: (
          <p>
            Oui, l&rsquo;utilisation de la Messagerie n&rsquo;est pas dépendante de la fourniture
            d&rsquo;un nom de domaine institutionnel par l&rsquo;ANCT et est possible avec tout nom
            de domaine conforme.
          </p>
        ),
      },
      {
        question: <>Puis-je synchroniser ce compte mail avec un autre client ?</>,
        answer: (
          <p>
            Non, comme tous les services de la Suite territoriale, la Messagerie est accessible
            uniquement <em>via</em> ProConnect pour des raisons de sécurité et afin de dissocier les
            usages personnels de professionnels.
          </p>
        ),
      },
      {
        question: (
          <>
            Est-il possible de créer une adresse de messagerie accessible par plusieurs utilisateurs
            ?
          </>
        ),
        answer: (
          <p>
            Oui, si les adresses de messagerie sont strictement nominatives, il est possible de
            créer des boîtes de messagerie partagées (ex : bibliotheque@commune.collectivite.fr).
          </p>
        ),
      },
      {
        question: (
          <>Puis-je importer l&rsquo;historique et les données de ma messagerie actuelle ?</>
        ),
        answer: (
          <p>
            Oui, Messages permet un import simple de toutes les données (historique, dossiers,
            étiquettes...) des messageries traditionnellement utilisées par les collectivités. Cette
            migration est réalisable en autonomie, sans compétence technique.
          </p>
        ),
      },
      {
        question: <>La durabilité du service est-elle assurée ?</>,
        // TODO: answer still to be written — this question ships with a
        // placeholder until then.
        answer: <p>à écrire…</p>,
      },
    ],
  },

  trial: {
    accessLink: { text: "Voir mes modalités d’accès", href: `#${ELIGIBILITY_SEARCH_ANCHOR}` },
  },
};

export default messages;
