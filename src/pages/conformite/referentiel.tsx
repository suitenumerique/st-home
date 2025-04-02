import CommuneSearch from "@/components/CommuneSearch";
import ContactUs from "@/components/ContactUs";
import FaqList from "@/components/FaqList";
import HeroSection from "@/components/HeroSection";
import { useSmallScreen } from "@/lib/hooks";
import { Commune } from "@/types";
import { fr } from "@codegouvfr/react-dsfr";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";

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

const DILA_LINK = (
  <Link href="https://www.service-public.fr" target="_blank">
    Service-Public.fr
  </Link>
);

const DILA_INTRO = (
  <>
    <p>
      {DILA_LINK} est le service de référence, maintenu par la Direction de
      l&rsquo;information légale et administrative (DILA), et utilisé par les
      usagers et services de l&rsquo;État pour obtenir des informations sur
      toutes les communes françaises.
    </p>

    <p>
      Il est utilisé par de nombreux autres services publics comme{" "}
      <Link href="https://www.collectivite.fr/" target="_blank">
        l&rsquo;Annuaire des Collectivités
      </Link>{" "}
      et recense notamment les sites internet communaux. Cette donnée est la
      donnée principale utilisée par l&rsquo;ANCT dans le cadre de la Suite
      territoriale et du Référentiel de Conformité.
    </p>
  </>
);

