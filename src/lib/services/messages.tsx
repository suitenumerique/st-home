import {
  Assign,
  BubbleText,
  Calendrier,
  Contacts,
  Doc,
  Download,
  Link as LinkIcon,
  Retry,
  Shared,
  Signature,
} from "@/components/icons/uikit";
import Link from "next/link";
import { type ServicePage } from "./types";

const DEMO_URL = "https://tube.numerique.gouv.fr/w/2UJw6Prm1XwsxxLfnjfgSJ";
const ALL_FEATURES_URL =
  "https://projets.suite.anct.gouv.fr/boards/1785606084149380144?labels=1785609198420100164";
const DEPLOYMENT_MAP_URL = "/cartographie-deploiement?service_ids=2";
const HELP_CENTRE_URL = "https://aide.suite.anct.gouv.fr/socle/messages";
const REFERENTIEL_URL = "/conformite/referentiel";
const CLIENTS_LOURDS_POST_URL = "/actualites/2026-06-10-messages-clients-lourds";

const messages: ServicePage = {
  slug: "messages",
  navLabel: "Messages",
  deploymentServiceId: 2,
  repositoryUrl: "https://github.com/suitenumerique/messages",
  trialHeading: { lead: "Intéressé\u202f?", action: "Démarrez\u202f!" },
  seo: {
    title: "Messages, envoyez et recevez vos courriels professionnels",
    description:
      "Envoyez et recevez vos courriels et gérez votre calendrier professionnel dans un environnement souverain et sécurisé, avec des adresses nominatives ou partagées.",
  },

  hero: {
    name: "Messages",
    logo: {
      src: "/images/services-logos/messages.png",
      width: 568,
      height: 160,
    },
    tagline: <>Envoyez et recevez vos courriels professionnels</>,
    description: (
      <>
        Envoyez et recevez vos courriels et gérez votre calendrier professionnel dans un
        environnement sécurisé.
      </>
    ),
    illustration: {
      src: "/images/services-illlu/messages-hero.webp",
      alt: "",
      width: 740,
      height: 740,
    },
    screenshot: {
      src: "/images/services-illlu/messages-top.webp",
      alt: "La boîte de réception de Messages, avec la liste des courriels et la conversation ouverte",
      width: 2412,
      height: 1656,
    },
    eligibilitySearch: true,
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
          { icon: Download, label: <>Importer votre ancienne boîte aux lettres</> },
          {
            icon: Doc,
            label: <>Créer et utiliser des modèles prêt à l&rsquo;emploi</>,
          },
          { icon: Retry, label: <>Programmer une réponse automatique</> },
        ],
        link: { text: "Regarder la démo", href: DEMO_URL },
        screenshot: {
          src: "/images/services-illlu/messages-features-1.webp",
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
          { icon: Assign, label: <>Assignation</> },
          { icon: Shared, label: <>Rôles différenciés</> },
          { icon: BubbleText, label: <>Commentaire interne</> },
          { icon: Signature, label: <>Signature uniformisée</> },
        ],
        screenshot: {
          src: "/images/services-illlu/messages-features-2.webp",
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
          { icon: Calendrier, label: <>Gérer vos évènements avec Calendrier</> },
          { icon: Contacts, label: <>Créer vos groupes avec Contacts</> },
          {
            icon: LinkIcon,
            label: <>Configurer des intégrations (clé API, widget, webhook)</>,
          },
        ],
        link: { text: "Voir toutes les fonctionnalités", href: ALL_FEATURES_URL },
        screenshot: {
          src: "/images/services-illlu/messages-features-3.webp",
          alt: "",
          width: 1188,
          height: 808,
        },
      },
    ],
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
          <>Pourquoi utiliser une adresse de messagerie professionnelle plutôt que personnelle ?</>
        ),
        answer: (
          <p>
            Pour des raisons de cybersécurité : une adresse professionnelle adossée au nom de
            domaine de la commune identifie sans ambiguïté une communication officielle, là où une
            adresse personnelle peut être confondue avec un envoi frauduleux. Elle sépare par
            ailleurs les usages personnels et professionnels et assure la continuité du service,
            notamment en cas de départ d&rsquo;un agent.
          </p>
        ),
      },
      {
        question: <>Puis-je utiliser Messages avec mon nom de domaine actuel ?</>,
        answer: (
          <p>
            Oui, l&rsquo;utilisation de Messages est compatible avec tout nom de domaine conforme au{" "}
            <Link href={REFERENTIEL_URL}>Référentiel de la présence numérique des territoires</Link>
            , c&rsquo;est-à-dire reposant sur l&rsquo;extension souveraine .fr ou une extension
            régionale (ex. : .bzh) et intégrant le libellé de la collectivité.
          </p>
        ),
      },
      {
        question: (
          <>Peut-on créer plusieurs adresses de messagerie et des boîtes aux lettres partagées ?</>
        ),
        answer: (
          <p>
            Messages permet de créer une boîte aux lettres nominative professionnelle par agent et
            par élu de la collectivité, ainsi qu&rsquo;un nombre illimité de boîtes aux lettres
            partagées (ex. : contact@mairie.fr ou bibliotheque@mairie.fr).
          </p>
        ),
      },
      {
        question: <>Quelle est la capacité de stockage des boîtes aux lettres sur Messages ?</>,
        answer: (
          <p>
            La capacité de stockage des boîtes aux lettres fournies par la Suite territoriale est
            fixée par chaque structure de mutualisation partenaire. Lorsque l&rsquo;ANCT outille en
            direct les collectivités, la capacité de stockage de Messages est limitée à 20&nbsp;Go
            par collectivité. Elle est corrélée aux besoins des agents et élus pour un usage
            strictement professionnel.
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
            étiquettes&hellip;) des messageries traditionnellement utilisées par les collectivités.
            Cette migration est réalisable en autonomie, sans compétence technique.
          </p>
        ),
      },
      {
        question: (
          <>
            Le service Messages couvre-t-il tous mes usages actuels (calendrier, mobile, application
            bureau) ?
          </>
        ),
        answer: (
          <p>
            Oui, Messages dispose d&rsquo;un calendrier partagé, d&rsquo;un annuaire de contacts et
            d&rsquo;une application mobile. Messages ne nécessite{" "}
            <Link href={CLIENTS_LOURDS_POST_URL}>aucune installation sur un poste de travail</Link>{" "}
            et est disponible <em>via</em> n&rsquo;importe quel navigateur web et une
            authentification ProConnect sécurisée.
          </p>
        ),
      },
    ],
  },
};

export default messages;
