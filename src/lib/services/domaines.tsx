import { type ServicePage } from "./types";

// V1: the hero only. Features, verbatims and FAQ are still being written.
const domaines: ServicePage = {
  slug: "domaines",
  navLabel: "Domaines",
  seo: {
    title: "Domaines, dotez votre commune d’un nom de domaine conforme",
    description:
      "Réservez le nom de domaine institutionnel de votre collectivité pour garantir votre présence en ligne, votre reconnaissance officielle et des adresses de messagerie conformes.",
  },

  hero: {
    name: "Domaines",
    logo: {
      src: "/images/services-logos/domaines.png",
      width: 604,
      height: 160,
    },
    tagline: <>Dotez votre commune d&rsquo;un nom de domaine conforme</>,
    description: (
      <>
        Réservez votre nom de domaine pour garantir votre présence en ligne et assurer votre
        reconnaissance officielle.
      </>
    ),
    illustration: {
      src: "/images/services-illlu/domaines-head.png",
      alt: "",
      width: 1832,
      height: 1504,
    },
    screenshot: {
      src: "/images/services-illlu/domaines-top.webp",
      alt: "Le service Domaines, avec la recherche d’un nom de domaine pour la collectivité",
      width: 1728,
      height: 1016,
    },
  },
};

export default domaines;
