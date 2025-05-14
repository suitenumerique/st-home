import BackToTop from "@/components/BackToTop";
import FaqList from "@/components/FaqList";
import { fr } from "@codegouvfr/react-dsfr";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { NextSeo } from "next-seo";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

// Services data structure
const SERVICES_DATA = [
  {
    id: "suite-territoriale",
    name: "La Suite territoriale",
    title: <>La Suite territoriale, qu&rsquo;est-ce que c&rsquo;est ?</>,
    description: (
      <>
        Une plateforme sécurisée de services mutualisés. Elle s&rsquo;adresse aux communes de moins
        de 3&nbsp;500 habitants et aux EPCI de moins de 15&nbsp;000 habitants qui ne sont pas encore
        équipés. Elle est également accessible à toute collectivité adhérente d&rsquo;une structure
        de mutualisation partenaire.
      </>
    ),
    features: [
      <>Une identité numérique professionnelle ;</>,
      <>Un socle de services numériques essentiels ;</>,
      <>Un écosystème applicatif sécurisé.</>,
    ],
    faqs: [
      {
        question: <>Qui est le fournisseur et l&rsquo;opérateur de la Suite territoriale ?</>,
        answer: (
          <>
            La Suite territoriale est un service numérique proposé par l&rsquo;Agence nationale de
            la cohésion des territoires (ANCT) et l&rsquo;Agence nationale de la sécurité des
            systèmes d&rsquo;information (ANSSI). Elle est développée en partenariat avec la
            Direction interministérielle du numérique (DINUM). La Suite territoriale est donc un
            service public et ne poursuit aucun intérêt financier.
          </>
        ),
      },
      {
        question: <>Quel coût pour la collectivité ?</>,
        answer: (
          <>
            Le socle de services essentiels de la Suite territoriale est mis à disposition à titre
            gracieux aux communes de moins de 3&nbsp;500 habitants ou intercommunalités de moins de
            15&nbsp;000 habitants non adhérentes à une structure de mutualisation. Il
            s&rsquo;accompagne d&rsquo;un niveau d&rsquo;accompagnement et de support minimal de
            l&rsquo;ANCT.
            <br />
            <br />
            Si vous souhaitez bénéficier d&rsquo;outils et d&rsquo;un accompagnement plus complets,
            nous vous recommandons d&rsquo;accéder à la Suite territoriale par l&rsquo;intermédiaire
            d&rsquo;une structure de mutualisation partenaire (association d&rsquo;élus, OPSN,
            intercommunalité, etc). Le coût associé dépendra alors des tarifs fixés par cette
            structure.
          </>
        ),
      },
      {
        question: <>Quand la Suite territoriale sera-t-elle disponible ?</>,
        answer: (
          <>
            La Suite territoriale et les services qui la composent sont en cours de développement et
            de tests. La plateforme sera disponible et déployable à l&rsquo;échelle nationale le{" "}
            <strong>1er janvier 2026</strong>. L&rsquo;ANCT propose aux collectivités volontaires
            d&rsquo;être associées aux développements en participant au Groupe pilote. Pour le
            rejoindre, il suffit d&rsquo;effectuer un test d&rsquo;éligibilité pour votre
            collectivité depuis la page d&rsquo;accueil de la Suite territoriale puis de cliquer sur
            le bouton &quot;Rejoindre le Groupe pilote&quot;.
          </>
        ),
      },
      {
        question: (
          <>Je suis un éditeur/intégrateur privé, puis-je coopérer avec la Suite territoriale ?</>
        ),
        answer: (
          <>
            La Suite territoriale fournit aux petites collectivités un socle de services essentiels
            en l&rsquo;absence d&rsquo;une offre privée accessible. Faute d&rsquo;alternative, ces
            dernières se tournent vers des services « gratuits » mais non souverains et sécurisés.
            La coopération entre ce service public et votre offre privée est essentielle pour élever
            le niveau de sécurité des collectivités. Elle est permise notamment par{" "}
            <Link href="https://proconnect.anct.gouv.fr/" target="_blank">
              ProConnect
            </Link>{" "}
            qui est ouvert à tous les éditeurs privés.
          </>
        ),
      },
    ],
  },
  {
    id: "proconnect",
    name: "ProConnect",
    title: <>ProConnect, l&rsquo;identité numérique professionnelle</>,
    description: (
      <>
        Authentifiez-vous et accédez à tous les services de la Suite territoriale avec un
        identifiant et un mot de passe unique.
      </>
    ),
    features: [
      <>Authentifiez-vous avec un seul identifiant sécurisé ;</>,
      <>Accédez à tous les services numériques de votre quotidien ;</>,
      <>Réduisez les risques de fraude et d&rsquo;usurpation d&rsquo;identité ;</>,
      <>Centralisez la gestion des identités et des connexions.</>,
    ],
    image: "/images/screen-proconnect.png",
    faqs: [
      {
        question: <>Comment créer mon compte ProConnect ?</>,
        answer: (
          <>
            La création d&rsquo;un compte ProConnect nécessite simplement l&rsquo;utilisation
            d&rsquo;une adresse email professionnelle reliée au nom de domaine conforme de votre
            collectivité. Ce domaine permet de vous rediriger automatiquement vers le bon
            &quot;fournisseur d&rsquo;identité&quot;.
          </>
        ),
      },
      {
        question: (
          <>Par qui cette &quot;identité numérique professionnelle&quot; est-elle fournie ?</>
        ),
        answer: (
          <>
            ProConnect est une fédération d&rsquo;identités permettant aux services de l&rsquo;État,
            aux centres de gestion et aux structures de mutualisation partenaires de coopérer pour
            vous identifier formellement en tant qu&rsquo;agent(e) ou élu(e) de votre collectivité.
          </>
        ),
      },
      {
        question: <>Puis-je accéder aux services de la Suite territoriale sans ProConnect ?</>,
        answer: (
          <>
            Non, tous les services de la Suite territoriale sont accessibles uniquement via un
            compte ProConnect permettant d&rsquo;une identification formelle de chaque utilisateur.
          </>
        ),
      },
      {
        question: <>Je travaille pour plusieurs collectivités, comment suis-je identifié(e) ?</>,
        answer: (
          <>
            Dans la mesure où l&rsquo;authentification via ProConnect nécessite une adresse de
            messagerie professionnelle rattachée au nom de domaine conforme de la collectivité, vous
            pouvez créer un compte ProConnect pour chaque collectivité pour laquelle vous
            travaillez.
          </>
        ),
      },
    ],
  },
  {
    id: "collectivite-fr",
    name: "Collectivite.fr",
    title: <>Collectivite.fr, le nom de domaine institutionnel</>,
    description: (
      <>
        Dotez votre commune d&rsquo;un nom de domaine officiel, formellement identifiable par les
        services de l&rsquo;État et les citoyens.
      </>
    ),
    features: [
      <>Obtenez un nom de domaine conforme simplement ;</>,
      <>Utilisez-le pour votre adresse de messagerie électronique ;</>,
      <>Déployez un site internet identifiable pour votre commune ;</>,
      <>Accédez à tous les services de la Suite territoriale.</>,
    ],
    faqs: [
      {
        question: <>A quoi sert un nom de domaine pour ma commune ?</>,
        answer: (
          <>
            Un nom de domaine institutionnel permet d&rsquo;identifier formellement votre commune
            dans ses communications en ligne, par l&rsquo;intermédiaire d&rsquo;un site internet ou
            d&rsquo;une adresse de messagerie.
          </>
        ),
      },
      {
        question: <>Quels sont les noms de domaine fournis par la Suite territoriale ?</>,
        answer: (
          <>
            L&rsquo;ANCT met à disposition des sous-domaines standards respectant la nomenclature
            suivante : &lt;nomdemacommune.collectivite.fr&gt;. En cas d&rsquo;homonymie ils prennent
            la forme &lt;nomdemacommune+département.collectivite.fr&gt;
          </>
        ),
      },
      {
        question: <>Ma commune possède déjà un nom de domaine, puis-je le conserver ?</>,
        answer: (
          <>
            Bien sûr. Les noms de domaine fournis par l&rsquo;ANCT et la Suite territoriale
            constituent une solution minimale pour les 10 000 communes qui n&rsquo;en disposent pas.
            S&rsquo;il est conforme, votre nom de domaine actuel peut être utilisé pour accéder aux
            services de la Suite.
          </>
        ),
      },
      {
        question: <>Comment raccorder mon nom de domaine existant à la Suite territoriale ?</>,
        answer: (
          <>
            Une fois inscrits, nous vous proposerons depuis La Régie d&rsquo;ajouter des
            enregistrements DNS pour raccorder votre nom de domaine existant à la Suite
            territoriale. Cette opération peut être effectuée par toute personne ayant accès à la
            configuration technique de votre nom de domaine, comme le détaille l&rsquo;
            <Link href="https://collectivite.fr/faq" target="_blank">
              Annuaire des Collectivités
            </Link>
            . Dans tous les cas, vous en conservez la propriété et la gestion.
          </>
        ),
      },
      {
        question: <>Mon nom de domaine actuel n&rsquo;apparaît pas comme conforme, pourquoi ?</>,
        answer: (
          <>
            L&rsquo;ANCT établit trois critères de conformité concernant les noms de domaine des
            communes :
            <ul className={fr.cx("fr-list")}>
              <li>
                L&rsquo;extension du nom de domaine est un <strong>.fr</strong> ou une extension
                régionale (.bzh, .corsica, .alsace, .eu, .re, .yt...)
              </li>
              <li>Le nom de domaine comporte un certificat de sécurité</li>
              <li>La commune est propriétaire de son nom de domaine</li>
            </ul>
            Si l&rsquo;un de ces critères n&rsquo;est pas respecté, le nom de domaine n&rsquo;est
            pas conforme aux recommandations de l&rsquo;ANCT et de la Suite territoriale.
          </>
        ),
      },
    ],
  },
  {
    id: "messages",
    name: "Messages",
    title: <>Messages, les adresses mail professionnelles</>,
    description: (
      <>
        Envoyez ou recevez des emails et gérez votre calendrier professionnel dans un environnement
        sécurisé.
      </>
    ),
    features: [
      <>
        Accédez à tous vos emails depuis n&rsquo;importe quel navigateur web, sur ordinateur,
        tablette ou mobile ;
      </>,
      <>Organisez et partagez votre calendrier professionnel avec vos collègues ;</>,
      <>Gérez facilement l&rsquo;accès à une adresse email collaborative ;</>,
      <>Importez votre carnet d&rsquo;adresse et historique simplement.</>,
    ],
    faqs: [
      {
        question: <>Quelle est la capacité de stockage de ma boîte mail ?</>,
        answer: (
          <>
            La capacité de stockage des boîtes mail fournies par la Suite territoriale est adaptée
            aux besoins des agents et élus pour un usage strictement professionnel. Le quota maximum
            et la tarification précise dépendront de votre fournisseur (structure de mutualisation
            ou ANCT).
          </>
        ),
      },
      {
        question: <>Puis-je utiliser Messages avec mon nom de domaine actuel ?</>,
        answer: (
          <>
            Oui, l&rsquo;utilisation de Messages n&rsquo;est pas dépendante de la fourniture
            d&rsquo;un nom de domaine institutionnel par l&rsquo;ANCT et est possible avec tout nom
            de domaine conforme.
          </>
        ),
      },
      {
        question: (
          <>Puis-je utiliser Messages avec un autre client comme Thunderbird ou Outlook ?</>
        ),
        answer: (
          <>
            Non, comme tous les services de la Suite territoriale, Messages est accessible
            uniquement via ProConnect pour des raisons de sécurité et afin de dissocier les usages
            personnels et professionnels.
          </>
        ),
      },
      {
        question: (
          <>
            Est-il possible de créer une adresse de messagerie accessible par plusieurs utilisateurs
            ?
          </>
        ),
        answer: (
          <>
            Oui, si les adresses de messagerie sont strictement nominatives, il sera possible via la
            Régie de créer des &quot;alias&quot; (ex : bibliotheque@macommune.collectivite.fr)
            permettant la gestion collaborative d&rsquo;une boîte mail partagée.
          </>
        ),
      },
      {
        question: (
          <>Puis-je importer l&rsquo;historique et les données de ma messagerie actuelle ?</>
        ),
        answer: (
          <>
            Oui, l&rsquo;ANCT et votre structure de mutualisation peuvent vous accompagner dans la
            migration de vos historiques vers la messagerie de la Suite territoriale.
          </>
        ),
      },
    ],
  },
  {
    id: "fichiers",
    name: "Fichiers",
    title: <>Fichiers, l&rsquo;espace de stockage</>,
    description: (
      <>
        Stockez, organisez et partagez simplement tous vos fichiers (documents, images, feuilles de
        calcul...) dans un seul espace en ligne sécurisé.
      </>
    ),
    features: [
      <>Stockez vos fichiers numériques en ligne ;</>,
      <>Partagez vos dossiers avec vos collaborateurs ;</>,
      <>Importez vos documents simplement ;</>,
      <>Retrouvez rapidement tous vos documents.</>,
    ],
    image: "/images/screen-fichiers.png",
    faqs: [
      {
        question: <>A quelle capacité de stockage ai-je accès ?</>,
        answer: (
          <>
            Fichiers dispose d&rsquo;une capacité de stockage couvrant les besoins des
            professionnels de la sphère publique territoriale. Le quota maximum et la tarification
            précise dépendront de votre fournisseur (structure de mutualisation ou ANCT).
          </>
        ),
      },
      {
        question: <>Puis-je stocker les pièces-jointes que je reçois par mail ?</>,
        answer: (
          <>
            Tout à fait. Fichiers est dit &quot;intéropérable&quot; avec le service de messagerie
            proposé par la Suite territoriale. Les documents reçus par e-mail pourront donc par
            exemple être automatiquement stockés sur Fichiers.
          </>
        ),
      },
      {
        question: (
          <>
            Est-il possible de transférer les documents de mon espace de stockage actuel vers
            Fichiers ?
          </>
        ),
        answer: (
          <>
            Oui, si ces documents relèvent bien de votre activité professionnelle en tant
            qu&rsquo;agent public ou élu de collectivité. Votre structure de mutualisation pourra
            vous accompagner dans cette démarche.
          </>
        ),
      },
      {
        question: <>Où mes documents et ma donnée seront-ils hébergés ?</>,
        answer: (
          <>
            L&rsquo;hébergeur retenu pour le service &quot;Fichiers&quot; mis à disposition par
            l&rsquo;ANCT est 3DS Outscale, hébergeur français certifié SecNumCloud. Personne
            d&rsquo;autre que vous ou vos collaborateurs n&rsquo;ont néanmoins accès à ces
            documents.
          </>
        ),
      },
    ],
  },
  {
    id: "regie",
    name: "La Régie",
    title: <>La Régie, l&rsquo;interface d&rsquo;administration</>,
    description: (
      <>
        Gérez vos contacts, groupes de travail et droits d&rsquo;accès aux services depuis une
        interface d&rsquo;administration unique.
      </>
    ),
    features: [
      <>Créez votre compte utilisateur et ceux de vos collègues ;</>,
      <>Définissez les rôles et permissions de chaque utilisateur ;</>,
      <>Créez toutes les adresses de messagerie de votre équipe ;</>,
      <>Supervisez l&rsquo;utilisation des différents services de la Suite territoriale.</>,
    ],
    image: "/images/screen-regie.png",
    faqs: [
      {
        question: <>À qui s&rsquo;adresse cette interface d&rsquo;administration ?</>,
        answer: (
          <>
            La Régie s&rsquo;adresse à tous les utilisateurs de la Suite territoriale, quelle que
            soit leur organisation : commune ou structure de mutualisation de toute nature (OPSN,
            intercommunalité, département...).
          </>
        ),
      },
      {
        question: <>Comment ajouter, modifier ou supprimer un utilisateur ?</>,
        answer: (
          <>
            Différents niveaux d&rsquo;administration sont définis selon que la commune est couverte
            par un OPSN, une intercommunalité partenaire ou directement par l&rsquo;ANCT. La Régie
            permet l&rsquo;ajout, la modification ou la suppression d&rsquo;utilisateurs en fonction
            du niveau d&rsquo;administration défini.
          </>
        ),
      },
      {
        question: <>Puis-je créer et gérer des groupes d&rsquo;utilisateurs de ma commune ?</>,
        answer: (
          <>
            Oui, la Régie permet, pour chaque organisation, de créer des groupes
            d&rsquo;utilisateurs pour leur donner accès à des services ou des fonctionnalités
            spécifiques.
          </>
        ),
      },
      {
        question: (
          <>La Régie permet-elle de piloter uniquement les services Messages et Fichiers ?</>
        ),
        answer: (
          <>
            Non, la Régie permet de centraliser tous les services numériques utilisés au sein de la
            collectivité, si ces services sont raccordés à ProConnect en tant que fournisseur de
            service.
          </>
        ),
      },
    ],
  },
  {
    id: "ecosysteme",
    name: "Ecosystème applicatif",
    image: "/images/screen-ecosysteme.png",
    title: <>Ecosystème applicatif, les services mutualisés</>,
    description: (
      <>
        Accédez via ProConnect à un ensemble de services numériques proposés par l&rsquo;État, votre
        structure de mutualisation ou les éditeurs privés.
      </>
    ),
    features: [
      <>Les services numériques de l&rsquo;Incubateur des territoires ANCT ;</>,
      <>Les services numériques mis à disposition par l&rsquo;État ;</>,
      <>Les services numériques de votre opérateur de mutualisation ;</>,
      <>Les services numériques de votre prestataire privé ProConnecté.</>,
    ],
    faqs: [
      {
        question: <>Comment accéder à la liste complète des services disponibles ?</>,
        answer: (
          <>
            L&rsquo;intégralité des services raccordés à ProConnect en tant que fournisseurs de
            services sont répertoriés sur{" "}
            <Link href="https://www.proconnect.gouv.fr/services" target="_blank">
              l&rsquo;Annuaire des services de ProConnect
            </Link>
            . Ceux qui sont utilisables spécifiquement par les collectivités apparaissent dans la
            catégorie &quot;Suite territoriale&quot;.
          </>
        ),
      },
      {
        question: (
          <>Pourquoi tous ces services n&rsquo;apparaissent-ils pas dans mon espace Régie ?</>
        ),
        answer: (
          <>
            Tous les services numériques raccordés à ProConnect ne sont pas nécessairement
            disponibles pour votre collectivité. Les services disponibles varient en fonction de la
            taille de votre collectivité, de ses choix en matière d&rsquo;outillage numérique et de
            l&rsquo;offre de votre structure de mutualisation. Nous vous invitons à vous tourner
            vers votre administrateur.
          </>
        ),
      },
      {
        question: (
          <>Je suis éditeur/intégrateur privé, pourquoi raccorder mon service à ProConnect ?</>
        ),
        answer: (
          <>
            ProConnect fédère des identités numériques vérifiées pour les agents publics des
            territoires et les élus locaux. Il garantit des connexions sécurisées à votre service
            qui est par ailleurs mis en valeur dans l&rsquo;environnement de travail numérique des
            professionnels des territoires.
          </>
        ),
      },
      {
        question: (
          <>
            Je suis un éditeur/intégrateur privé, comment puis-je ajouter mon service au catalogue ?
          </>
        ),
        answer: (
          <>
            Tout éditeur ou intégrateur privé est invité à raccorder son service à ProConnect en
            suivant{" "}
            <Link
              href="https://github.com/numerique-gouv/proconnect-documentation/blob/main/doc_fs/README.md"
              target="_blank"
            >
              la documentation technique
            </Link>{" "}
            fournie par l&rsquo;État. Sous réserve de respect de certains critères fixés par la
            DINUM et l&rsquo;ANCT, votre service sera ainsi valorisé via son intégration à
            l&rsquo;écosystème applicatif.
          </>
        ),
      },
    ],
  },
];

