import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";
import Link from "next/link";
import { type ServicePage } from "./types";

const REFERENTIEL_URL = "/conformite/referentiel";
const CONFORMITY_MAP_URL = "/conformite/cartographie";
const PARTNERS_MAP_URL = "/cartographie-deploiement";
// The help centre, and the references the FAQ points at.
const HELP_CENTRE_URL = "https://aide.suite.anct.gouv.fr/socle";
const ANNUAIRE_SERVICE_PUBLIC_URL = "https://lannuaire.service-public.gouv.fr/";
const AFNIC_URL = "https://www.afnic.fr/";
// The Afnic list of registrars, behind the last step and the closing call to
// action.
const REGISTRARS_URL =
  "https://www.afnic.fr/noms-de-domaine/tout-savoir/annuaire-bureaux-enregistrement/";

// V1: the hero only. Features, verbatims and FAQ are still being written.
const OFFERS_ANCHOR = "bureaux-enregistrement";
const ADMINISTRATIVE_STEPS = {
  label: <>Démarches administratives</>,
  tooltip: <>Configuration du nom de domaine en coordination avec l&rsquo;Afnic</>,
};

const domaines: ServicePage = {
  slug: "domaines",
  navLabel: "Domaines",
  // The page opens on its own steps, without the two shared blocks.
  proConnect: false,
  foundations: false,
  trialHeading: { lead: "Concerné\u202f?", action: "Agissez\u202f!" },
  trialCta: { text: "Obtenir un nom de domaine", href: REGISTRARS_URL },
  seo: {
    title: "Domaines, dotez votre collectivité d’un nom de domaine conforme",
    description:
      "Réservez le nom de domaine institutionnel de votre collectivité pour garantir votre présence en ligne, votre reconnaissance officielle et des adresses de messagerie conformes.",
  },

  hero: {
    name: "Domaines",
    logo: {
      src: "/images/services-logos/domaines.svg",
      width: 604,
      height: 160,
    },
    tagline: <>Dotez votre collectivité d&rsquo;un nom de domaine conforme</>,
    description: (
      <>
        Réservez votre nom de domaine pour garantir votre présence en ligne et assurer votre
        reconnaissance officielle.
      </>
    ),
    illustration: {
      src: "/images/services-illlu/domaines-hero.webp",
      alt: "",
      width: 740,
      height: 740,
    },
  },

  prerequisites: {
    title: <>Sécurisez votre présence numérique</>,
    description: (
      <>
        Un nom de domaine est l&rsquo;adresse numérique de votre collectivité (<u>nomdemairie.fr</u>
        ). Il est indispensable pour identifier officiellement la mairie dans toutes ses
        communications en ligne&nbsp;: via son site internet et ses adresses de messagerie.
      </>
    ),
    illustrations: [
      {
        src: "/images/services-illlu/domaines-top-1.webp",
        alt: "Pour votre site internet",
        width: 2304,
        height: 1152,
      },
      {
        src: "/images/services-illlu/domaines-top-2.webp",
        alt: "Pour toutes vos adresses de messagerie",
        width: 2304,
        height: 1152,
      },
      {
        src: "/images/services-illlu/domaines-top-3.webp",
        alt: "Pour votre authentification ProConnect",
        width: 4800,
        height: 596,
        fullWidth: true,
      },
    ],
  },

  domainCheck: { offersHref: `#${OFFERS_ANCHOR}` },

  steps: {
    title: <>Choisissez un nom de domaine conforme</>,
    description: (
      <>
        Trouvez le nom de domaine adapté à votre collectivité et conforme aux critères de sécurité
        du <Link href={REFERENTIEL_URL}>Référentiel de la Présence numérique des territoires</Link>.
      </>
    ),
    steps: [
      {
        title: <>Choisir sa nomenclature</>,
        description: (
          <>Consultez le guide pour choisir la nomenclature adéquate pour votre collectivité.</>
        ),
        href: "https://aide.suite.anct.gouv.fr/socle/domaines/creer-mon-nom-de-domaine#bonnes-pratiques-de-nomenclature",
      },
      {
        title: <>Vérifier sa disponibilité</>,
        description: <>Assurez-vous que le nom de domaine sélectionné est encore disponible.</>,
        href: "https://www.afnic.fr/noms-de-domaine/tout-savoir/whois-trouver-un-nom-de-domaine/",
      },
      {
        title: <>Réserver son nom de domaine</>,
        description: <>Trouvez le bureau d&rsquo;enregistrement qui vous convient.</>,
        href: `#${OFFERS_ANCHOR}`,
      },
    ],
    link: { text: "Consulter la conformité de ma commune", href: CONFORMITY_MAP_URL },
  },

  offers: {
    id: OFFERS_ANCHOR,
    title: <>Obtenez votre nom de domaine</>,
    description: (
      <>
        L&rsquo;Afnic
        <Tooltip
          kind="click"
          title={
            <>
              L&rsquo;Association française pour le nommage Internet en coopération (Afnic) gère le
              registre des noms de domaine en France.
            </>
          }
        />{" "}
        a choisi trois bureaux d&rsquo;enregistrement indépendants à l&rsquo;issue d&rsquo;un appel
        à candidatures. Chaque partenaire s&rsquo;engage à proposer une offre pour le montant
        indiqué ci-dessous, elle s&rsquo;applique uniquement pour l&rsquo;extension .fr. Pour
        obtenir une extension régionale, consultez directement les offres existantes.
      </>
    ),
    offers: [
      {
        name: <>NETIM</>,
        tagline: <>Réservez, posez vos questions par courriel</>,
        price: <>70&nbsp;€ HT pour 10&nbsp;ans</>,
        yearlyPrice: <>soit 7&nbsp;€ par an</>,
        included: [
          { label: <>Réservation du nom de domaine</> },
          ADMINISTRATIVE_STEPS,
          { label: <>Assistance courriel</> },
          { label: <>Outil de gestion en ligne</> },
        ],
        link: {
          text: "Accéder à l’offre de NETIM",
          href: "https://www.netim.com/fr/nom-domaine/collectivite",
        },
      },
      {
        name: <>Numérian</>,
        tagline: <>Choisissez grâce à nos conseils, appelez si besoin</>,
        price: <>150&nbsp;€ HT pour 10&nbsp;ans</>,
        yearlyPrice: <>soit 15&nbsp;€ par an</>,
        included: [
          { label: <>Réservation du nom de domaine</> },
          ADMINISTRATIVE_STEPS,
          { label: <>Assistance téléphone et courriel</> },
          { label: <>Outil de gestion en ligne</> },
          { label: <>Accompagnement et conseils</> },
        ],
        options: [{ label: <>Site internet clé en main</> }],
        link: {
          text: "Accéder à l’offre de Numérian",
          href: "https://numerian.fr/noms-de-domaine/",
        },
      },
      {
        name: <>Solidnames</>,
        tagline: <>Profitez d&rsquo;un interlocuteur dédié et d&rsquo;un audit</>,
        price: <>288&nbsp;€ HT pour 10&nbsp;ans</>,
        yearlyPrice: <>soit 28,80&nbsp;€ par an</>,
        included: [
          { label: <>Réservation du nom de domaine</> },
          ADMINISTRATIVE_STEPS,
          { label: <>Assistance téléphone et courriel</> },
          { label: <>Interlocuteur dédié</> },
          { label: <>Extranet de gestion sécurisé</> },
          {
            label: <>Audit de votre nom de domaine</>,
            tooltip: (
              <>Un expert vous guide et examine tous les noms de domaine similaires au vôtre.</>
            ),
          },
        ],
        options: [
          { label: <>Site internet clé en main</> },
          { label: <>Protection contre l&rsquo;usurpation du domaine</> },
        ],
        link: {
          text: "Accéder à l’offre de Solidnames",
          href: "https://solidnames.fr/nom-de-domaine-souverain-pour-les-communes/",
        },
      },
    ],
    link: { text: "Annuaire des bureaux d’enregistrement", href: REGISTRARS_URL },
  },

  banner: {
    title: <>Être accompagné localement</>,
    description: (
      <>
        Votre commune est libre de choisir son bureau d&rsquo;enregistrement. Opérateurs publics de
        services numériques, centres de gestion, associations d&rsquo;élus, prestataires&hellip;
        Vous pouvez vous rapprocher de votre partenaire de proximité pour vous accompagner dans
        votre démarche.
      </>
    ),
    link: { text: "Voir la cartographie des partenaires", href: PARTNERS_MAP_URL },
    illustration: {
      src: "/images/services-illlu/domaines-banners.webp",
      alt: "",
      width: 600,
      height: 430,
    },
  },

  partners: {
    title: <>Vos partenaires nationaux</>,
    description: (
      <>
        Nous travaillons ensemble pour
        <br />
        améliorer votre quotidien.
      </>
    ),
    logos: [
      {
        src: "/images/logo-anct-small.png",
        alt: "ANCT",
        width: 58,
        height: 70,
        href: "https://anct.gouv.fr/",
      },
      {
        src: "/images/logo-amf.png",
        alt: "Association des maires de France",
        width: 131,
        height: 70,
        href: "https://www.amf.asso.fr/",
      },
      { src: "/images/logo-afnic.png", alt: "Afnic", width: 108, height: 70, href: AFNIC_URL },
      {
        src: "/images/logo-declic.png",
        alt: "Déclic",
        width: 214,
        height: 41,
        displayHeight: 40,
        href: "https://www.asso-declic.fr/",
      },
      {
        src: "/images/logo-anssi.png",
        alt: "ANSSI",
        width: 70,
        height: 70,
        href: "https://cyber.gouv.fr/",
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
        question: (
          <>Quelle est la différence entre un nom de domaine et une adresse de messagerie ?</>
        ),
        answer: (
          <>
            <p>
              Le nom de domaine est la partie qui identifie votre commune sur internet, par exemple{" "}
              <strong>mairie-exemple.fr</strong>. Il constitue la base commune à deux usages
              principaux :
            </p>
            <ul>
              <li>
                <strong>l&rsquo;adresse de votre site internet</strong> (https://mairie-exemple.fr)
                ;
              </li>
              <li>
                <strong>vos adresses email professionnelles</strong> (prenom.nom@mairie-exemple.fr).
              </li>
            </ul>
            <p>
              C&rsquo;est parce que ces deux usages partagent le même nom de domaine que vos
              administrés et partenaires peuvent identifier facilement une communication officielle
              de la commune.
            </p>
          </>
        ),
      },
      {
        question: (
          <>Ma commune n&rsquo;a pas besoin de site web, un nom de domaine est-il nécessaire ?</>
        ),
        answer: (
          <>
            <p>
              Oui. Le nom de domaine ne sert pas seulement à héberger un site, il conditionne vos
              adresses de messagerie professionnelles et votre authentification sur ProConnect. Il
              peut par ailleurs rediriger vers la page officielle de votre commune sur{" "}
              <Link href={ANNUAIRE_SERVICE_PUBLIC_URL} target="_blank" rel="noopener noreferrer">
                l&rsquo;Annuaire du service public
              </Link>
              , qui regroupe toutes les informations utiles à vos administrés.
            </p>
          </>
        ),
      },
      {
        question: <>Quel nom de domaine choisir pour ma commune ?</>,
        answer: (
          <>
            <p>
              La forme recommandée pour votre nom de domaine est <strong>nomdelacommune.fr</strong>.
              Si elle est indisponible, mairie-nomdelacommune.fr et ville-nomdelacommune.fr sont
              également réservés aux collectivités. En cas d&rsquo;homonymie, ajoutez simplement le
              numéro de votre département : nomdelacommune71.fr.
            </p>
            <p>
              Il est recommandé de réserver tous les noms de domaine proches de celui qui sera
              utilisé.
            </p>
          </>
        ),
      },
      {
        question: (
          <>
            Qu&rsquo;est-ce qu&rsquo;un nom de domaine conforme au Référentiel de la présence
            numérique des territoires (RPNT) ?
          </>
        ),
        answer: (
          <p>
            Un nom de domaine conforme au RPNT respecte la nomenclature recommandée et utilise une
            extension administrée par un organisme français : .fr, extensions régionales (ex. :
            .bzh) ou ultramarines (ex. : .yt). Ces extensions placent votre domaine sous protection
            juridique française et ouvrent un recours en cas d&rsquo;usurpation, contrairement au
            .com ou au .org par exemple.
          </p>
        ),
      },
      {
        question: <>Qu&rsquo;est-ce qu&rsquo;un bureau d&rsquo;enregistrement ?</>,
        answer: (
          <p>
            Un bureau d&rsquo;enregistrement (ou <em>registrar</em>) est une entreprise privée
            autorisée à vendre et gérer des noms de domaine. En France, ils sont accrédités par
            l&rsquo;Afnic,{" "}
            <Link href={AFNIC_URL} target="_blank" rel="noopener noreferrer">
              l&rsquo;Association française pour le nommage Internet en coopération
            </Link>
            .
          </p>
        ),
      },
      {
        question: <>Si je change de nom de domaine, quel impact sur ma messagerie ?</>,
        answer: (
          <p>
            Vos adresses actuelles continuent de fonctionner. Les nouvelles adresses avec votre nom
            de domaine (<em>mairie@nom-de-votre-commune.fr</em>) sont créées avec les services de la
            Suite territoriale, et le passage de l&rsquo;ancienne à la nouvelle se fait
            progressivement, avec l&rsquo;équipe de la Suite territoriale ou nos partenaires locaux.
          </p>
        ),
      },
    ],
  },
};

export default domaines;