const ReferentielConformite: ReferentielSection[] = [
  {
    id: "site-internet",
    title: "1. Site internet",
    items: [
      {
        num: "1.1",
        title: (
          <>Un site internet doit être déclaré auprès de Service-Public.fr</>
        ),
        whyItsImportant: <>{DILA_INTRO}</>,
        howToFix: (
          <>
            Pour déclarer le site internet de votre commune sur {DILA_LINK} :
            <ol>
              <li>
                Accédez à la page de votre commune grâce à la barre de recherche
                ;
              </li>
              <li>Demandez la modification de la page ;</li>
              <li>Renseignez votre adresse de messagerie professionnelle ; </li>
              <li>Mettez à jour la section &quot;Contacts web&quot; ;</li>
              <li>
                Envoyez votre demande, elle sera prise en compte sous 48h.
              </li>
            </ol>
          </>
        ),
        type: "declarative",
        level: "mandatory",
      },
      {
        num: "1.2",
        title: (
          <>
            Le site internet doit utiliser une extension de domaine souveraine
          </>
        ),
        whyItsImportant: (
          <>
            <div>
              Une extension de domaine (ou <i>TLD</i>) est dite souveraine
              lorsqu&rsquo;elle est administrée par un organisme public français
              et propice à un usage par le service public. C&rsquo;est le cas
              uniquement du <strong>.fr</strong> et de toutes les extensions
              régionales qui garantissent la souveraineté numérique par :
            </div>
            <ul>
              <li>la gestion du domaine par un organisme public français ;</li>
              <li>
                le contrôle de ces organismes dans l&rsquo;attribution des
                domaines ;
              </li>
              <li>
                le rattachement de l&rsquo;organisation au territoire français.
              </li>
            </ul>
            <div>
              Les extensions de domaine jugées conformes pour une administration
              publique locale dans le Référentiel de Conformité sont :
            </div>
            <ul>
              <li>
                <strong>National</strong> : .fr
              </li>
              <li>
                <strong>Régional</strong> : .alsace, .bzh, .corsica, .paris
              </li>
              <li>
                <strong>Outre-mer</strong> : .re, .yt, .gp, .mq, .gf, .pm, .wf,
                .tf, .nc, .pf
              </li>
            </ul>
            <div>
              Toute autre extension est considérée comme non conforme, notamment
              le <strong>.com</strong> qui est réservé aux usages commerciaux et
              sur lequel la France n&rsquo;est pas souveraine.
            </div>
          </>
        ),
        howToFix: (
          <div>
            <div>Pour obtenir une extension de domaine conforme :</div>
            <ol>
              <li>
                Accédez au{" "}
                <Link
                  href="https://www.afnic.fr/noms-de-domaine/tout-savoir/creer-un-nom-de-domaine/"
                  target="_blank"
                  rel="noopener"
                >
                  site de l&rsquo;AFNIC
                </Link>{" "}
                ;
              </li>
              <li>
                Choisissez l&rsquo;extension correspondant à votre territoire ;
              </li>
              <li>
                Vérifiez la disponibilité du domaine au format{" "}
                <strong>[commune].[extension]</strong> ;
              </li>
              <li>
                Effectuez la demande auprès dun bureau d&rsquo;enregistrement
                agréé par l&rsquo;Afnic.
              </li>
            </ol>
          </div>
        ),
        type: "declarative",
        level: "mandatory",
      },
      {
        num: "1.3",
        title: <>Le site internet doit être joignable</>,
        whyItsImportant: (
          <>
            <div>
              Un site internet est dit injoignable lorsque l&rsquo;utilisateur
              ne peut y accéder et qu&rsquo;une page d&rsquo;erreur ou une page
              blanche s&rsquo;affiche en rentrant son adresse dans un
              navigateur. Cette indisponibilité a des impacts directs pour la
              commune :
            </div>
            <ul>
              <li>
                impossibilité pour les usagers d&rsquo;accéder à
                l&rsquo;information officielle de votre commune ou aux services
                en ligne ;
              </li>
              <li>
                perte de confiance dans la présence numérique de la collectivité
                ;
              </li>
              <li>risque de confusion avec des sites frauduleux ;</li>
              <li>perturbation du service public.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <div>
              Pour tester la disponibilité du site internet de votre commune,
              vous pouvez utiliser un des ces services :
            </div>
            <ul>
              <li>
                <Link
                  href="https://downforeveryoneorjustme.com/"
                  target="_blank"
                >
                  Down for Everyone or Just Me
                </Link>{" "}
                - Vérification rapide
              </li>
              <li>
                <Link href="https://www.pingdom.com/" target="_blank">
                  Pingdom
                </Link>{" "}
                - Monitoring professionnel
              </li>
            </ul>
            <div>
              En cas d&rsquo;indisponibilité, l&rsquo;ANCT vous recommande de
              suivre ces étapes, en autonomie ou à l&rsquo;aide de votre
              prestataire informatique :
            </div>
            <ol>
              <li>
                Vérifiez l&rsquo;état de votre hébergement et son tableau de
                bord ;
              </li>
              <li>
                Contrôlez les enregistrements DNS de votre nom de domaine ;
              </li>
              <li>
                Examinez les logs du serveur web pour identifier
                d&rsquo;éventuelles erreurs ;
              </li>
              <li>Testez la connectivité depuis différents réseaux.</li>
            </ol>
          </>
        ),
        type: "tested",
        level: "mandatory",
      },
      {
        num: "1.4",
        title: <>Le site internet doit utiliser le protocole HTTPS</>,
        whyItsImportant: (
          <>
            <p>
              HTTPS garantit la confidentialité et l&rsquo;intégrité des données
              échangées entre l&rsquo;usager et le site. Il est facilement
              reconnaissable dans l&rsquo;url du site (<strong>https://</strong>
              ) ou encore par la présence d&rsquo;une icône de cadenas dans la
              barre d&rsquo;adresse du navigateur.
            </p>
            <p>
              Sans HTTPS, les données transmises peuvent être interceptées ou
              modifiées par des acteurs malveillants. Les navigateurs modernes
              affichent des avertissements de sécurité sur les sites non
              sécurisés, source de perte de confiance de l&rsquo;usager.
            </p>
          </>
        ),
        howToFix: (
          <>
            <div>
              Pour utiliser un protocole sécurisé HTTPS pour le site internet de
              votre commune :
            </div>
            <ul>
              <li>
                Utilisez{" "}
                <Link href="https://letsencrypt.org/fr/" target="_blank">
                  Let&rsquo;s Encrypt
                </Link>{" "}
                pour obtenir un certificat SSL gratuitement ;
              </li>
              <li>
                Configurez votre serveur web pour rediriger automatiquement HTTP
                vers HTTPS ;
              </li>
            </ul>
            <p>
              En cas de problème, contactez votre hébergeur ou votre prestataire
              technique qui pourront vous accompagner dans cette démarche.
            </p>
            <p>
              Pour plus d&rsquo;informations, consultez le{" "}
              <Link
                href="https://www.ssi.gouv.fr/guide/recommandations-pour-la-securisation-des-sites-web/"
                target="_blank"
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
            <div>
              Le certificat SSL (<i>Secure Sockets Layer</i>) est un certificat
              numérique qui assure l&rsquo;authenticité du site internet de
              votre commune. Un certificat SSL invalide pose plusieurs problèmes
              critiques :
            </div>
            <ul>
              <li>
                la confidentialité des échanges n&rsquo;est plus garantie ;
              </li>
              <li>
                le site internet peut devenir inaccessible sur certains
                navigateurs ;
              </li>
              <li>
                certains navigateurs affichent des avertissements de sécurité
                qui effraient les usagers ;
              </li>
              <li>
                la collectivité apparaît comme négligente de sa sécurité
                numérique.
              </li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <div>
              Pour maintenir un certificat SSL valide pour le site internet de
              votre commune :
            </div>
            <ol>
              <li>
                Vérifiez la date d&rsquo;expiration de votre certificat actuel ;
              </li>
              <li>
                Configurez le renouvellement automatique si possible (recommandé
                avec le service gratuit{" "}
                <Link href="https://letsencrypt.org/fr/" target="_blank">
                  Let&rsquo;s Encrypt
                </Link>
                ) ;
              </li>
              <li>
                Mettez en place une surveillance des dates d&rsquo;expiration ;
              </li>
              <li>
                Vérifiez que le certificat correspond bien au nom de domaine
                utilisé.
              </li>
            </ol>
            <p>
              En cas de problème, contactez votre hébergeur ou votre prestataire
              technique qui pourront vous accompagner dans cette démarche.
            </p>
          </>
        ),
        type: "tested",
        level: "mandatory",
      },
      {
        num: "1.6",
        title: (
          <>
            Le site déclaré sur Service-Public.fr ne doit pas rediriger ailleurs
          </>
        ),
        whyItsImportant: (
          <>
            <p>
              La déclaration d&rsquo;un site internet sur {DILA_LINK} vise à
              renforcer la confiance des usagers dans la présence numérique de
              la collectivité.
            </p>
            <p>
              Si l&rsquo;adresse internet déclarée redirige les usagers vers un
              autre nom de domaine, celui-ci ne peut pas être identifié comme
              étant le site officiel de la collectivité.
            </p>
          </>
        ),
        howToFix: (
          <>
            <p>
              Pour assurer la cohérence de la déclaration du site internet de
              votre commune sur {DILA_LINK}, vérifiez que l&rsquo;adresse
              internet déclarée ne redirige pas vers un autre nom de domaine.
            </p>
            <p>
              Si l&rsquo;adresse de redirection est la nouvelle adresse
              officielle de votre site internet, mettez à jour la déclaration
              sur {DILA_LINK} en renseignant cette nouvelle adresse.
            </p>
          </>
        ),
        type: "tested",
        level: "mandatory",
      },
      {
        num: "1.7",
        title: <>Les redirections d&rsquo;usage doivent fonctionner</>,
        whyItsImportant: (
          <>
            <p>
              Les redirections automatiques permettent de garantir un accès à un
              site internet sécurisé malgré une adresse fonctionnelle en HTTP.
              Les redirections sont importantes car elles permettent :
            </p>
            <ul>
              <li>
                de garantir l&rsquo;accès au site quelle que soit
                l&rsquo;adresse URL saisie par l&rsquo;usager ;
              </li>
              <li>
                d&rsquo;éviter la duplication de contenu qui nuit au
                référencement ;
              </li>
              <li>de s&rsquo;assurer que tous les accès passent par HTTPS ;</li>
              <li>de maintenir une expérience utilisateur cohérente.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>
              Les redirections d&rsquo;usage principales à configurer pour le
              site internet de votre commune sont :
            </p>
            <ol>
              <li>La redirection automatique de HTTP vers HTTPS ;</li>
              <li>
                La redirection des variantes du nom de domaine vers la version
                canonique :
                <ul>
                  <li>
                    De <strong>commune.fr</strong> vers{" "}
                    <strong>www.commune.fr</strong> (ou l&rsquo;inverse) ;
                  </li>
                  <li>
                    Des anciennes adresses vers la nouvelle en cas de
                    changement.
                  </li>
                </ul>
              </li>
            </ol>
            <p>
              Ces redirections doivent être configurées au niveau du serveur web
              ou de l&rsquo;hébergement et doivent être vérifiées régulièrement
              par vos soins, votre hébergeur ou votre prestataire technique.
            </p>
          </>
        ),
        type: "tested",
        level: "recommended",
      },
      {
        num: "1.8",
        title: (
          <>
            L&rsquo;adresse du site déclarée sur Service-Public.fr doit être en
            HTTPS
          </>
        ),
        whyItsImportant: (
          <>
            <p>
              Si le site internet de votre commune utilise effectivement le
              protocole HTTPS, son adresse doit l&rsquo;indiquer
              lorsqu&rsquo;elle est renseignée dans Service-Public.fr. En effet,
              malgré l&rsquo;utilisation d&rsquo;un protocole HTTPS, les données
              de nombreuses adresses de sites communaux ne sont pas à jour sur
              Service-Public.fr. Pourtant :
            </p>
            <ul>
              <li>cela évite un passage initial non sécurisé par HTTP ;</li>
              <li>
                les usagers sont directement dirigés vers la version sécurisée ;
              </li>
              <li>les moteurs de recherche privilégient les liens HTTPS ;</li>
              <li>cela démontre le professionnalisme de la collectivité.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <div>
              Pour mettre à jour l&rsquo;adresse du site internet de votre
              commune sur {DILA_LINK} :
            </div>
            <ol>
              <li>
                Accédez à la page de votre commune grâce à la barre de recherche
                ;
              </li>
              <li>Demandez la modification de la page ;</li>
              <li>Renseignez votre adresse de messagerie professionnelle ;</li>
              <li>
                Mettez à jour la section &quot;Contacts web&quot; en remplaçant{" "}
                <strong>http://</strong> par <strong>https://</strong>
              </li>
            </ol>
          </>
        ),
        type: "declarative",
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
            {DILA_INTRO}
            <div>
              La déclaration d&rsquo;une adresse de messagerie officielle est
              essentielle car :
            </div>
            <ul>
              <li>
                elle est le point de contact officiel principal pour les usagers
                ;
              </li>
              <li>
                elle permet aux administrations de contacter votre commune de
                manière sécurisée ;
              </li>
              <li>
                elle participe à la transparence administrative et au bon
                fonctionnement du service public ;
              </li>
              <li>c&rsquo;est une obligation légale pour les collectivités.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            Pour déclarer l&rsquo;adresse de messagerie de votre commune sur{" "}
            {DILA_LINK} :
            <ol>
              <li>
                Accédez à la page de votre commune grâce à la barre de recherche
                ;
              </li>
              <li>Demandez la modification de la page ;</li>
              <li>Renseignez votre adresse de messagerie professionnelle ;</li>
              <li>Mettez à jour la section &quot;Contacts web&quot; ;</li>
              <li>
                Envoyez votre demande, elle sera prise en compte sous 48h.
              </li>
            </ol>
          </>
        ),
        type: "declarative",
        level: "mandatory",
      },
      {
        num: "2.2",
        title: (
          <>
            L&rsquo;adresse de messagerie ne doit pas utiliser un domaine
            générique
          </>
        ),
        whyItsImportant: (
          <>
            <p>
              Un domaine dit générique est un nom de domaine ne comportant pas
              le nom de la commune et ne permettant donc pas de
              l&rsquo;identifier formellement dans ses échanges électroniques
              via son adresse de messagerie.
            </p>
            <div>
              Les domaines génériques les plus utilisés par les communes
              françaises sont <strong>wanadoo.fr</strong>,{" "}
              <strong>orange.fr</strong> ou encore <strong>gmail.com</strong> et
              présentent plusieurs risques :
            </div>
            <ul>
              <li>
                impossibilité pour les émetteurs et destinataires de messages
                électroniques de s&rsquo;assurer l&rsquo;identité de leurs
                interlocuteurs ;
              </li>
              <li>
                non-conformité avec les bonnes pratiques de
                l&rsquo;administration numérique ;
              </li>
              <li>
                absence de contrôle sur la sécurité et la confidentialité des
                échanges ;
              </li>
              <li>perte de souveraineté sur les données échangées.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <div>
              Pour doter votre commune d&rsquo;une adresse de messagerie
              professionnelle sécurisée :
            </div>
            <ol>
              <li>
                Utilisez le même nom de domaine que le site internet de votre
                commune ;
              </li>
              <li>
                Optez pour une solution de messagerie professionnelle :
                <ul>
                  <li>
                    solution proposée par la structure de mutualisation de votre
                    département ;
                  </li>
                  <li>
                    solution proposée par un éditeur privé sélectionné par votre
                    commune ;
                  </li>
                  <li>solution proposée par la Suite territoriale.</li>
                </ul>
              </li>
              <li>
                Mettez en place une politique de transition :
                <ul>
                  <li>
                    informez vos contacts du changement d&rsquo;adresse de
                    messagerie ;
                  </li>
                  <li>
                    configurez une réponse automatique sur l&rsquo;ancienne
                    adresse ;
                  </li>
                  <li>
                    maintenez l&rsquo;ancienne adresse quelques mois en
                    parallèle ;
                  </li>
                  <li>
                    mettez à jour les informations relatives à la messagerie de
                    votre commune sur {DILA_LINK}.
                  </li>
                </ul>
              </li>
            </ol>
          </>
        ),
        type: "declarative",
        level: "mandatory",
      },
      {
        num: "2.3",
        title: (
          <>Le domaine de la messagerie doit correspondre au domaine du site</>
        ),
        whyItsImportant: (
          <>
            <div>
              La cohérence entre le domaine du site internet et de
              l&rsquo;adresse de messagerie de votre commune est cruciale car
              elle :
            </div>
            <ul>
              <li>réduit les risques de confusion pour les usagers ;</li>
              <li>
                facilite l&rsquo;identification des communications officielles ;
              </li>
              <li>simplifie la gestion technique des services numériques ;</li>
              <li>renforce la présence numérique de votre collectivité.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour assurer cette cohérence :</p>
            <ol>
              <li>
                Identifiez le nom de domaine principal du site internet de votre
                commune ;
              </li>
              <li>
                Créez des adresses de messagerie utilisant ce même domaine ;
              </li>
              <li>
                Planifiez la migration des anciennes adresses de messagerie si
                nécessaire :
                <ul>
                  <li>informez vos contacts du changement ;</li>
                  <li>mettez en place des redirections temporaires ;</li>
                  <li>mettez à jour tous vos supports de communication.</li>
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
        title: <>Un enregistrement MX doit être configuré</>,
        whyItsImportant: (
          <>
            <div>
              Les enregistrements MX (<i>Mail Exchanger</i>) du nom de domaine
              indiquent quel serveur de messagerie est responsable de la
              réception des e-mails. Ils sont fondamentaux car :
            </div>
            <ul>
              <li>
                ils permettent la réception des e-mails adressés à votre domaine
                ;
              </li>
              <li>
                leur absence rend impossible toute communication entrante ;
              </li>
              <li>
                une mauvaise configuration peut causer des pertes de messages.
              </li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <div>Pour configurer les enregistrements MX :</div>
            <ol>
              <li>
                Identifiez les serveurs de messagerie de votre hébergeur ;
              </li>
              <li>Accédez à la zone DNS de votre domaine ;</li>
              <li>Créez les enregistrements MX avec les bonnes priorités ;</li>
              <li>
                Vérifiez la configuration avec des outils comme{" "}
                <Link href="https://mxtoolbox.com" target="_blank">
                  MXToolbox
                </Link>{" "}
                ou{" "}
                <Link href="https://intodns.com" target="_blank">
                  IntoDNS
                </Link>
                .
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
        title: <>Un enregistrement SPF doit être configuré</>,
        whyItsImportant: (
          <>
            <div>
              SPF (<i>Sender Policy Framework</i>) est un mécanisme qui permet
              de vérifier que seuls les serveurs autorisés peuvent envoyer des
              messages au nom d&rsquo;un domaine, aidant ainsi à prévenir le
              spam et l&rsquo;usurpation d&rsquo;identité. SPF est un mécanisme
              important de sécurité d&rsquo;une messagerie qui :
            </div>
            <ul>
              <li>
                empêche l&rsquo;usurpation de votre nom de domaine pour
                l&rsquo;envoi de messages frauduleux ;
              </li>
              <li>améliore la délivrabilité de vos messages légitimes ;</li>
              <li>protège votre réputation numérique.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <div>
              Pour configurer un enregistrement SPF sur votre nom de domaine :
            </div>
            <ol>
              <li>
                identifiez tous vos serveurs de messagerie d&rsquo;envoi
                d&rsquo;emails légitimes ;
              </li>
              <li>
                Créez un enregistrement TXT dans votre zone DNS avec la syntaxe
                appropriée ;
              </li>
              <li>
                Testez votre configuration avec des outils comme{" "}
                <Link
                  href="https://www.dmarcanalyzer.com/spf/checker/"
                  target="_blank"
                >
                  SPF Record Checker
                </Link>
              </li>
            </ol>
            <p>
              Consultez le{" "}
              <Link
                href="https://cyber.gouv.fr/sites/default/files/2020/06/anssi-guide-passerelle_internet_securisee-v3.pdf"
                target="_blank"
              >
                guide de configuration de l&rsquo;ANSSI en rubrique 5.4.1
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
        title: <>Un enregistrement DMARC doit être configuré</>,
        whyItsImportant: (
          <>
            <div>
              Le mécanisme DMARC (
              <i>
                Domain-based Message Authentication, Reporting and Conformance
              </i>
              ) est important car :
            </div>
            <ul>
              <li>
                Il permet de détecter et bloquer les tentatives
                d&rsquo;usurpation d&rsquo;identité par email ;
              </li>
              <li>
                Il fournit des rapports détaillés sur les tentatives
                d&rsquo;utilisation frauduleuse du domaine ;
              </li>
              <li>
                Il renforce la confiance des destinataires dans vos
                communications ;
              </li>
              <li>
                Il complète les protections SPF et DKIM pour une sécurité
                optimale.
              </li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <div>Pour mettre en place DMARC :</div>
            <ol>
              <li>
                Créez un enregistrement DNS de type TXT pour{" "}
                <strong>_dmarc.votredomaine.fr</strong> ;
              </li>
              <li>
                Commencez avec une politique permissive (<strong>p=none</strong>
                ) pour observer sans bloquer ;
              </li>
              <li>Configurez une adresse email pour recevoir les rapports ;</li>
              <li>
                Analysez les rapports et ajustez progressivement la politique.
              </li>
            </ol>
            <p>
              Consultez le{" "}
              <Link
                href="https://cyber.gouv.fr/sites/default/files/2020/06/anssi-guide-passerelle_internet_securisee-v3.pdf"
                target="_blank"
              >
                guide de configuration de l&rsquo;ANSSI en rubrique 5.4.3
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
            L&rsquo;enregistrement DMARC doit utiliser une politique de
            quarantaine
          </>
        ),
        whyItsImportant: (
          <>
            <p>
              Une politique de quarantaine DMARC (<strong>p=quarantine</strong>{" "}
              ou <strong>p=reject</strong>) est importante car :
            </p>
            <ul>
              <li>Elle applique un traitement strict aux emails suspects ;</li>
              <li>
                Elle réduit significativement les risques d&rsquo;hameçonnage ;
              </li>
              <li>Elle démontre un engagement fort pour la sécurité email ;</li>
              <li>Elle protège activement la réputation de la collectivité.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <div>Pour configurer une politique de quarantaine :</div>
            <ol>
              <li>
                Assurez-vous que SPF et DKIM sont correctement configurés ;
              </li>
              <li>
                Modifiez l&rsquo;enregistrement DMARC pour inclure{" "}
                <strong>p=quarantine</strong> ou <strong>p=reject</strong> ;
              </li>
              <li>
                Surveillez les rapports DMARC pour détecter d&rsquo;éventuels
                faux positifs ;
              </li>
              <li>
                N&rsquo;utilisez pas un pourcentage (champ <i>pct</i>) inférieur
                à 100%.
              </li>
            </ol>
            <p>
              Vous pouvez passer progressivement à cette politique en augmentant
              graduellement le pourcentage.
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
        Pourquoi certains critères sont-ils essentiels et d&rsquo;autres
        recommandés ?
      </>
    ),
    answer: (
      <>
        <p>Cette distinction reflète deux niveaux d&rsquo;exigence :</p>
        <ul>
          <li>
            Les critères <strong>essentiels</strong> correspondent au niveau
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
          l&rsquo;ensemble des critères, essentiels comme recommandés.
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
          est fortement recommandée pour toutes les collectivités, cependant
          elle n&rsquo;est malheureusement pas encore testable automatiquement
          car elle dépend d&rsquo;un <i>sélecteur</i> qui peut être
          arbitrairement choisi par l&rsquo;expéditeur. Nous avons à cœur de
          n&rsquo;utiliser que des critères automatiquement vérifiables dans ce
          référentiel.
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

const getAllRefs = () => {
  const refs: string[] = [];
  ReferentielConformite.forEach((section) => {
    section.items.forEach((item) => {
      refs.push(item.num);
    });
  });
  return refs.join(",");
};

const ReferentielPage: NextPage = () => {
  const router = useRouter();
  const isSmallScreen = useSmallScreen(1000);

  const handleCommuneSelect = (selectedCommune: Commune) => {
    router.push(`/bienvenue/${selectedCommune.siret}`);
  };

  const [stats, setStats] = useState<Record<
    string,
    Array<{
      ref: string;
      valid: number;
      total: number;
      valid_pop: number;
      total_pop: number;
    }>
  > | null>(null);

  useEffect(() => {
    fetch(`/api/rcpnt/stats?scope=global&refs=${getAllRefs()}`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Error loading conformance stats:", err));
  }, []);

  const getStatsForRef = (ref: string) => {
    if (!stats || !stats.global) return null;

    const stat = stats.global.find((s) => s.ref === ref);
    if (!stat) return null;

    return {
      percentage:
        stat.total > 0
          ? Math.round((stat.valid / stat.total) * 10000) / 100
          : 0,
      valid: stat.valid,
      total: stat.total,
      valid_pop: stat.valid_pop,
      total_pop: stat.total_pop,
    };
  };

  return (
    <>
      <NextSeo
        title="Référentiel de Conformité de la Présence Numérique des Territoires"
        description="Référentiel de Conformité de la Présence Numérique des Territoires"
      />

      <HeroSection>
        <div className={fr.cx("fr-container", "fr-pt-5w")}>
          <div style={{ textAlign: "center" }}>
            <h1
              className={fr.cx("fr-h1", "fr-mb-2w")}
              style={{ color: "var(--text-title-blue-france)" }}
            >
              Référentiel de Conformité
              <br /> de la Présence Numérique des Territoires
            </h1>
            <p className={fr.cx("fr-text--lg")}>
              RCPNT version 0.1 - Publié le 3 Avril 2025
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
                    type="commune"
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
                À propos du Référentiel
              </h2>
              <div className={fr.cx("fr-text--lg", "fr-mb-5w")}>
                <p>
                  Le{" "}
                  <strong>
                    Référentiel de Conformité de la Présence Numérique des
                    Territoires
                  </strong>{" "}
                  est établit par l&rsquo;Agence nationale de la cohésion des
                  territoires (
                  <Link href="https://anct.gouv.fr/" target="_blank">
                    ANCT
                  </Link>
                  ).
                </p>
                <p>
                  Il vise à protéger les collectivités territoriales dans leurs
                  usages numériques en évaluant quotidiennement les critères
                  fondamentaux qui leur garantissent une présence en ligne{" "}
                  <strong>sécurisée et professionnelle</strong>.
                </p>
                <p>
                  Ce référentiel s&rsquo;articule autour de deux axes principaux
                  : le <strong>site internet institutionnel</strong> et l&rsquo;
                  <strong>adresse de messagerie professionnelle</strong>. Ces
                  éléments constituent le socle de la présence numérique
                  d&rsquo;une collectivité. Ils garantissent la sécurité des
                  échanges numériques et permettent de maintenir la confiance
                  des usagers.
                </p>

                <p>
                  Chaque critère est classé selon son niveau d&rsquo;importance
                  (<strong>essentiel</strong> ou <strong>recommandé</strong>) et
                  son mode de vérification (<strong>déclaratif</strong> à partir
                  des données connues par l&rsquo;administration française ou{" "}
                  <strong>testé quotidiennement</strong> par l&rsquo;ANCT).
                </p>
                <p>
                  Les <Link href="/services">services</Link> proposés par la
                  Suite territoriale peuvent aider les collectivités qui le
                  souhaitent à répondre à ces critères.
                </p>
              </div>
            </div>

            {ReferentielConformite.map((section) => (
              <div key={section.id} id={section.id} className="rcpnt-section">
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
                                ? "Essentiel"
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
                            Pourquoi est-ce important ?
                          </h4>
                          <div className={fr.cx("fr-mb-2w")}>
                            {item.whyItsImportant}
                          </div>

                          <h4 className={fr.cx("fr-text--bold", "fr-mb-1w")}>
                            Comment s&rsquo;y conformer ?
                          </h4>
                          <div>{item.howToFix}</div>

                          <Notice
                            className={fr.cx("fr-mt-3w")}
                            title={
                              !stats ? (
                                "Chargement des statistiques..."
                              ) : (
                                <>{getStatsForRef(item.num)?.percentage}%</>
                              )
                            }
                            description={
                              stats &&
                              getStatsForRef(item.num) && (
                                <>des communes répondent à ce critère.</>
                              )
                            }
                          />
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
