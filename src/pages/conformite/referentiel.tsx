import CommuneSearch from "@/components/CommuneSearch";
import ContactUs from "@/components/ContactUs";
import FaqList from "@/components/FaqList";
import HeroSection from "@/components/HeroSection";
import { useSmallScreen } from "@/lib/hooks";
import { Commune } from "@/types";
import { fr } from "@codegouvfr/react-dsfr";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

type ReferentielItem = {
  num: string;
  title: ReactNode;
  whyItsImportant: ReactNode;
  howToFix: ReactNode;
  type: "declarative" | "tested";
  level: "mandatory" | "recommended";
};

type ReferentielSection = {
  id: string;
  title: string;
  items: ReferentielItem[];
};

const ReferentielConformite: ReferentielSection[] = [
  {
    id: "site-internet",
    title: "1. Site Internet",
    items: [
      {
        num: "1.1",
        title: (
          <>Un site Internet doit être déclaré auprès de Service-Public.fr</>
        ),
        whyItsImportant: (
          <>
            Pour que tous les usagers puissent vérifier l&rsquo;identité
            d&rsquo;une collectivité, leur référence est le site{" "}
            <Link
              href="https://www.service-public.fr"
              target="_blank"
              rel="noopener"
            >
              Service-Public.fr
            </Link>
            . Cette déclaration permet également de maintenir à jour{" "}
            <Link
              href="https://www.collectivite.fr/"
              target="_blank"
              rel="noopener"
            >
              l&rsquo;Annuaire des Collectivités
            </Link>
            . L&rsquo;adresse déclarée doit être l&rsquo;adresse exacte du site
            Internet de la collectivité, sans redirection vers un autre domaine.
          </>
        ),
        howToFix: (
          <>
            <p>Pour déclarer votre site :</p>
            <ol>
              <li>
                Connectez-vous sur{" "}
                <Link
                  href="https://www.service-public.fr/partenaires"
                  target="_blank"
                  rel="noopener"
                >
                  l&rsquo;espace partenaire de Service-Public.fr
                </Link>
              </li>
              <li>Suivez la procédure de déclaration de site internet</li>
              <li>Renseignez les informations demandées avec précision</li>
            </ol>
            <p>
              Si vous n&rsquo;avez pas encore de compte,{" "}
              <Link
                href="https://www.service-public.fr/partenaires/creation-compte"
                target="_blank"
                rel="noopener"
              >
                créez votre compte administrateur
              </Link>
              .
            </p>
          </>
        ),
        type: "declarative",
        level: "mandatory",
      },
      {
        num: "1.2",
        title: <>Le site doit utiliser une extension de domaine souveraine</>,
        whyItsImportant: (
          <div>
            <div>
              L&rsquo;utilisation d&rsquo;une extension souveraine (.fr ou
              extension régionale) est essentielle car :
            </div>
            <ul>
              <li>
                Ces domaines sont gérés par des organismes publics français,
                garantissant la souveraineté numérique
              </li>
              <li>
                L&rsquo;attribution de ces noms de domaine est strictement
                contrôlée, assurant l&rsquo;identité territoriale
              </li>
              <li>
                Les extensions génériques (.com, .org, etc.) sont gérées par des
                organismes privés étrangers
              </li>
              <li>
                Seules les extensions territoriales permettent aux usagers
                d&rsquo;identifier avec certitude une collectivité française
              </li>
            </ul>
          </div>
        ),
        howToFix: (
          <div>
            <div>Les extensions territoriales autorisées sont :</div>
            <ul>
              <li>
                <strong>National</strong> : .fr, .gouv.fr
              </li>
              <li>
                <strong>Régional</strong> : .alsace, .bzh, .corsica, .paris
              </li>
              <li>
                <strong>Outre-mer</strong> : .re, .yt, .gp, .mq, .gf, .pm, .wf,
                .tf, .nc, .pf
              </li>
            </ul>
            <div>Pour obtenir votre nom de domaine :</div>
            <ol>
              <li>
                Choisissez l&rsquo;extension correspondant à votre territoire
              </li>
              <li>
                Vérifiez la disponibilité sur{" "}
                <Link
                  href="https://www.afnic.fr/noms-de-domaine/tout-savoir/whois-trouver-un-nom-de-domaine/"
                  target="_blank"
                  rel="noopener"
                >
                  le site de l&rsquo;AFNIC
                </Link>
              </li>
              <li>
                Effectuez la demande auprès d&rsquo;un bureau
                d&rsquo;enregistrement agréé par l&rsquo;AFNIC
              </li>
            </ol>
          </div>
        ),
        type: "declarative",
        level: "mandatory",
      },
      {
        num: "1.3",
        title: <>Le site doit être joignable</>,
        whyItsImportant: (
          <>
            <p>Un site non joignable a des impacts directs :</p>
            <ul>
              <li>
                Impossibilité pour les usagers d&rsquo;accéder aux services en
                ligne
              </li>
              <li>
                Perte de confiance dans la présence numérique de la collectivité
              </li>
              <li>Risque de confusion avec des sites frauduleux</li>
              <li>Perturbation du service public numérique</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>En cas de site non joignable, suivez ces étapes :</p>
            <ol>
              <li>
                Vérifiez l&rsquo;état de votre hébergement et son tableau de
                bord
              </li>
              <li>Contrôlez les enregistrements DNS de votre nom de domaine</li>
              <li>
                Examinez les logs du serveur web pour identifier
                d&rsquo;éventuelles erreurs
              </li>
              <li>Testez la connectivité depuis différents réseaux</li>
            </ol>
            <p>Outils recommandés :</p>
            <ul>
              <li>
                <Link
                  href="https://downforeveryoneorjustme.com/"
                  target="_blank"
                  rel="noopener"
                >
                  Down for Everyone or Just Me
                </Link>{" "}
                - Vérification rapide
              </li>
              <li>
                <Link
                  href="https://www.pingdom.com/"
                  target="_blank"
                  rel="noopener"
                >
                  Pingdom
                </Link>{" "}
                - Monitoring professionnel
              </li>
            </ul>
          </>
        ),
        type: "tested",
        level: "mandatory",
      },
      {
        num: "1.4",
        title: <>Le site doit utiliser le protocole HTTPS</>,
        whyItsImportant: (
          <>
            HTTPS garantit la confidentialité et l&rsquo;intégrité des données
            échangées entre l&rsquo;usager et le site. Sans HTTPS, les données
            transmises peuvent être interceptées ou modifiées par des acteurs
            malveillants. Les navigateurs modernes affichent des avertissements
            de sécurité sur les sites non sécurisés, ce qui peut inquiéter les
            usagers.
          </>
        ),
        howToFix: (
          <>
            <p>Plusieurs options s&rsquo;offrent à vous :</p>
            <ul>
              <li>
                Utilisez{" "}
                <Link
                  href="https://letsencrypt.org/fr/"
                  target="_blank"
                  rel="noopener"
                >
                  Let&rsquo;s Encrypt
                </Link>{" "}
                pour obtenir un certificat SSL gratuit
              </li>
              <li>
                Configurez votre serveur web pour rediriger automatiquement HTTP
                vers HTTPS
              </li>
              <li>
                Contactez votre hébergeur qui pourra vous accompagner dans cette
                démarche
              </li>
            </ul>
            <p>
              Pour plus d&rsquo;informations, consultez le{" "}
              <Link
                href="https://www.ssi.gouv.fr/guide/recommandations-pour-la-securisation-des-sites-web/"
                target="_blank"
                rel="noopener"
              >
                guide de l&rsquo;ANSSI sur la sécurisation des sites web
              </Link>
              .
            </p>
          </>
        ),
        type: "tested",
        level: "mandatory",
      },
      {
        num: "1.5",
        title: <>Le certificat SSL doit être valide</>,
        whyItsImportant: (
          <>
            <p>
              Un certificat SSL invalide pose plusieurs problèmes critiques :
            </p>
            <ul>
              <li>
                Les navigateurs affichent des avertissements de sécurité qui
                effraient les usagers
              </li>
              <li>La confidentialité des échanges n&rsquo;est plus garantie</li>
              <li>
                La collectivité apparaît comme négligente sur les questions de
                sécurité
              </li>
              <li>
                Le site peut devenir inaccessible sur certains navigateurs
              </li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour maintenir un certificat SSL valide :</p>
            <ol>
              <li>
                Vérifiez la date d&rsquo;expiration de votre certificat actuel
              </li>
              <li>
                Configurez le renouvellement automatique si possible (recommandé
                avec Let&rsquo;s Encrypt)
              </li>
              <li>
                Mettez en place une surveillance des dates d&rsquo;expiration
              </li>
              <li>
                Vérifiez que le certificat correspond bien au nom de domaine
                utilisé
              </li>
            </ol>
            <p>
              En cas de problème, contactez votre hébergeur ou votre prestataire
              technique.
            </p>
          </>
        ),
        type: "tested",
        level: "mandatory",
      },
      {
        num: "1.6",
        title: <>Les redirections d&rsquo;usage doivent fonctionner</>,
        whyItsImportant: (
          <div>
            <div>
              Les redirections sont essentielles pour plusieurs raisons :
            </div>
            <ul>
              <li>
                Garantir l&rsquo;accès au site quelle que soit l&rsquo;URL
                saisie par l&rsquo;usager
              </li>
              <li>
                Éviter la duplication de contenu qui nuit au référencement
              </li>
              <li>Assurer que tous les accès passent par HTTPS</li>
              <li>Maintenir une expérience utilisateur cohérente</li>
            </ul>
          </div>
        ),
        howToFix: (
          <div>
            <div>Configuration à mettre en place :</div>
            <ol>
              <li>Redirection automatique de HTTP vers HTTPS</li>
              <li>
                Redirection des variantes du nom de domaine vers la version
                canonique :
                <ul>
                  <li>
                    De <strong>commune.fr</strong> vers{" "}
                    <strong>www.commune.fr</strong> (ou l&rsquo;inverse)
                  </li>
                  <li>
                    Des anciennes adresses vers la nouvelle si changement de nom
                  </li>
                </ul>
              </li>
              <li>
                Vérification régulière du bon fonctionnement des redirections
              </li>
            </ol>
            <div>
              Ces redirections doivent être configurées au niveau du serveur web
              ou de l&rsquo;hébergement.
            </div>
          </div>
        ),
        type: "tested",
        level: "recommended",
      },
      {
        num: "1.7",
        title: (
          <>
            L&rsquo;adresse du site déclarée sur Service-Public.fr doit être en
            HTTPS
          </>
        ),
        whyItsImportant: (
          <>
            <p>
              Déclarer l&rsquo;adresse HTTPS sur Service-Public.fr est crucial
              car :
            </p>
            <ul>
              <li>Cela évite un passage initial non sécurisé par HTTP</li>
              <li>Les moteurs de recherche privilégient les liens HTTPS</li>
              <li>Cela démontre le professionnalisme de la collectivité</li>
              <li>
                Les usagers sont directement dirigés vers la version sécurisée
              </li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour mettre à jour l&rsquo;adresse :</p>
            <ol>
              <li>Connectez-vous à votre espace sur Service-Public.fr</li>
              <li>Accédez à la section de gestion de votre collectivité</li>
              <li>
                Modifiez l&rsquo;URL en remplaçant <strong>http://</strong> par{" "}
                <strong>https://</strong>
              </li>
              <li>
                Vérifiez que l&rsquo;adresse est accessible avant de valider
              </li>
            </ol>
          </>
        ),
        type: "tested",
        level: "recommended",
      },
    ],
  },
  {
    id: "messagerie",
    title: "2. Messagerie",
    items: [
      {
        num: "2.1",
        title: (
          <>
            Une adresse de messagerie doit être déclarée sur Service-Public.fr
          </>
        ),
        whyItsImportant: (
          <>
            <p>
              La déclaration d&rsquo;une adresse email officielle est
              essentielle car :
            </p>
            <ul>
              <li>C&rsquo;est un point de contact officiel pour les usagers</li>
              <li>
                Elle permet aux administrations de vous contacter de manière
                sécurisée
              </li>
              <li>Elle participe à la transparence administrative</li>
              <li>C&rsquo;est une obligation légale pour les collectivités</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour déclarer votre adresse email :</p>
            <ol>
              <li>Connectez-vous à votre espace Service-Public.fr</li>
              <li>
                Accédez à la section <strong>Coordonnées</strong>
              </li>
              <li>Renseignez une adresse email professionnelle active</li>
              <li>Assurez-vous que cette boîte est relevée régulièrement</li>
            </ol>
            <p>
              L&rsquo;adresse doit être consultée quotidiennement pour garantir
              un traitement rapide des demandes.
            </p>
          </>
        ),
        type: "declarative",
        level: "mandatory",
      },
      {
        num: "2.2",
        title: <>L&rsquo;email ne doit pas utiliser un domaine générique</>,
        whyItsImportant: (
          <div>
            <div>
              L&rsquo;utilisation d&rsquo;adresses email génériques (gmail.com,
              yahoo.fr, etc.) présente plusieurs risques :
            </div>
            <ul>
              <li>
                Impossibilité pour les usagers de vérifier l&rsquo;authenticité
                des communications
              </li>
              <li>Perte de souveraineté sur les données échangées</li>
              <li>
                Non-conformité avec les bonnes pratiques de
                l&rsquo;administration numérique
              </li>
              <li>
                Absence de contrôle sur la sécurité et la confidentialité des
                échanges
              </li>
            </ul>
          </div>
        ),
        howToFix: (
          <div>
            <div>Pour professionnaliser votre messagerie :</div>
            <ol>
              <li>
                Utilisez le même nom de domaine territorial que votre site web
              </li>
              <li>
                Optez pour une solution de messagerie professionnelle :
                <ul>
                  <li>
                    Solution mutualisée via un syndicat informatique territorial
                  </li>
                  <li>Solution proposée par la Suite territoriale</li>
                </ul>
              </li>
              <li>
                Mettez en place une politique de transition :
                <ul>
                  <li>Informez vos contacts du changement</li>
                  <li>
                    Configurez une réponse automatique sur l&rsquo;ancienne
                    adresse
                  </li>
                  <li>
                    Maintenez l&rsquo;ancienne adresse quelques mois en
                    parallèle
                  </li>
                </ul>
              </li>
            </ol>
          </div>
        ),
        type: "declarative",
        level: "mandatory",
      },
      {
        num: "2.3",
        title: (
          <>Le domaine de l&rsquo;email doit correspondre au domaine du site</>
        ),
        whyItsImportant: (
          <>
            <p>
              La cohérence entre le domaine du site et de l&rsquo;email est
              cruciale car :
            </p>
            <ul>
              <li>
                Elle renforce l&rsquo;identité numérique de la collectivité
              </li>
              <li>
                Elle facilite l&rsquo;identification des communications
                officielles
              </li>
              <li>Elle réduit les risques de confusion pour les usagers</li>
              <li>
                Elle simplifie la gestion technique des services numériques
              </li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour assurer cette cohérence :</p>
            <ol>
              <li>Identifiez le nom de domaine principal de votre site</li>
              <li>Créez des adresses email utilisant ce même domaine</li>
              <li>
                Planifiez la migration des anciennes adresses si nécessaire :
                <ul>
                  <li>Informez vos contacts du changement</li>
                  <li>Mettez en place des redirections temporaires</li>
                  <li>Mettez à jour tous vos supports de communication</li>
                </ul>
              </li>
            </ol>
          </>
        ),
        type: "declarative",
        level: "mandatory",
      },
      {
        num: "2.4",
        title: <>Les enregistrements DNS MX doivent être configurés</>,
        whyItsImportant: (
          <>
            <p>Les enregistrements MX sont fondamentaux car :</p>
            <ul>
              <li>
                Ils permettent la réception des emails adressés à votre domaine
              </li>
              <li>
                Leur absence rend impossible toute communication email entrante
              </li>
              <li>
                Une mauvaise configuration peut causer des pertes de messages
              </li>
              <li>Ils sont essentiels pour la continuité du service public</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour configurer les enregistrements MX :</p>
            <ol>
              <li>Identifiez les serveurs de messagerie de votre hébergeur</li>
              <li>Accédez à la zone DNS de votre domaine</li>
              <li>Créez les enregistrements MX avec les bonnes priorités</li>
              <li>
                Vérifiez la configuration avec des outils comme :
                <ul>
                  <li>
                    <Link
                      href="https://mxtoolbox.com"
                      target="_blank"
                      rel="noopener"
                    >
                      MXToolbox
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://intodns.com"
                      target="_blank"
                      rel="noopener"
                    >
                      IntoDNS
                    </Link>
                  </li>
                </ul>
              </li>
            </ol>
            <p>
              En cas de doute, consultez votre prestataire de messagerie pour
              obtenir les valeurs exactes à configurer.
            </p>
          </>
        ),
        type: "tested",
        level: "mandatory",
      },
      {
        num: "2.5",
        title: <>La protection SPF doit être activée</>,
        whyItsImportant: (
          <>
            SPF (Sender Policy Framework) est un mécanisme essentiel de sécurité
            email qui :
            <ul>
              <li>
                Empêche l&rsquo;usurpation de votre nom de domaine pour
                l&rsquo;envoi d&rsquo;emails frauduleux
              </li>
              <li>Améliore la délivrabilité de vos emails légitimes</li>
              <li>Protège votre réputation numérique</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour configurer SPF :</p>
            <ol>
              <li>
                Identifiez tous vos serveurs d&rsquo;envoi d&rsquo;emails
                légitimes
              </li>
              <li>
                Créez un enregistrement TXT dans votre zone DNS avec la syntaxe
                appropriée
              </li>
              <li>
                Testez votre configuration avec des outils comme{" "}
                <Link
                  href="https://www.dmarcanalyzer.com/spf/checker/"
                  target="_blank"
                  rel="noopener"
                >
                  SPF Record Checker
                </Link>
              </li>
            </ol>
            <p>
              Consultez le{" "}
              <Link
                href="https://www.ssi.gouv.fr/guide/guide-de-configuration-spf/"
                target="_blank"
                rel="noopener"
              >
                guide de configuration SPF de l&rsquo;ANSSI
              </Link>{" "}
              pour plus de détails.
            </p>
          </>
        ),
        type: "tested",
        level: "recommended",
      },
      {
        num: "2.6",
        title: <>La protection DMARC doit être activée</>,
        whyItsImportant: (
          <>
            <p>
              DMARC (Domain-based Message Authentication, Reporting and
              Conformance) est crucial car :
            </p>
            <ul>
              <li>
                Il permet de détecter et bloquer les tentatives
                d&rsquo;usurpation d&rsquo;identité par email
              </li>
              <li>
                Il fournit des rapports détaillés sur les tentatives
                d&rsquo;utilisation frauduleuse du domaine
              </li>
              <li>
                Il renforce la confiance des destinataires dans vos
                communications
              </li>
              <li>
                Il complète les protections SPF et DKIM pour une sécurité
                optimale
              </li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour mettre en place DMARC :</p>
            <ol>
              <li>
                Créez un enregistrement DNS de type TXT pour
                _dmarc.votredomaine.fr
              </li>
              <li>
                Commencez avec une politique permissive (p=none) pour observer
                sans bloquer
              </li>
              <li>Configurez une adresse email pour recevoir les rapports</li>
              <li>
                Analysez les rapports et ajustez progressivement la politique
              </li>
            </ol>
            <p>
              Consultez le{" "}
              <Link
                href="https://www.ssi.gouv.fr/guide/mise-en-oeuvre-de-dmarc/"
                target="_blank"
                rel="noopener"
              >
                guide DMARC de l&rsquo;ANSSI
              </Link>{" "}
              pour plus de détails.
            </p>
          </>
        ),
        type: "tested",
        level: "recommended",
      },
      {
        num: "2.7",
        title: (
          <>
            La protection DMARC doit être configurée avec une politique de
            quarantaine
          </>
        ),
        whyItsImportant: (
          <>
            <p>Une politique de quarantaine DMARC est importante car :</p>
            <ul>
              <li>Elle applique un traitement strict aux emails suspects</li>
              <li>
                Elle réduit significativement les risques d&rsquo;hameçonnage
              </li>
              <li>Elle démontre un engagement fort pour la sécurité email</li>
              <li>Elle protège activement la réputation de la collectivité</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour configurer une politique de quarantaine :</p>
            <ol>
              <li>Assurez-vous que SPF et DKIM sont correctement configurés</li>
              <li>
                Modifiez l&rsquo;enregistrement DMARC pour inclure
                <strong>p=quarantine;pct=100</strong>
              </li>
              <li>
                Surveillez les rapports DMARC pour détecter d&rsquo;éventuels
                faux positifs
              </li>
              <li>
                Ajustez si nécessaire le pourcentage d&rsquo;application (pct)
              </li>
            </ol>
            <p>
              Il est recommandé de passer progressivement à cette politique en
              augmentant graduellement le pourcentage.
            </p>
          </>
        ),
        type: "tested",
        level: "recommended",
      },
    ],
  },
];

