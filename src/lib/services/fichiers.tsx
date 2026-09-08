import {
  DocPlus,
  Download,
  Eye,
  Mail,
  Send,
  Shared,
  Suggest,
  User,
  Zoom,
} from "@/components/icons/uikit";
import Link from "next/link";
import { type ServicePage } from "./types";

const DEMO_URL = "https://tube.numerique.gouv.fr/w/ouMvHX9AdGy4SqFRmV3yPx";
const ALL_FEATURES_URL =
  "https://projets.suite.anct.gouv.fr/boards/1785606084149380144?labels=1785609325725615173";
// The deployment map, filtered on Fichiers.
const DEPLOYMENT_MAP_URL = "/cartographie-deploiement?service_ids=12";
// The help centre, filtered on Fichiers.
const HELP_CENTRE_URL = "https://aide.suite.anct.gouv.fr/socle/fichiers";
// The large-file transfer service, named in the FAQ.
const TRANSFERTS_URL = "https://transferts.suite.anct.gouv.fr/";
// The host of the instance the ANCT operates, named in the FAQ.
const HOSTING_PROVIDER_URL = "https://www.scaleway.com/fr/";

const fichiers: ServicePage = {
  slug: "fichiers",
  navLabel: "Fichiers",
  deploymentServiceId: 12,
  repositoryUrl: "https://github.com/suitenumerique/drive",
  trialHeading: { lead: "Intéressé\u202f?", action: "Commencez\u202f!" },
  seo: {
    title: "Fichiers, stockez et collaborez sur vos documents en ligne",
    description:
      "Centralisez les fichiers de votre collectivité, partagez-les avec les droits de votre choix et travaillez à plusieurs en temps réel, dans un espace souverain et sécurisé.",
  },

  hero: {
    name: "Fichiers",
    logo: {
      src: "/images/services-logos/fichiers.png",
      width: 504,
      height: 160,
    },
    tagline: <>Stockez et collaborez sur vos documents en ligne</>,
    description: (
      <>
        Centralisez et travaillez en équipe sur tous vos fichiers dans un espace en ligne souverain
        et sécurisé.
      </>
    ),
    illustration: {
      src: "/images/services-illlu/fichiers-hero.webp",
      alt: "",
      width: 740,
      height: 740,
    },
    screenshot: {
      src: "/images/services-illlu/fichiers-top.webp",
      alt: "L’espace de stockage de Fichiers, avec l’arborescence des dossiers de la collectivité",
      width: 1920,
      height: 1686,
    },
    eligibilitySearch: true,
  },

  features: {
    rows: [
      {
        title: <>Vos fichiers au même endroit</>,
        description: (
          <>Retrouvez vos documents dans votre espace en ligne pour tous vos élus et agents.</>
        ),
        highlightColumns: 2,
        highlights: [
          { icon: Download, label: <>Importer et exporter</> },
          { icon: Eye, label: <>Prévisualiser</> },
          { icon: DocPlus, label: <>Créer des documents</> },
          { icon: Zoom, label: <>Rechercher et filtrer</> },
        ],
        link: { text: "Regarder la démo", href: DEMO_URL },
        screenshot: {
          src: "/images/services-illlu/fichiers-features-1.webp",
          alt: "",
          width: 1206,
          height: 828,
        },
      },
      {
        title: <>Au service de votre équipe</>,
        description: (
          <>
            Fini les multiples versions : tout le monde travaille sur le même document, au même
            endroit, en même temps.
          </>
        ),
        highlights: [
          { icon: User, label: <>Rôles différenciés</> },
          { icon: Shared, label: <>Partage privé ou public</> },
          { icon: Suggest, label: <>Édition collaborative simultanée</> },
        ],
        screenshot: {
          src: "/images/services-illlu/fichiers-features-2.webp",
          alt: "",
          width: 1206,
          height: 828,
        },
      },
      {
        title: <>Conçu pour un travail fluide</>,
        description: <>Transférez et stockez vos documents sans heurts lors de vos échanges.</>,
        highlights: [
          { icon: Send, label: <>Envoyez et recevez les fichiers lourds avec Transferts</> },
          { icon: Mail, label: <>Enregistrez directement vos pièces jointes depuis Messages</> },
        ],
        link: { text: "Voir toutes les fonctionnalités", href: ALL_FEATURES_URL },
        screenshot: {
          src: "/images/services-illlu/fichiers-features-3.webp",
          alt: "",
          width: 1206,
          height: 828,
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
            L&rsquo;interface est très claire, tout est compréhensible et les fonctionnalités sont
            comprises.
          </>
        ),
        author: <>Commune de Huelgoat</>,
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
        question: <>Quelle est la capacité de stockage de mon espace en ligne sur Fichiers ?</>,
        answer: (
          <p>
            La capacité de stockage par collectivité et par utilisateur est fixée par chaque
            structure de mutualisation partenaire en fonction de l&rsquo;offre souscrite par la
            collectivité. Concernant les collectivités outillées en direct par l&rsquo;ANCT, le
            stockage sur Fichiers est limité à 20&nbsp;Go par collectivité.
          </p>
        ),
      },
      {
        question: (
          <>Puis-je partager mes documents avec une personne extérieure à ma collectivité ?</>
        ),
        answer: (
          <p>
            Oui, quand le document est configuré en partage public. Un lien de partage peut alors
            être généré et la personne est également invitée directement par courriel, avec un accès
            en lecture ou en modification. Tout partage peut être restreint, modifié ou révoqué à
            tout moment par le propriétaire du document.
          </p>
        ),
      },
      {
        question: <>Puis-je envoyer des fichiers lourds ou volumineux avec Fichiers ?</>,
        answer: (
          <p>
            Oui, Fichiers dispose d&rsquo;une fonctionnalité dédiée à l&rsquo;envoi de fichiers trop
            volumineux pour être envoyés par courriel par exemple :{" "}
            <Link href={TRANSFERTS_URL} target="_blank" rel="noopener noreferrer">
              Transferts
            </Link>
            . Il est également possible de partager un document volumineux en le stockant sur
            Fichiers et en générant un lien de partage envoyé manuellement.
          </p>
        ),
      },
      {
        question: <>Puis-je stocker les pièces jointes de mes courriels sur Fichiers ?</>,
        answer: (
          <p>
            Oui. Fichiers est interopérable avec Messages, la messagerie de la Suite territoriale :
            les pièces jointes reçues peuvent être enregistrées directement dans l&rsquo;espace en
            ligne de la collectivité, sans téléchargement préalable. Il est également possible
            d&rsquo;envoyer des documents stockés sur Fichiers directement depuis Messages afin
            d&rsquo;éviter la démultiplication de pièces jointes.
          </p>
        ),
      },
      {
        question: <>Puis-je synchroniser Fichiers sur mon ordinateur ?</>,
        answer: (
          <p>
            Non. Afin de séparer les usages personnels des usages professionnels, Fichiers
            fonctionne exclusivement <em>via</em> le navigateur web, sans synchronisation locale. Ce
            choix garantit une expérience uniforme et renforce la sécurité des données grâce à des
            contrôles d&rsquo;accès centralisés : les documents restent accessibles depuis
            n&rsquo;importe quel appareil, sans installation ni configuration.
          </p>
        ),
      },
      {
        question: <>Où sont hébergés mes documents et qui peut y avoir accès ?</>,
        answer: (
          <p>
            Les documents sont hébergés sous juridiction française sur une infrastructure souveraine
            et sécurisée. L&rsquo;hébergeur actuel du service mis à disposition par l&rsquo;ANCT est{" "}
            <Link href={HOSTING_PROVIDER_URL} target="_blank" rel="noopener noreferrer">
              Scaleway
            </Link>
            . L&rsquo;accès aux documents stockés sur Fichiers est réservé aux personnes autorisées
            par la collectivité, après identification par ProConnect, et fait l&rsquo;objet de
            journaux d&rsquo;audit détaillés, conformément au RGPD.
          </p>
        ),
      },
    ],
  },
};

export default fichiers;
