import {
  Bell,
  Calendar,
  CalendarCheck,
  CalendarXMark,
  Chain,
  Chart,
  CsvExport,
  Link as LinkIcon,
  Settings,
} from "@/components/icons/uikit";
import Link from "next/link";
import { type ServicePage } from "./types";

const DEMO_URL = "https://rdv.anct.gouv.fr/onboarding/step_2";
const ALL_FEATURES_URL =
  "https://projets.suite.anct.gouv.fr/boards/1785606084149380144?labels=1785610033128539208";
const API_DOC_URL = "https://www.rdv-solidarites.fr/api-docs/index.html";
// The deployment map, filtered on RDV Service Public.
const DEPLOYMENT_MAP_URL = "/cartographie-deploiement?service_ids=49";
// The help centre, filtered on RDV Service Public.
const HELP_CENTRE_URL = "https://aide.suite.anct.gouv.fr/socle/rdv-service-public";

const rendezVous: ServicePage = {
  slug: "rendez-vous",
  navLabel: "Rendez-vous",
  // Matches the service_ids filter of DEPLOYMENT_MAP_URL above.
  deploymentServiceId: 49,
  repositoryUrl: "https://github.com/betagouv/rdv-service-public",
  seo: {
    title: "RDV Service Public, facilitez la prise de rendez-vous",
    description:
      "Ouvrez la prise de rendez-vous en ligne pour les cartes nationales d’identité et les passeports, avec rappels automatiques par SMS et courriel et suivi de votre activité.",
  },

  hero: {
    name: "RDV Service Public",
    logo: {
      src: "/images/services-logos/rdv.png",
      width: 710,
      height: 160,
    },
    tagline: <>Facilitez la gestion et la prise de rendez-vous</>,
    description: (
      <>
        Gagnez du temps et facilitez la prise de rendez-vous pour toutes les démarches liées aux
        cartes nationales d&rsquo;identité et aux passeports.
      </>
    ),
    eligibilitySearch: true,
    illustration: {
      src: "/images/services-illlu/rdv-hero.webp",
      alt: "",
      width: 740,
      height: 740,
    },
    screenshot: {
      src: "/images/services-illlu/rdv-top.webp",
      alt: "L’agenda de RDV Service Public, avec les créneaux ouverts à la réservation",
      width: 1920,
      height: 1110,
    },
  },

  features: {
    rows: [
      {
        title: <>Pensé pour les démarches CNI</>,
        description: (
          <>
            Permettez à vos usagers de planifier des rendez-vous CNI en autonomie via un lien dédié
            à votre administration.
          </>
        ),
        highlights: [
          { icon: LinkIcon, label: <>Lien URL partageable ou accessible sur le site internet</> },
          { icon: Settings, label: <>Configurer les créneaux, les lieux et les motifs</> },
          { icon: Calendar, label: <>Synchronisation avec votre agenda</> },
        ],
        link: { text: "S’inscrire à une démo", href: DEMO_URL },
        screenshot: {
          src: "/images/services-illlu/rdv-features-1.webp",
          alt: "",
          width: 1206,
          height: 828,
        },
      },
      {
        title: <>Organisé pour la ponctualité</>,
        description: (
          <>
            Fini les rendez-vous non honorés : des notifications SMS et emails sont envoyées
            automatiquement aux usagers.
          </>
        ),
        highlights: [
          { icon: Bell, label: <>Rappel par SMS et/ou par courriel</> },
          { icon: CalendarCheck, label: <>Notification de confirmation</> },
          { icon: CalendarXMark, label: <>Notification de modification ou annulation</> },
        ],
        screenshot: {
          src: "/images/services-illlu/rdv-features-2.webp",
          alt: "",
          width: 1206,
          height: 828,
        },
      },
      {
        title: <>Adapté pour le suivi de près</>,
        description: (
          <>
            Visualiser ou exporter les données de votre administration pour générer vos
            comptes-rendus.
          </>
        ),
        highlights: [
          { icon: Chart, label: <>Statistiques d&rsquo;activité</> },
          { icon: CsvExport, label: <>Export CSV</> },
          { icon: Chain, label: <>Possibilité d&rsquo;intégrer le service via une API</> },
        ],
        link: { text: "Voir toutes les fonctionnalités", href: ALL_FEATURES_URL },
        screenshot: {
          src: "/images/services-illlu/rdv-features-3.webp",
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
            RDV Service Public est très simple à utiliser. Le rappel de SMS est un plus qui est
            apprécié par les usagers. De manière générale, on est très satisfaites du logiciel.
          </>
        ),
        author: <>Commune de Chomérac (07)</>,
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
        question: <>Quelles collectivités peuvent accéder à Rendez-vous service public ?</>,
        answer: (
          <p>
            Rendez-vous service public est accessible aux communes de moins de 3 500 habitants et
            aux intercommunalités de moins de 15 000 habitants. Au-delà de ces seuils, la
            collectivité peut auto-héberger le service sur sa propre infrastructure.
          </p>
        ),
      },
      {
        question: (
          <>
            Pour quels cas d&rsquo;usage est-il possible d&rsquo;utiliser Rendez-vous service public
            ?
          </>
        ),
        answer: (
          <>
            <p>
              Pour les collectivités éligibles (communes de moins de 3 500 habitants,
              intercommunalités de moins de 15 000 habitants), le service est dédié exclusivement
              aux démarches liées aux cartes nationales d&rsquo;identité et aux passeports.
            </p>
            <p>
              Les collectivités qui auto-hébergent Rendez-vous service public peuvent
              l&rsquo;utiliser, en revanche, pour l&rsquo;ensemble de leurs besoins de prise de
              rendez-vous, internes comme externes.
            </p>
          </>
        ),
      },
      {
        question: <>Comment les usagers prennent-ils un rendez-vous ?</>,
        answer: (
          <>
            <p>
              Les usagers peuvent prendre rendez-vous en ligne si cette option est activée et que
              vous avez partagé votre lien de réservation. Ce lien peut être diffusé sur votre site
              web ou tout autre support de communication.
            </p>
            <p>Une fois sur la plateforme, ils peuvent :</p>
            <ul>
              <li>choisir un service et un motif de rendez-vous ;</li>
              <li>sélectionner un créneau disponible ;</li>
              <li>s&rsquo;identifier pour confirmer leur rendez-vous.</li>
            </ul>
            <p>Deux options d&rsquo;identification sont proposées :</p>
            <ol>
              <li>
                <strong>FranceConnect</strong> : les informations de contact sont récupérées
                automatiquement — c&rsquo;est le parcours le plus rapide et le plus sécurisé.
              </li>
              <li>
                <strong>Création de compte</strong> : si l&rsquo;usager ne passe pas par
                FranceConnect, il renseigne son nom, prénom, email et, en option, son numéro de
                téléphone. Un email de vérification lui est alors envoyé ; en cliquant sur le lien
                qu&rsquo;il contient, il est redirigé vers son parcours pour finaliser son
                rendez-vous.
              </li>
            </ol>
          </>
        ),
      },
      {
        question: <>À quel moment les notifications sont-elles envoyées aux usagers ?</>,
        answer: (
          <>
            <p>Trois types de notifications sont envoyées automatiquement aux usagers :</p>
            <ul>
              <li>
                <strong>Confirmation</strong> : immédiatement après la création du rendez-vous ;
              </li>
              <li>
                <strong>Rappel</strong> : 48h avant le rendez-vous (hors jours fériés et dimanches)
                ;
              </li>
              <li>
                <strong>Modification ou annulation</strong> : immédiatement en cas de changement
                apporté au rendez-vous.
              </li>
            </ul>
          </>
        ),
      },
      {
        question: <>Peut-on ajouter des instructions dans les notifications des usagers ?</>,
        answer: (
          <p>
            Oui. Vous pouvez ajouter des instructions personnalisées dans les courriels de
            notification envoyés aux usagers, et les adapter selon le motif (par exemple : documents
            à apporter, consignes d&rsquo;accès au lieu de rendez-vous).
          </p>
        ),
      },
      {
        question: <>Comment intégrer l&rsquo;API de Rendez-vous service public ?</>,
        answer: (
          <>
            <p>
              Notre API, puissante et flexible, permet d&rsquo;intégrer facilement la brique de
              rendez-vous dans vos applications, avec un accès à un flux de données en temps réel
              pour une expérience enrichie et personnalisée. Elle est enrichie régulièrement selon
              les besoins de nos utilisateurs, et un développement spécifique à votre cas
              d&rsquo;usage peut être envisagé dans le cadre d&rsquo;un partenariat entre nos
              équipes.
            </p>
            <p>
              <Link href={API_DOC_URL} target="_blank" rel="noopener noreferrer">
                Consulter la documentation technique
              </Link>
            </p>
          </>
        ),
      },
    ],
  },
};

export default rendezVous;
