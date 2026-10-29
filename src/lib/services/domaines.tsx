import Link from "next/link";
import { type ServicePage } from "./types";

const REFERENTIEL_URL = "/conformite/referentiel";
const PARTNERS_MAP_URL = "/cartographie-deploiement";
// The help centre, and the references the FAQ points at.
const HELP_CENTRE_URL = "https://aide.suite.anct.gouv.fr/socle";
const ANNUAIRE_SERVICE_PUBLIC_URL = "https://lannuaire.service-public.gouv.fr/";
const AFNIC_URL = "https://www.afnic.fr/";
const SOLIDNAMES_URL = "https://solidnames.fr/nom-de-domaine-souverain-pour-les-communes/";
// The Afnic list of registrars, behind the last step and the closing call to
// action.
const REGISTRARS_URL =
  "https://www.afnic.fr/noms-de-domaine/tout-savoir/annuaire-bureaux-enregistrement/";

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
  },

  offers: {
    id: OFFERS_ANCHOR,
    title: <>Obtenez votre nom de domaine</>,
    description: (
      <>
        L&rsquo;Association française pour le nommage Internet en coopération (Afnic), en charge des
        noms de domaine en France, a retenu trois bureaux d&rsquo;enregistrement indépendants à
        l&rsquo;issue d&rsquo;un appel à candidatures.
      </>
    ),
    priceTerms: <>HT pour 10&nbsp;ans*</>,
    offers: [
      {
        name: "Netim",
        logo: { src: "/images/logo-netim.png", width: 75, height: 75 },
        tagline: <>Pour les collectivités qui peuvent fonctionner de manière autonome.</>,
        price: <>70&nbsp;€</>,
        yearlyPrice: <>soit 7&nbsp;€ par an</>,
        included: [
          { label: <>Réservation du nom de domaine</> },
          ADMINISTRATIVE_STEPS,
          { label: <>Assistance courriel</> },
          { label: <>Outil de gestion en ligne</> },
        ],
        link: {
          text: "Accéder à l’offre Netim",
          href: "https://www.netim.com/fr/nom-domaine/collectivite",
        },
      },
      {
        name: "Numérian",
        logo: { src: "/images/logo-numerian.png", width: 65, height: 75 },
        tagline: <>Pour les collectivités qui souhaitent plus d&rsquo;accompagnement.</>,
        price: <>150&nbsp;€</>,
        yearlyPrice: <>soit 15&nbsp;€ par an</>,
        included: [
          { label: <>Réservation du nom de domaine</> },
          ADMINISTRATIVE_STEPS,
          { label: <>Assistance téléphone et courriel</> },
          { label: <>Outil de gestion en ligne</> },
          { label: <>Accompagnement et conseils</> },
        ],
        options: [{ label: <>Site internet clé en main, sur devis</> }],
        link: {
          text: "Accéder à l’offre Numérian",
          href: "https://numerian.fr/noms-de-domaine/",
        },
      },
      {
        name: "Solidnames",
        logo: { src: "/images/logo-solidnames.png", width: 59, height: 59 },
        tagline: <>Pour les collectivités qui souhaitent un accompagnement avec un expert dédié.</>,
        price: <>288&nbsp;€</>,
        yearlyPrice: <>soit 28,8&nbsp;€ par an</>,
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
          {
            label: (
              <>
                Site internet clé en main,{" "}
                <Link href={SOLIDNAMES_URL} target="_blank" rel="noopener noreferrer">
                  voir l&rsquo;offre
                </Link>
              </>
            ),
          },
          { label: <>Protection contre l&rsquo;usurpation du domaine</> },
        ],
        link: {
          text: "Accéder à l’offre Solidnames",
          href: SOLIDNAMES_URL,
        },
      },
    ],
    footnote: (
      <>
        *Chaque partenaire s&rsquo;engage sur les tarifs indiqués, ils concernent uniquement
        l&rsquo;extension .fr.
        <br />
        Pour obtenir une extension d&rsquo;outre-mer ou régionale, rapprochez-vous du bureau
        d&rsquo;enregistrement choisi pour obtenir un devis.
      </>
    ),
    link: {
      lead: <>La collectivité a la liberté de choisir un autre bureau d&rsquo;enregistrement.</>,
      text: "Voir la liste complète",
      href: REGISTRARS_URL,
    },
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
              Pensez à réserver aussi les noms de domaine proches de celui que vous utiliserez, par
              exemple avec d&rsquo;autres extensions. Cela évite qu&rsquo;un tiers s&rsquo;en serve
              pour se faire passer pour votre commune.
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
            Votre messagerie continue de fonctionner. Vos adresses actuelles restent utilisables
            pendant la transition, tant que vous conservez votre ancien nom de domaine. Vous créez
            ensuite vos nouvelles adresses sur le nouveau nom de domaine, avec votre outil de
            messagerie habituel ou avec Messages, la messagerie de La Suite territoriale. Le passage
            se fait progressivement, avec l&rsquo;équipe de La Suite territoriale ou ses partenaires
            locaux. Pensez à prévenir vos correspondants de votre nouvelle adresse.
          </p>
        ),
      },
    ],
  },
};

export default domaines;
