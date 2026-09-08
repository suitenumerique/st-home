import {
  BadgeCheck,
  Clock,
  Compass,
  Contacts,
  FileCheck,
  ImageSpark,
  MapPin,
  Megaphone,
  Retry,
  Shared,
} from "@/components/icons/uikit";
import Link from "next/link";
import { type ServicePage } from "./types";

// The service itself: its public pages, and the "Espace Commune" behind them.
const ANNUAIRE_URL = "https://collectivite.fr/";
const SERVICE_PUBLIC_URL = "https://service-public.gouv.fr";
// The state-run directory the Annuaire synchronises with.
const ANNUAIRE_ADMINISTRATION_URL = "https://lannuaire.service-public.gouv.fr/navigation/mairie";
const CONTACT_EMAIL = "contact@suite.anct.gouv.fr";
const ALL_FEATURES_URL =
  "https://projets.suite.anct.gouv.fr/boards/1785606084149380144?labels=1785610535849428042";
// The deployment map, filtered on Annuaire.
const DEPLOYMENT_MAP_URL = "/cartographie-deploiement?service_ids=4";
// The help centre, filtered on Annuaire.
const HELP_CENTRE_URL = "https://aide.suite.anct.gouv.fr/socle/annuaire-des-collectivites";

const annuaire: ServicePage = {
  slug: "annuaire",
  navLabel: "Annuaire des collectivités",
  // Matches the service_ids filter of DEPLOYMENT_MAP_URL above.
  deploymentServiceId: 4,
  repositoryUrl: "https://github.com/betagouv/annuaire",
  trialHeading: { lead: "Concerné\u202f?", action: "Certifiez\u202f!" },
  trialCta: { text: "Commencer", href: ANNUAIRE_URL },
  seo: {
    title: "Annuaire des collectivités, certifiez vos informations en un clic",
    description:
      "Vérifiez et mettez à jour les horaires, contacts, conseil municipal et documents de votre collectivité publiés sur service-public.gouv.fr, depuis un espace unique.",
  },

  hero: {
    name: "Annuaire des collectivités",
    logo: {
      src: "/images/services-logos/annuaire.png",
      width: 1248,
      height: 160,
    },
    tagline: <>Certifiez vos horaires, contacts, liste municipale… en un clic</>,
    // A third longer than the other taglines: it needs the extra column to read
    // on two lines like them.
    textColumns: 8,
    description: (
      <>
        Vérifiez et mettez à jour facilement toutes les informations de votre collectivité présentes
        sur{" "}
        <Link href={SERVICE_PUBLIC_URL} target="_blank" rel="noopener noreferrer">
          service-public.gouv.fr
        </Link>
      </>
    ),
    cta: { text: "Certifier mes informations", href: ANNUAIRE_URL },
    illustration: {
      src: "/images/services-illlu/annuaire-hero.webp",
      alt: "",
      width: 740,
      height: 740,
    },
    screenshot: {
      src: "/images/services-illlu/annuaire-top.webp",
      alt: "L’espace commune de l’Annuaire, avec les informations publiées de la collectivité",
      width: 3063,
      height: 1869,
    },
  },

  features: {
    rows: [
      {
        title: <>L&rsquo;information toujours à jour</>,
        description: (
          <>
            Permettez à vos administrés d&rsquo;accéder à des informations fiables sur votre
            collectivité.
          </>
        ),
        highlightColumns: 2,
        highlights: [
          { icon: Clock, label: <>Horaires</> },
          { icon: Shared, label: <>Conseil municipal</> },
          { icon: Contacts, label: <>Contacts</> },
          { icon: ImageSpark, label: <>Blason et logo</> },
        ],
        link: { text: "Voir la page de ma collectivité", href: ANNUAIRE_URL },
        screenshot: {
          src: "/images/services-illlu/annuaire-features-1.webp",
          alt: "",
          width: 1174,
          height: 902,
        },
      },
      {
        title: <>Créé pour diffuser l&rsquo;information</>,
        description: (
          <>Publiez vos documents légaux et retrouvez les informations des structures alentours.</>
        ),
        highlights: [
          { icon: Megaphone, label: <>Publications municipales</> },
          { icon: FileCheck, label: <>Actes administratifs</> },
          { icon: MapPin, label: <>Annuaire des structures de proximité</> },
        ],
        link: { text: "Voir toutes les fonctionnalités", href: ALL_FEATURES_URL },
        screenshot: {
          src: "/images/services-illlu/annuaire-features-2.webp",
          alt: "",
          width: 1174,
          height: 902,
        },
      },
      {
        title: <>Facilitez l&rsquo;ouverture des données</>,
        description: (
          <>
            Certifiez vos informations pour garantir la diffusion de jeux de données publiques
            fiables.
          </>
        ),
        highlights: [
          { icon: Retry, label: <>Mise à jour automatique</> },
          { icon: BadgeCheck, label: <>Moins d&rsquo;informations obsolètes</> },
          { icon: Compass, label: <>Évite l&rsquo;errance des administrés</> },
        ],
        link: { text: "Certifier mes données", href: ANNUAIRE_URL },
        screenshot: {
          src: "/images/services-illlu/annuaire-features-3.webp",
          alt: "",
          width: 1174,
          height: 902,
        },
      },
    ],
  },

  testimonials: {
    link: {
      href: DEPLOYMENT_MAP_URL,
      text: (count) => <>{count.toLocaleString("fr-FR")} collectivités l’utilisent</>,
    },
    testimonials: [
      {
        quote: (
          <>
            Nous utilisons cet outil pour communiquer des informations pratiques et notre magazine
            municipal, cela représente une économie importante en ressources humaines et
            financières.
          </>
        ),
        author: <>Commune de Saint-Félix-Lauragais (31)</>,
      },
      {
        quote: (
          <>
            L&rsquo;Annuaire des Collectivités est un outil facile, percutant et à jour. À partir du
            moment ou l&rsquo;on récupère notre code d&rsquo;accès le tour est joué ! C&rsquo;est
            très facile de l&rsquo;utiliser.
          </>
        ),
        author: <>Commune de Sannes (84)</>,
      },
      {
        quote: (
          <>
            L&rsquo;Annuaire est un très bon compromis pour les mairies qui n&rsquo;ont pas de site.
            Sur une note de 1 à 10 si je devais recommander l&rsquo;Annuaire à une autre commune ?
            Je mettrais 10
          </>
        ),
        author: <>Commune de Lambesc (13)</>,
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
          <>
            Quelle est la différence avec l&rsquo;Annuaire de l&rsquo;administration de
            Service-Public.gouv.fr ?
          </>
        ),
        answer: (
          <p>
            <Link href={ANNUAIRE_ADMINISTRATION_URL} target="_blank" rel="noopener noreferrer">
              L&rsquo;Annuaire de l&rsquo;administration
            </Link>{" "}
            est le site de l&rsquo;État recensant certaines informations (adresse postale, site web,
            horaires d&rsquo;ouverture&hellip;) des collectivités françaises.{" "}
            <strong>L&rsquo;Annuaire des collectivités</strong> permet aux communes de certifier et
            de corriger elles-mêmes ces informations, depuis l&rsquo;Espace Commune. Les deux sont
            synchronisés en permanence, dans les deux sens.
          </p>
        ),
      },
      {
        question: <>Quelles collectivités peuvent utiliser le service ?</>,
        answer: (
          <p>
            Toutes les communes françaises, sans seuil de population ni adhésion préalable, peuvent
            utiliser l&rsquo;Annuaire des collectivités pour consulter et mettre à jour leurs
            données officielles. Une adresse email professionnelle permettant de se connecter avec
            ProConnect suffit. Les EPCI, départements et régions ne sont aujourd&rsquo;hui pas
            concernés.
          </p>
        ),
      },
      {
        question: (
          <>Pourquoi les informations de ma collectivité doivent-elles y figurer et être à jour ?</>
        ),
        answer: (
          <p>
            Car elles sont les informations officielles de la commune, utilisées par
            l&rsquo;ensemble des services de l&rsquo;État et consultées par les administrés :
            adresse, horaires d&rsquo;ouverture, coordonnées, conseil municipal&hellip; Les données
            certifiées sont reprises par{" "}
            <Link href={SERVICE_PUBLIC_URL} target="_blank" rel="noopener noreferrer">
              Service-Public.gouv.fr
            </Link>{" "}
            et tous les services réutilisant ces données publiques selon le principe du
            «&nbsp;Dites-le-nous une fois&nbsp;».
          </p>
        ),
      },
      {
        question: <>Qui peut modifier les informations et comment les mettre à jour ?</>,
        answer: (
          <p>
            Tout agent public ou élu de la commune disposant d&rsquo;une adresse email
            professionnelle peut mettre à jour les données de sa commune grâce à une connexion
            sécurisée ProConnect. Les modifications sont enregistrées et vérifiées par les services
            de l&rsquo;État.
          </p>
        ),
      },
      {
        question: (
          <>
            Puis-je réutiliser les données publiques de ma collectivité <em>via</em> l&rsquo;API de
            collectivite.fr ?
          </>
        ),
        answer: (
          <p>
            Oui. Les informations affichées sont des données publiques ouvertes, librement
            réutilisables via l&rsquo;API. Un site internet communal, une application ou un
            prestataire peuvent donc les afficher automatiquement, sans double saisie : la mise à
            jour n&rsquo;est faite qu&rsquo;une fois, dans l&rsquo;Espace Commune.
          </p>
        ),
      },
      {
        question: <>L&rsquo;utilisation du service est-elle payante pour ma collectivité ?</>,
        answer: (
          <p>
            Non, l&rsquo;Annuaire des collectivités est un service public numérique gratuit pour
            toutes les communes. Aucune démarche payante n&rsquo;est nécessaire pour créer ou mettre
            à jour la page de la commune : les sollicitations commerciales proposant de le faire
            contre paiement ne relèvent pas du service public et peuvent être signalées à{" "}
            <Link href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Link>.
          </p>
        ),
      },
    ],
  },
};

export default annuaire;