export default function ServicesPage() {
  // Add smooth scrolling behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <>
      <NextSeo
        title="Services numériques"
        description="Les services numériques de la Suite territoriale"
      />
      <div className={fr.cx("fr-container", "fr-my-6w")}>
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
          {/* Sidebar */}
          <div className={fr.cx("fr-col-12", "fr-col-md-3")}>
            <SideMenu
              sticky
              align="left"
              burgerMenuButtonText="Services"
              items={SERVICES_DATA.map((service) => ({
                isActive: false,
                linkProps: {
                  href: `#${service.id}`,
                },
                text: service.name,
              }))}
            />
          </div>

          {/* Main Content */}
          <div className={fr.cx("fr-col-12", "fr-col-md-9")}>
            {SERVICES_DATA.map((service) => (
              <section key={service.id} id={service.id} className={fr.cx("fr-mb-8w")}>
                <h1>{service.title}</h1>
                <p className={fr.cx("fr-text--lead")}>{service.description}</p>

                <ul className={fr.cx("fr-list")}>
                  {service.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>

                {service.image && (
                  <div className={fr.cx("fr-my-3w")}>
                    <div
                      role="img"
                      aria-label={`Capture d'écran du service ${service.name}`}
                      style={{
                        borderRadius: "6px",
                        overflow: "hidden",
                        boxShadow: "0px 0px 15px 0px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      <div
                        style={{ margin: "8px", display: "flex", flexDirection: "row", gap: "4px" }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: "#ccc",
                          }}
                        />
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: "#ccc",
                          }}
                        />
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: "#ccc",
                          }}
                        />
                      </div>

                      <Image
                        src={service.image}
                        alt=""
                        width="1500"
                        height="1000"
                        className={fr.cx("fr-responsive-img")}
                      />
                    </div>
                  </div>
                )}

                <FaqList faqs={service.faqs} titleAs="h2" />
              </section>
            ))}

            <BackToTop />
          </div>
        </div>
      </div>
    </>
  );
}
