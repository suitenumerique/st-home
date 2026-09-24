import Link from "next/link";
import { type ServicePage } from "./types";

const PROCONNECT_HELP_URL = "https://www.proconnect.gouv.fr/aide";
const REFERENTIEL_URL = "/conformite/referentiel";
const ANNUAIRE_ENTREPRISES_URL = "https://annuaire-entreprises.data.gouv.fr/";
const ANNUAIRE_ADMINISTRATION_URL = "https://lannuaire.service-public.gouv.fr/";
const SERVICE_PUBLIC_URL = "https://service-public.gouv.fr";
const NOMENCLATURE_URL = "https://aide.suite.anct.gouv.fr/socle/domaines/creer-mon-nom-de-domaine";
const PLACEHOLDER_SUMMARY = (
  <>Prominenti ob Amano velut disparantur a vectigales duae Amano mixtae in</>
);

const TERRITOIRES_URL = "/territoires";
const CONFORMITY_MAP_URL = "/conformite/cartographie";
const PARTNER_SPACE_URL = "https://partenaires.proconnect.gouv.fr/";
const WHOIS_URL =
  "https://www.afnic.fr/noms-de-domaine/tout-savoir/whois-trouver-un-nom-de-domaine/";
const DOMAINES_URL = "/services/domaines";
const MESSAGES_URL = "/services/messages";
const HELP_CENTRE_URL = "https://aide.suite.anct.gouv.fr/socle/proconnect";
const ACCOUNT_CREATION_HELP_URL =
  "https://proconnect.crisp.help/fr/article/comment-creer-un-compte-sur-proconnect-q4h0ci/#3-vous-faites-partie-dune-administration-ou-structure-partenaire";
const ACCOUNT_ELIGIBILITY_HELP_URL =
  "https://proconnect.crisp.help/fr/article/qui-peut-se-creer-un-compte-proconnect-1eyk8et/";
const CONFIRMATION_CODE_HELP_URL =
  "https://proconnect.crisp.help/fr/article/comment-regler-les-problematiques-liees-au-code-de-confirmation-a-10-chiffres-jyepuz/";
const RECOMMENDATIONS_URL = "https://www.proconnect.gouv.fr/recommandation-test";
const CONFIRMATION_SENDER_EMAIL = "nepasrepondre@email.moncomptepro.beta.gouv.fr";
const CONFIRMATION_SENDER_IP = "172.246.41.163";

