import { type ServicePage } from "./types";

// The deployment map, filtered on Fichiers.
const DEPLOYMENT_MAP_URL = "/cartographie-deploiement?service_ids=12";

const fichiers: ServicePage = {
  slug: "fichiers",
  navLabel: "Fichiers",
  deploymentServiceId: 12,
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
};

export default fichiers;
