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
          <>
            <p>
              Si votre collectivité est outillée par une structure de mutualisation partenaire, la
              capacité de stockage par collectivité et par utilisateur est fixée par cette
              structure.
            </p>
            <p>
              Pour les collectivités outillées directement par l&rsquo;ANCT, la capacité de stockage
              maximum est fixée à 10 Go.
            </p>
          </>
        ),
      },
      {
        question: <>Puis-je synchroniser Fichiers sur mon ordinateur ?</>,
        answer: (
          <p>
            Fichiers fonctionne exclusivement via le navigateur web, sans synchronisation locale. Ce
            choix nous permet de vous garantir une expérience uniforme quel que soit votre système
            d&rsquo;exploitation (Windows, macOS, Linux), et de renforcer la sécurité de vos données
            grâce à des contrôles d&rsquo;accès centralisés. Vos fichiers restent ainsi accessibles
            depuis n&rsquo;importe quel navigateur, sur n&rsquo;importe quel appareil, sans
            installation ni configuration.
          </p>
        ),
      },
      {
        question: (
          <>Comment partager un document avec une personne extérieure à ma collectivité ?</>
        ),
        answer: (
          <>
            <p>
              Depuis Fichiers, vous pouvez générer un lien de partage pour tout document ou dossier,
              avec un accès en lecture ou en modification selon vos besoins.
            </p>
            <p>
              Le partage avec une personne extérieure à votre collectivité est possible uniquement
              si le document est configuré en partage public. Dans ce cas, vous pouvez copier son
              lien ou inviter directement la personne par email. Un document privé reste, lui,
              réservé aux membres de votre collectivité. Vous gardez la main sur ce partage à tout
              moment : vous pouvez le restreindre, le modifier ou le révoquer dès que nécessaire.
            </p>
          </>
        ),
      },
      {
        question: <>Puis-je restreindre l&rsquo;accès à certains documents selon les rôles ?</>,
        answer: (
          <p>
            Oui. Fichiers permet d&rsquo;attribuer des rôles différenciés à chaque utilisateur
            (lecture, modification, gestion), afin que seules les personnes autorisées puissent
            consulter ou modifier un document. Vous pouvez ainsi partager un document en privé, au
            sein d&rsquo;un groupe restreint, ou le rendre accessible publiquement selon vos
            besoins.
          </p>
        ),
      },
      {
        question: <>Où mes documents et mes données sont-ils hébergés ?</>,
        answer: (
          <p>
            Vos documents et données sont hébergés en France, sur une infrastructure souveraine et
            sécurisée, sous juridiction française. L&rsquo;hébergeur actuel du service mis à
            disposition par l&rsquo;ANCT est{" "}
            <Link href={HOSTING_PROVIDER_URL} target="_blank" rel="noopener noreferrer">
              Scaleway
            </Link>
            .
          </p>
        ),
      },
      {
        question: <>La durabilité du service est-elle assurée ?</>,
        answer: (
          <p>
            Fichiers est opéré par l&rsquo;ANCT et la DINUM à partir de briques open-source et
            constitue un élément central de la feuille de route numérique de l&rsquo;Incubateur des
            territoires (ANCT) pour la souveraineté des collectivités. Au-delà de cette dimension
            stratégique, sa résilience et sa pérennité tiennent à sa coopération avec les opérateurs
            publics de services numériques et ses partenaires, pour déployer le service que ce soit
            sur l&rsquo;instance de l&rsquo;ANCT ou sur des instances dédiées.
          </p>
        ),
      },
    ],
  },
};

export default fichiers;
