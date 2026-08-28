import Link from "next/link";
import { type ServicePage } from "./types";

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
      src: "/images/services-illlu/fichiers-head.png",
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
  },

  features: {
    rows: [
      {
        title: <>Centralisez vos documents</>,
        description: (
          <>
            Fichiers est un espace en ligne pour stocker, organiser et retrouver tous les fichiers
            de la collectivité : présentations, documents, images, feuilles de calcul.
          </>
        ),
        screenshot: {
          src: "/images/services-illlu/fichiers-feature-1.png",
          alt: "",
          width: 1206,
          height: 828,
        },
      },
      {
        title: <>Partagez vos fichiers</>,
        description: (
          <>
            Définissez précisément les collaborateurs qui peuvent consulter, modifier ou gérer
            chaque fichier ou dossier. Envoyez des documents via des liens de partage ou la
            fonctionnalité Transferts.
          </>
        ),
        screenshot: {
          src: "/images/services-illlu/fichiers-feature-2.png",
          alt: "",
          width: 1206,
          height: 828,
        },
      },
      {
        title: <>Collaborez facilement</>,
        description: (
          <>
            Rédigez et modifiez des documents à plusieurs en temps réel. Fini les versions multiples
            : tout le monde travaille sur le même document, au même endroit.
          </>
        ),
        screenshot: {
          src: "/images/services-illlu/fichiers-feature-3.png",
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
            Par rapport à ce que j&rsquo;avais avant, c&rsquo;est un vrai confort de travailler avec
            Fichiers.
          </>
        ),
        // TODO: placeholder — the recap names no collectivité for this quote.
        author: <>Mairie de x</>,
      },
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
