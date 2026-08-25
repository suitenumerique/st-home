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
const SELF_HOSTING_URL =
  "https://docs.numerique.gouv.fr/docs/440cb67a-093c-4901-ac88-702c7b298ff5/";

const messages: ServicePage = {
  slug: "messages",
  navLabel: "Messages",
  deploymentServiceId: 2,
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
    eligibilitySearch: { selfHostingUrl: SELF_HOSTING_URL },
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
        iconColor: "yellow-tournesol",
        highlights: [
          { icon: Assign, label: <>Assignation</> },
          { icon: Shared, label: <>Rôles différenciés</> },
          { icon: BubbleText, label: <>Commentaire interne</> },
          { icon: Signature, label: <>Signature uniformisée</> },
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
        iconColor: "green-archipel",
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
          src: "/images/services-illlu/messages-feature-3.png",
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
            créer des boîtes de messagerie partagées (ex : bibliothèque@commune.fr).
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
        answer: (
          <p>
            Messages est opéré par l&rsquo;ANCT à partir de briques open-source et constitue un
            élément central de la feuille de route numérique de l&rsquo;Incubateur des territoires
            pour la souveraineté des collectivités. Au-delà de cette dimension stratégique, sa
            résilience et sa pérennité tiennent à sa coopération avec les opérateurs publics de
            services numériques et partenaires, pour déployer le service que ce soit sur
            l&rsquo;instance de l&rsquo;ANCT ou sur des instances dédiées.
          </p>
        ),
      },
    ],
  },
};

export default messages;