const proconnect: ServicePage = {
  slug: "proconnect",
  navLabel: "ProConnect",
  proConnect: false,
  foundations: false,
  trialHeading: { lead: "ProConnecté ?", action: "Cliquez !" },
  trialCta: { text: "Découvrir mes services", href: TERRITOIRES_URL },
  seo: {
    title: "ProConnect, l’identité numérique des agents publics et des élus",
    description:
      "Accédez aux services de la Suite territoriale et aux démarches de l’État avec une seule adresse de messagerie professionnelle, sans nouveau mot de passe.",
  },

  hero: {
    name: "ProConnect",
    logo: {
      src: "/images/services-logos/proconnect.svg",
      width: 168,
      height: 40,
    },
    tagline: <>Identifiez-vous aux services en toute sécurité</>,
    description: (
      <>
        Accédez à tous vos services publics ou privés qui utilisent ProConnect, avec un seul
        identifiant et mot de passe.
      </>
    ),
    illustration: {
      src: "/images/services-illlu/proconnect-hero.png",
      alt: "",
      width: 1520,
      height: 1472,
    },
  },

  showcase: {
    title: <>Un accès unique pour tous vos services</>,
    description: (
      <>
        Connectez-vous une fois et accédez toute la journée à vos services qu&rsquo;ils soient
        opérés par l&rsquo;État ou les entités publiques et privées.
      </>
    ),
    illustration: {
      src: "/images/services-illlu/proconnect-access.png",
      alt: "",
      width: 4732,
      height: 584,
    },
  },

  cases: {
    title: <>Quel identifiant utiliser pour me connecter&nbsp;?</>,
    description: (
      <>
        ProConnect s&rsquo;appuie sur{" "}
        <Link href={ANNUAIRE_ENTREPRISES_URL} target="_blank" rel="noopener noreferrer">
          l&rsquo;Annuaire des entreprises
        </Link>{" "}
        pour vérifier le SIRET de l&rsquo;organisation et sur{" "}
        <Link href={ANNUAIRE_ADMINISTRATION_URL} target="_blank" rel="noopener noreferrer">
          l&rsquo;Annuaire de l&rsquo;administration
        </Link>{" "}
        pour s&rsquo;assurer de la concordance entre votre adresse de messagerie professionnelle et
        le nom de domaine (@domaine.fr) de l&rsquo;organisation.
      </>
    ),
    columns: [
      [
        {
          title: (
            <>
              Ma collectivité a un nom de domaine et des adresses courriel nominatives officielles
            </>
          ),
          description: (
            <>
              Pour vous connecter ou créer un compte, utilisez votre adresse de messagerie, dont le
              domaine est identique à celui indiqué dans l&rsquo;Annuaire de l&rsquo;administration
              sur{" "}
              <Link href={SERVICE_PUBLIC_URL} target="_blank" rel="noopener noreferrer">
                service-public.gouv.fr
              </Link>
              .
            </>
          ),
          cta: { text: "Découvrir mes services", href: TERRITOIRES_URL, priority: "secondary" },
        },
        {
          title: (
            <>
              Ma collectivité n&rsquo;a pas d&rsquo;adresses courriel nominatives professionnelles
            </>
          ),
          description: (
            <>
              Vous avez un nom de domaine conforme, mais vous n&rsquo;avez pas d&rsquo;adresses
              nominatives associées à ce nom de domaine. Créez dès maintenant les comptes de
              messagerie pour tous les membres de votre collectivité grâce à l&rsquo;outil de votre
              choix ou Messages de la Suite territoriale.
            </>
          ),
          cta: { text: "Commencer avec Messages", href: MESSAGES_URL },
        },
      ],
      [
        {
          title: <>Ma collectivité n&rsquo;a pas de nom de domaine officiel</>,
          steps: [
            {
              title: <>Obtenez votre nom de domaine</>,
              description: (
                <>
                  Réservez un nom de domaine avec la{" "}
                  <Link href={NOMENCLATURE_URL} target="_blank" rel="noopener noreferrer">
                    nomenclature adéquate
                  </Link>{" "}
                  auprès d&rsquo;un bureau d&rsquo;enregistrement agréé.
                </>
              ),
            },
            {
              title: <>Renseignez-le sur l&rsquo;Annuaire de l&rsquo;administration</>,
              description: (
                <>
                  Déclarez votre nouveau nom de domaine sur{" "}
                  <Link
                    href={ANNUAIRE_ADMINISTRATION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    l&rsquo;Annuaire de l&rsquo;administration
                  </Link>{" "}
                  de service-public.gouv.fr.
                </>
              ),
            },
            {
              title: <>Créez vos adresses de messagerie</>,
              description: (
                <>
                  Créez les adresses de messagerie pour tous les membres de votre collectivité avec
                  l&rsquo;outil de votre choix ou <Link href={MESSAGES_URL}>Messages</Link>.
                </>
              ),
            },
          ],
          cta: { text: "Obtenir un nom de domaine", href: DOMAINES_URL },
        },
      ],
    ],
  },

  partners: {
    tinted: true,
    title: <>Toujours plus de partenaires</>,
    description: (
      <>
        Devenez partenaire et intégrez ProConnect à votre service pour simplifier
        l&rsquo;identification des professionnels du public et du privé.
      </>
    ),
    link: { text: "Accéder à l’espace partenaire", href: PARTNER_SPACE_URL },
    logosAlign: "right",
    logos: [
      { src: "/images/logo-anct-small.png", alt: "ANCT", width: 58, height: 70, displayHeight: 60 },
      { src: "/images/logo-anssi.png", alt: "ANSSI", width: 70, height: 70, displayHeight: 60 },
      { src: "/images/logo-ign.png", alt: "IGN", width: 116, height: 56, displayHeight: 56 },
      {
        src: "/images/logo-gendarmerie.png",
        alt: "Gendarmerie nationale",
        width: 155,
        height: 32,
        displayHeight: 32,
      },
      { src: "/images/logo-pix.png", alt: "Pix", width: 96, height: 80, displayHeight: 80 },
    ],
  },

  criteria: {
    title: <>Protégez vos activités en ligne</>,
    description: (
      <>
        Pour sécuriser les usages numériques de votre collectivité et vous protéger de
        l&rsquo;usurpation, créez un compte ProConnect en suivant les recommandations du{" "}
        <Link href={REFERENTIEL_URL}>Référentiel de la Présence numérique des territoires</Link>.
      </>
    ),
    criteria: [
      {
        title: <>Un nom de domaine avec une nomenclature adaptée</>,
        description: (
          <>
            Privilégiez l&rsquo;appellation <i>nomdevotrecommune.fr</i> ou une extension régionale.
            Retrouvez toutes les informations sur les nomenclatures appropriées pour votre
            collectivité dans{" "}
            <Link href={NOMENCLATURE_URL} target="_blank" rel="noopener noreferrer">
              cet article
            </Link>
            .
          </>
        ),
        illustration: {
          src: "/images/services-illlu/proconnect-activites-1.png",
          alt: "",
          width: 1334,
          height: 475,
        },
      },
      {
        title: <>Un nom de domaine qui appartient à la collectivité</>,
        description: (
          <>
            Utilisez un nom de domaine personnalisé (et non générique). La collectivité doit être la
            propriétaire exclusive de ce nom de domaine. Vérifiez sur{" "}
            <Link href={WHOIS_URL} target="_blank" rel="noopener noreferrer">
              WHOIS de l&rsquo;Afnic
            </Link>
            .
          </>
        ),
        illustration: {
          src: "/images/services-illlu/proconnect-activities-2.png",
          alt: "",
          width: 1331,
          height: 476,
        },
      },
      {
        title: (
          <>Des adresses courriel nominatives avec le nom de domaine officiel de la collectivité</>
        ),
        description: (
          <>
            Chaque membre de la collectivité doit posséder sa propre adresse de messagerie. Cela
            permet d&rsquo;éviter de diffuser le mot de passe d&rsquo;une unique boite partagée.
          </>
        ),
        illustration: {
          src: "/images/services-illlu/proconnect-activities-3.png",
          alt: "",
          width: 1328,
          height: 484,
        },
      },
    ],
    link: { text: "Consulter la conformité de ma commune", href: CONFORMITY_MAP_URL },
  },

  help: {
    title: <>Un problème technique&nbsp;?</>,
    description: (
      <>
        Voici les articles les plus consultés pas nos utilisateurs. Retrouvez toute la documentation
        dans notre{" "}
        <Link href={PROCONNECT_HELP_URL} target="_blank" rel="noopener noreferrer">
          centre d&rsquo;aide
        </Link>
        .
      </>
    ),
    articles: [
      { title: <>Créer un compte</>, description: PLACEHOLDER_SUMMARY, href: PROCONNECT_HELP_URL },
      {
        title: <>Se rattacher à une autre organisation</>,
        description: PLACEHOLDER_SUMMARY,
        href: PROCONNECT_HELP_URL,
      },
      {
        title: <>Faire une nouvelle demande de code</>,
        description: PLACEHOLDER_SUMMARY,
        href: PROCONNECT_HELP_URL,
      },
      {
        title: <>Gestion des cookies</>,
        description: PLACEHOLDER_SUMMARY,
        href: PROCONNECT_HELP_URL,
      },
      {
        title: <>Modifier son adresse e-mail</>,
        description: PLACEHOLDER_SUMMARY,
        href: PROCONNECT_HELP_URL,
      },
      {
        title: <>Identité non reconnue</>,
        description: (
          <>Votre adresse de messagerie n&rsquo;est pas reconnue pour créer un compte ProConnect</>
        ),
        href: PROCONNECT_HELP_URL,
      },
      {
        title: <>Service indisponible</>,
        description: PLACEHOLDER_SUMMARY,
        href: PROCONNECT_HELP_URL,
      },
      {
        title: <>Problème avec le fournisseur d&rsquo;identité</>,
        description: PLACEHOLDER_SUMMARY,
        href: PROCONNECT_HELP_URL,
      },
      {
        title: <>Migrer mes données</>,
        description: (
          <>
            Vous avez déjà créé un compte ProConnect, mais devez changer d&rsquo;adresse de
            messagerie.
          </>
        ),
        href: PROCONNECT_HELP_URL,
      },
    ],
  },

  faq: {
    title: <>Questions fréquentes</>,
    description: (
      <>
        Pour en savoir plus, consultez le{" "}
        <Link href={HELP_CENTRE_URL} target="_blank" rel="noopener noreferrer">
          Centre d&rsquo;aide
        </Link>
        .
      </>
    ),
    items: [
      {
        question: <>Quelle adresse de messagerie dois-je utiliser pour me connecter ?</>,
        answer: (
          <p>
            Utilisez l&rsquo;adresse email renseignée sur la page mairie de l&rsquo;Annuaire de{" "}
            <Link href={SERVICE_PUBLIC_URL} target="_blank" rel="noopener noreferrer">
              service-public.gouv.fr
            </Link>
            , ou toute adresse comportant le même nom de domaine. Par exemple, si votre commune a
            déclaré contact@mairieexemple.fr, vous pouvez vous connecter avec cette adresse, ou avec
            une adresse nominative comme prenom.nom@mairieexemple.fr. C&rsquo;est cette
            correspondance de nom de domaine qui permet à ProConnect de vous rattacher
            automatiquement à votre organisation.
          </p>
        ),
      },
      {
        question: <>Comment se connecter avec ProConnect ?</>,
        answer: (
          <>
            <p>
              ProConnect est le service de l&rsquo;État qui vous permet de vous connecter avec une
              seule identité professionnelle à plusieurs services publics numériques. Vous
              n&rsquo;avez donc pas de mot de passe spécifique à créer pour chaque service — par
              exemple pour publier votre base adresse locale.
            </p>
            <ol>
              <li>
                Vous êtes redirigé vers la page de connexion ProConnect : saisissez votre adresse
                email professionnelle. Vous devez utiliser l&rsquo;adresse de messagerie renseignée
                sur la page mairie de l&rsquo;Annuaire de{" "}
                <Link href={SERVICE_PUBLIC_URL} target="_blank" rel="noopener noreferrer">
                  service-public.gouv.fr
                </Link>{" "}
                (par exemple : contact@mairieexemple.fr), ou une adresse comportant le même nom de
                domaine (prenom.nom@mairieexemple.fr).
              </li>
              <li>
                Si vous avez déjà un compte, connectez-vous ou créez un compte en quelques étapes
                simples :
                <ol>
                  <li>Confirmez votre adresse email à l&rsquo;aide du code de validation reçu</li>
                  <li>Choisissez un mot de passe</li>
                  <li>
                    Entrez le SIRET de votre organisation (disponible sur{" "}
                    <Link href={ANNUAIRE_ENTREPRISES_URL} target="_blank" rel="noopener noreferrer">
                      l&rsquo;Annuaire des Entreprises
                    </Link>
                    )
                  </li>
                  <li>Complétez vos informations personnelles</li>
                  <li>Votre compte est créé !</li>
                </ol>
              </li>
            </ol>
            <p>
              Pour plus de détails, consultez l&rsquo;article sur la{" "}
              <Link href={ACCOUNT_CREATION_HELP_URL} target="_blank" rel="noopener noreferrer">
                création d&rsquo;un compte
              </Link>{" "}
              et l&rsquo;article sur{" "}
              <Link href={ACCOUNT_ELIGIBILITY_HELP_URL} target="_blank" rel="noopener noreferrer">
                qui peut se créer un compte
              </Link>
              .
            </p>
          </>
        ),
      },
      {
        question: (
          <>
            Je n&rsquo;ai pas d&rsquo;adresse professionnelle avec le nom de domaine de ma commune,
            que faire ?
          </>
        ),
        answer: (
          <>
            <p>
              Vous devez d&rsquo;abord vous assurer que votre commune dispose d&rsquo;un nom de
              domaine conforme, puis créer une adresse professionnelle utilisant ce nom de domaine.
            </p>
            <p>
              Une fois votre adresse professionnelle créée, vous pourrez l&rsquo;utiliser pour vous
              connecter avec ProConnect. Si votre commune n&rsquo;a pas encore de nom de domaine
              conforme, <Link href={DOMAINES_URL}>réservez-en un</Link>.
            </p>
            <p>
              Si le nom de domaine existe déjà mais que vous n&rsquo;avez pas d&rsquo;adresse
              nominative, créez-en une avec <Link href={MESSAGES_URL}>Messages</Link>.
            </p>
          </>
        ),
      },
      {
        question: <>Comment rattacher mon compte à une autre organisation sur ProConnect ?</>,
        answer: (
          <>
            <p>
              Lors de la création de votre compte, ou plus tard depuis votre espace personnel
              (rubrique «&nbsp;Organisations&nbsp;»), saisissez le SIRET de votre collectivité —
              vous pouvez le retrouver sur{" "}
              <Link href={ANNUAIRE_ENTREPRISES_URL} target="_blank" rel="noopener noreferrer">
                l&rsquo;Annuaire des Entreprises
              </Link>
              .
            </p>
            <p>
              ProConnect vérifie ensuite automatiquement la légitimité de votre rattachement,
              notamment via la correspondance entre votre nom de domaine email et celui de
              l&rsquo;organisation. Dans certains cas, une vérification manuelle peut être
              nécessaire, avec validation d&rsquo;un autre agent déjà rattaché à votre collectivité
              sur ProConnect.
            </p>
          </>
        ),
      },
      {
        question: <>Quels services puis-je utiliser avec ProConnect ?</>,
        answer: (
          <p>
            Vos droits d&rsquo;accès dépendent de votre adresse email professionnelle et de
            l&rsquo;organisation à laquelle vous êtes rattaché. Indiquez votre employeur sur
            ProConnect pour{" "}
            <Link href={RECOMMENDATIONS_URL} target="_blank" rel="noopener noreferrer">
              découvrir une sélection de services faits pour vous
            </Link>
            .
          </p>
        ),
      },
      {
        question: <>Comment recevoir le code de confirmation ?</>,
        answer: (
          <>
            <p>
              Le code de confirmation est envoyé au bout de 30 minutes. En cas de difficulté, vous
              êtes peut-être dans l&rsquo;une de ces situations :
            </p>
            <ul>
              <li>
                Vous avez fait une erreur de saisie dans votre adresse mail : recréez un compte avec
                la bonne adresse
              </li>
              <li>Le code est arrivé dans vos courriers indésirables : vérifiez vos spams</li>
              <li>
                Votre organisation utilise une protection contre les spams (comme MailInBlack ou
                Altospam) : contactez votre fournisseur de mail pour qu&rsquo;il autorise les emails
                en provenance de{" "}
                <Link href={`mailto:${CONFIRMATION_SENDER_EMAIL}`}>
                  {CONFIRMATION_SENDER_EMAIL}
                </Link>{" "}
                (adresse IP&nbsp;: {CONFIRMATION_SENDER_IP}). Puis, demandez-lui de paramétrer le
                filtre anti-spam pour laisser passer nos emails.
              </li>
              <li>
                Votre code a expiré ou vous avez perdu l&rsquo;email qui contenait le code : vous
                pouvez vous reconnecter en cliquant sur «&nbsp;me renvoyer un code de
                confirmation&nbsp;» lorsqu&rsquo;il vous sera demandé de saisir le code (
                <Link href={CONFIRMATION_CODE_HELP_URL} target="_blank" rel="noopener noreferrer">
                  en savoir plus
                </Link>
                ).
              </li>
            </ul>
          </>
        ),
      },
    ],
  },
};

export default proconnect;