const FAQS = [
  {
    question: <>Comment savoir si ma collectivité est conforme ?</>,
    answer: (
      <>
        <p>Pour vérifier la conformité de votre collectivité :</p>
        <ol>
          <li>
            Utilisez la barre de recherche en haut de page pour trouver votre
            commune
          </li>
          <li>Consultez le rapport détaillé qui s&rsquo;affiche</li>
          <li>
            Pour chaque critère non conforme, suivez les recommandations de
            correction
          </li>
        </ol>
        <p>
          Les tests automatiques sont effectués quotidiennement pour les
          critères marqués comme <strong>Testé quotidiennement</strong>.
        </p>
      </>
    ),
  },
  {
    question: <>Que faire si je ne peux pas corriger une non-conformité ?</>,
    answer: (
      <>
        <p>
          Si vous rencontrez des difficultés pour corriger une non-conformité :
        </p>
        <ul>
          <li>Contactez votre prestataire technique habituel</li>
          <li>
            Rapprochez-vous de votre structure de mutualisation si vous en avez
            une
          </li>
          <li>
            Utilisez le formulaire de contact en bas de page pour obtenir de
            l&rsquo;aide
          </li>
        </ul>
        <p>
          La Suite territoriale propose également des solutions pour vous aider
          à vous mettre en conformité.
        </p>
      </>
    ),
  },
  {
    question: <>Les critères vont-ils évoluer dans le temps ?</>,
    answer: (
      <>
        <p>Le référentiel est amené à évoluer pour plusieurs raisons :</p>
        <ul>
          <li>
            L&rsquo;évolution des menaces et des bonnes pratiques de sécurité
          </li>
          <li>Les retours d&rsquo;expérience des collectivités</li>
          <li>Les nouvelles obligations réglementaires</li>
        </ul>
        <p>
          Chaque mise à jour majeure fera l&rsquo;objet d&rsquo;une
          communication dédiée et d&rsquo;un délai d&rsquo;adaptation
          raisonnable.
        </p>
      </>
    ),
  },
  {
    question: (
      <>
        Pourquoi certains critères sont-ils recommandés et d&rsquo;autres
        obligatoires ?
      </>
    ),
    answer: (
      <>
        <p>Cette distinction reflète deux niveaux d&rsquo;exigence :</p>
        <ul>
          <li>
            Les critères <strong>obligatoires</strong> correspondent au niveau
            minimal de sécurité et de professionnalisme attendu d&rsquo;une
            collectivité
          </li>
          <li>
            Les critères <strong>recommandés</strong> permettent
            d&rsquo;atteindre un niveau de sécurité optimal mais peuvent
            nécessiter plus de ressources ou de compétences techniques
          </li>
        </ul>
        <p>
          Nous encourageons toutes les collectivités à viser la conformité avec
          l&rsquo;ensemble des critères, obligatoires comme recommandés.
        </p>
      </>
    ),
  },
  {
    question: (
      <>
        Pourquoi l&rsquo;utilisation de DKIM ne fait-elle pas partie du
        référentiel ?
      </>
    ),
    answer: (
      <>
        <p>
          L&rsquo;utilisation de{" "}
          <Link
            href="https://fr.wikipedia.org/wiki/DomainKeys_Identified_Mail"
            target="_blank"
            rel="noopener"
          >
            DKIM
          </Link>{" "}
          est effectivement très fortement recommandée pour toutes les
          collectivités, cependant elle n&rsquo;est malheureusement pas encore
          testable automatiquement car elle dépend d&rsquo;un <i>sélecteur</i>{" "}
          qui peut être arbitrairement choisi par l&rsquo;expéditeur. Nous avons
          à cœur de n&rsquo;utiliser que des critères automatiquement
          vérifiables dans ce référentiel.
        </p>
        <p>
          Une future version de ce référentiel pourra s&rsquo;appuyer sur
          l&rsquo;envoi régulier d&rsquo;emails depuis les adresses de
          messagerie de la collectivité pour vérifier la configuration de DKIM
          et la délivrabilité des emails en général.
        </p>
      </>
    ),
  },
  {
    question: (
      <>
        Suis-je obligé d&rsquo;utiliser la Suite territoriale pour être conforme
        ?
      </>
    ),
    answer: (
      <>
        <p>
          Non, vous n&rsquo;êtes pas obligé d&rsquo;utiliser la Suite
          territoriale pour être conforme. Vous pouvez utiliser n&rsquo;importe
          quel autre outil ou solution.
        </p>
        <p>
          Cependant, la Suite territoriale propose des solutions faciles à
          utiliser pour vous aider à être conforme et vous accompagner dans
          cette démarche.
        </p>
      </>
    ),
  },
];

