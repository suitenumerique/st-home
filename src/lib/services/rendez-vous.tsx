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
        Gagnez du temps et facilitez la prise de rendez-vous pour toutes vos démarches liées à vos
        compétences régaliennes : passeport, état civil…
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
        title: <>Pensé pour vos démarches</>,
        description: (
          <>
            Permettez à vos usagers de planifier des rendez-vous en toute autonomie via un lien
            dédié à votre administration.
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
        question: <>Quelles collectivités peuvent utiliser RDV Service Public ?</>,
        answer: (
          <p>
            Rendez-vous Service Public est historiquement créé, financé et utilisé par les
            départements français. Dans le cadre de la Suite territoriale, le service est également
            proposé aux communes de moins de 3&nbsp;500 habitants et aux intercommunalités de moins
            de 15&nbsp;000 habitants dans le cadre de leurs missions régaliennes, par l&rsquo;ANCT
            ou une structure de mutualisation partenaire.
          </p>
        ),
      },
      {
        question: <>Quelle est la différence avec RDV Solidarités ou RDV Insertion ?</>,
        answer: (
          <p>
            Ces trois services reposent sur une même solution logicielle libre développée par
            l&rsquo;État et les départements, mais s&rsquo;adressent à des besoins distincts. RDV
            Solidarités et RDV Insertion couvrent les rendez-vous des services sociaux
            départementaux et les parcours d&rsquo;insertion. RDV Service Public est dédié aux
            démarches administratives des collectivités.
          </p>
        ),
      },
      {
        question: <>Pour quelles démarches le service peut-il être utilisé ?</>,
        answer: (
          <p>
            Pour les collectivités outillées par l&rsquo;ANCT ou par une structure de mutualisation
            partenaire, le service est dédié exclusivement aux démarches liées à la délivrance des
            cartes nationales d&rsquo;identité et des passeports. Les collectivités ou structures de
            mutualisation qui autohébergent peuvent en revanche l&rsquo;utiliser pour
            l&rsquo;ensemble de leurs besoins de prise de rendez-vous.
          </p>
        ),
      },
      {
        question: <>Comment les usagers prennent-ils rendez-vous ?</>,
        answer: (
          <p>
            La collectivité diffuse un lien de réservation, sur son site internet ou sur tout autre
            support de communication. L&rsquo;usager choisit un service et un motif, sélectionne un
            créneau disponible, puis confirme son rendez-vous après identification : par
            FranceConnect, qui récupère automatiquement ses coordonnées, ou par la création
            d&rsquo;un compte validée par courriel.
          </p>
        ),
      },
      {
        question: (
          <>Quand et comment sont envoyées les notifications de rappel d&rsquo;un rendez-vous ?</>
        ),
        answer: (
          <p>
            Les notifications sont envoyées automatiquement par SMS et par courriel : confirmation
            immédiate à la création du rendez-vous, rappel 48&nbsp;heures avant celui-ci (hors
            dimanches et jours fériés) et information immédiate en cas de modification ou
            d&rsquo;annulation. Des instructions personnalisées peuvent être ajoutées selon le
            motif, par exemple la liste des documents à apporter.
          </p>
        ),
      },
      {
        question: <>Comment intégrer l&rsquo;API de RDV Service Public ?</>,
        answer: (
          <p>
            Une API permet d&rsquo;intégrer la brique de prise de rendez-vous dans les applications
            de la collectivité et d&rsquo;accéder aux données en temps réel. Elle est enrichie
            régulièrement selon les besoins des utilisateurs, et un développement adapté à un cas
            d&rsquo;usage particulier peut être envisagé dans le cadre d&rsquo;un partenariat. La
            documentation technique est{" "}
            <Link href={API_DOC_URL} target="_blank" rel="noopener noreferrer">
              disponible en ligne
            </Link>
            .
          </p>
        ),
      },
    ],
  },
};

export default rendezVous;
