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
const ALL_FEATURES_URL =
  "https://projets.suite.anct.gouv.fr/boards/1785606084149380144?labels=1785610535849428042";
// The deployment map, filtered on Annuaire.
const DEPLOYMENT_MAP_URL = "/cartographie-deploiement?service_ids=4";
// The help centre, filtered on Annuaire.
const HELP_CENTRE_URL = "https://aide.suite.anct.gouv.fr/socle/annuaire-des-collectivites";

const annuaire: ServicePage = {
  slug: "annuaire",
  navLabel: "Annuaire",
  // Matches the service_ids filter of DEPLOYMENT_MAP_URL above.
  deploymentServiceId: 4,
  repositoryUrl: "https://github.com/betagouv/annuaire",
  trialHeading: { lead: "Concerné\u202f?", action: "Certifiez\u202f!" },
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
          <>Quelles collectivités sont concernées, et qui peut modifier les informations ?</>
        ),
        answer: (
          <p>
            La plateforme s&rsquo;adresse à toutes les communes, sans restriction de seuil, qui
            peuvent se proconnecter. Toutes les communes sont incitées à se connecter à
            l&rsquo;espace commune pour certifier leurs données locales.
          </p>
        ),
      },
      {
        question: (
          <>À quelle fréquence les données sont-elles synchronisées avec service-public.gouv.fr ?</>
        ),
        answer: (
          <>
            <p>
              La synchronisation est <strong>permanente et automatique</strong>, dans les deux sens.
            </p>
            <ul>
              <li>
                <strong>De Service-Public.gouv.fr vers l&rsquo;Annuaire</strong> : l&rsquo;Annuaire
                relit en continu les données publiques de l&rsquo;annuaire du service public. Les
                communes sont traitées par lots successifs, de sorte que{" "}
                <strong>la page de chaque commune est rafraîchie au moins une fois par mois</strong>
                . Vous n&rsquo;avez aucune démarche à faire : c&rsquo;est automatique.
              </li>
              <li>
                <strong>De l&rsquo;Annuaire vers Service-Public.gouv.fr</strong> : lorsque vous
                corrigez vos horaires, vos coordonnées ou votre blason depuis l&rsquo;Espace
                Commune, la modification est renvoyée vers le jeu de données source. Elle est donc
                visible sur votre page de l&rsquo;Annuaire très rapidement, puis reprise par
                Service-Public.gouv.fr et par les autres services qui utilisent ces données.
              </li>
            </ul>
            <p>
              💡 En pratique : si vous constatez une erreur, corrigez-la depuis votre Espace Commune
              plutôt que d&rsquo;attendre, c&rsquo;est le moyen le plus rapide de la faire
              disparaître partout.
            </p>
          </>
        ),
      },
      {
        question: (
          <>
            Quand la liste du conseil municipal et les actes administratifs vont-ils apparaître sur
            service-public.gouv.fr ?
          </>
        ),
        answer: (
          <>
            <p>
              <strong>
                La liste du conseil municipal est déjà affichée sur votre page de l&rsquo;Annuaire
                des Collectivités
              </strong>
              , et vous pouvez la corriger vous-même depuis l&rsquo;Espace Commune (onglet
              «&nbsp;Conseil municipal&nbsp;»).
            </p>
            <p>
              Son affichage sur Service-Public.gouv.fr est en cours de préparation avec
              l&rsquo;équipe de service-public.gouv.fr, elle est{" "}
              <strong>attendue d&rsquo;ici fin 2026</strong>. Les actes administratifs suivront la
              même trajectoire.
            </p>
            <p>
              En attendant, tout ce que vous saisissez dans l&rsquo;Annuaire est conservé et sera
              repris automatiquement le jour venu :{" "}
              <strong>il n&rsquo;y a pas de ressaisie à prévoir de votre côté.</strong>
            </p>
          </>
        ),
      },
      {
        question: <>Comment se connecter avec ProConnect ?</>,
        answer: (
          <>
            <p>
              ProConnect est le service de l&rsquo;État qui vous permet de vous connecter avec{" "}
              <strong>une seule identité professionnelle</strong> à plusieurs services publics
              numériques. Vous n&rsquo;avez donc pas de mot de passe spécifique à créer pour
              l&rsquo;Annuaire.
            </p>
            <ol>
              <li>
                Rendez-vous sur votre page commune (recherchez le nom de votre commune sur{" "}
                <Link href={ANNUAIRE_URL} target="_blank" rel="noopener noreferrer">
                  collectivite.fr
                </Link>
                ).
              </li>
              <li>
                Cliquez sur <strong>«&nbsp;Espace Commune&nbsp;»</strong>, en haut à droite.
              </li>
              <li>
                Vous êtes redirigé vers la page de connexion <strong>ProConnect</strong> : saisissez
                votre adresse email professionnelle.
              </li>
              <li>
                Si vous avez déjà un compte, connectez-vous. Sinon, laissez-vous guider pour le
                créer, cela prend quelques minutes.
              </li>
              <li>
                Une fois connecté, vous arrivez sur votre Espace Commune et pouvez modifier vos
                informations.
              </li>
            </ol>
          </>
        ),
      },
      {
        question: (
          <>
            Comment accéder et afficher mes données publiques via l&rsquo;API de collectivite.fr ?
          </>
        ),
        answer: (
          <>
            <p>
              Toutes les informations affichées sur votre page proviennent de{" "}
              <strong>données publiques ouvertes</strong>, librement réutilisables. Concrètement,
              cela signifie que votre site internet communal, une application ou un prestataire
              peuvent récupérer et afficher automatiquement ces informations, sans double saisie.
            </p>
            <p>
              Cette partie s&rsquo;adresse surtout à une personne technique (votre prestataire web,
              votre service informatique ou votre OPSN). Le principe à retenir côté mairie est
              simple :{" "}
              <strong>
                vous mettez à jour une seule fois dans l&rsquo;Espace Commune, et
                l&rsquo;information est disponible partout.
              </strong>
            </p>
            <p>
              Si vous souhaitez en savoir plus, contactez l&rsquo;équipe support de la Suite
              territoriale sur ce sujet : nous vous répondrons au cas par cas.
            </p>
          </>
        ),
      },
    ],
  },
};

export default annuaire;