const menuItems = [
  {
    text: "À propos",
    linkProps: { href: "#about" },
  },
  ...ReferentielConformite.map((section) => ({
    text: section.title,
    linkProps: { href: `#${section.id}` },
  })),
  {
    text: "Foire aux questions",
    linkProps: { href: "#faq" },
  },
];

const ReferentielPage: NextPage = () => {
  const router = useRouter();
  const isSmallScreen = useSmallScreen(1000);

  const handleCommuneSelect = (selectedCommune: Commune) => {
    router.push(`/bienvenue/${selectedCommune.siret}`);
  };

  return (
    <>
      <NextSeo
        title="Référentiel de Conformité de l'Identité Numérique des Territoires"
        description="Référentiel de Conformité de l'Identité Numérique des Territoires"
      />

      <HeroSection>
        <div className={fr.cx("fr-container", "fr-pt-5w")}>
          <div style={{ textAlign: "center" }}>
            <h1
              className={fr.cx("fr-h1", "fr-mb-2w")}
              style={{ color: "var(--text-title-blue-france)" }}
            >
              Référentiel de Conformité
              <br /> de l&rsquo;Identité Numérique des Territoires
            </h1>
            <p className={fr.cx("fr-text--lg")}>
              RCINT version 0.1 - 31 Mars 2025
            </p>
            <h2
              className={fr.cx(
                "fr-text--lg",
                "fr-pt-1w",
                "fr-mb-2w",
                "fr-text--bold",
              )}
              style={{
                textAlign: "center",
                color: "var(--text-title-blue-france)",
              }}
            >
              Ma commune est-elle conforme ?
            </h2>

            <div
              className={fr.cx(
                "fr-grid-row",
                "fr-grid-row--center",
                "fr-mb-4w",
              )}
            >
              <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                <div
                  className={fr.cx("fr-search-bar")}
                  style={{ width: "100%" }}
                >
                  <CommuneSearch
                    onSelect={handleCommuneSelect}
                    placeholder={
                      isSmallScreen
                        ? "Nom ou code postal"
                        : "Renseignez le nom ou le code postal de votre commune"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </HeroSection>

      <div className={fr.cx("fr-container", "fr-py-6w")}>
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
          <div className={fr.cx("fr-col-12", "fr-col-md-3")}>
            <SideMenu
              align="left"
              items={menuItems}
              sticky
              fullHeight
              burgerMenuButtonText="Menu du référentiel"
            />
          </div>
          <div className={fr.cx("fr-col-12", "fr-col-md-9")}>
            <div id="about">
              <h2 className={fr.cx("fr-h2", "fr-mb-3w")}>
                À propos du référentiel
              </h2>
              <div className={fr.cx("fr-text--lg", "fr-mb-5w")}>
                <p>
                  Le Référentiel de Conformité de l&rsquo;Identité Numérique des
                  Territoires établit les critères fondamentaux pour garantir
                  une présence en ligne sécurisée et professionnelle des
                  collectivités territoriales.
                </p>
                <p>
                  Ce référentiel s&rsquo;articule autour de deux piliers
                  essentiels : le site internet institutionnel et la messagerie
                  professionnelle. Ces éléments constituent le socle de
                  l&rsquo;identité numérique d&rsquo;une collectivité et sont
                  cruciaux pour maintenir la confiance des usagers et la
                  sécurité des échanges numériques.
                </p>
                <p>
                  Chaque critère est classé selon son niveau d&rsquo;importance
                  (obligatoire ou recommandé) et son mode de vérification
                  (déclaratif ou testé quotidiennement).
                </p>
                <p>
                  Les <Link href="/services">services</Link> proposés par la
                  Suite territoriale peuvent aider les collectivités qui le
                  souhaitent à répondre à ces critères.
                </p>
              </div>
            </div>

            {ReferentielConformite.map((section) => (
              <div key={section.id} id={section.id} className="rcint-section">
                <h2 className={fr.cx("fr-h2", "fr-mt-5w")}>{section.title}</h2>
                {section.items.map((item) => (
                  <div
                    key={item.num}
                    id={item.num.toLowerCase()}
                    className={fr.cx("fr-mb-3w")}
                  >
                    <Card
                      titleAs="h3"
                      title={
                        <>
                          {item.num} - {item.title}
                        </>
                      }
                      end={
                        <div className={fr.cx("fr-mb-2w")}>
                          <div>
                            <span
                              className={fr.cx(
                                "fr-badge",
                                "fr-badge--sm",
                                "fr-badge--no-icon",
                                "fr-mr-2w",
                                item.level === "mandatory"
                                  ? "fr-badge--success"
                                  : "fr-badge--info",
                              )}
                            >
                              <span
                                className={fr.cx(
                                  "fr-icon-checkbox-circle-line",
                                  "fr-icon--sm",
                                  "fr-mr-1w",
                                )}
                                aria-hidden="true"
                              />
                              {item.level === "mandatory"
                                ? "Obligatoire"
                                : "Recommandé"}
                            </span>

                            <span
                              className={fr.cx(
                                "fr-badge",
                                "fr-badge--sm",
                                "fr-mr-2w",
                              )}
                            >
                              <span
                                className={fr.cx(
                                  item.type === "tested"
                                    ? "fr-icon-timer-line"
                                    : "fr-icon-clipboard-line",
                                  "fr-icon--sm",
                                  "fr-mr-1w",
                                )}
                                aria-hidden="true"
                              />
                              {item.type === "tested"
                                ? "Testé quotidiennement"
                                : "Déclaratif"}
                            </span>

                            <Link
                              href={`#${item.num.toLowerCase()}`}
                              className={fr.cx(
                                "fr-badge",
                                "fr-badge--sm",
                                "fr-badge--blue-cumulus",
                                "fr-mr-1w",
                              )}
                            >
                              <span
                                className={fr.cx(
                                  "fr-icon-link",
                                  "fr-icon--sm",
                                  "fr-mr-1w",
                                )}
                                aria-hidden="true"
                              />
                              Lien vers ce critère
                            </Link>
                          </div>

                          <h4
                            className={fr.cx(
                              "fr-text--bold",
                              "fr-mb-1w",
                              "fr-mt-3w",
                            )}
                          >
                            Pourquoi c&rsquo;est important ?
                          </h4>
                          <div className={fr.cx("fr-mb-2w")}>
                            {item.whyItsImportant}
                          </div>

                          <h4 className={fr.cx("fr-text--bold", "fr-mb-1w")}>
                            Comment s&rsquo;y conformer ?
                          </h4>
                          <div>{item.howToFix}</div>
                        </div>
                      }
                      border
                    />
                  </div>
                ))}
              </div>
            ))}

            <div id="faq">
              <h2 className={fr.cx("fr-h2", "fr-mb-3w")}>
                Foire aux questions
              </h2>
              <FaqList faqs={FAQS} />
            </div>

            <div className={fr.cx("fr-my-12w")}>
              <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-offset-lg-1", "fr-col-lg-10")}>
                  <ContactUs />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferentielPage;
