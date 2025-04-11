import CommuneSearch from "@/components/CommuneSearch";
import ContactUs from "@/components/ContactUs";
import FaqList from "@/components/FaqList";
import HeroSection from "@/components/HeroSection";
import { useSmallScreen } from "@/lib/hooks";
import { Commune } from "@/types";
import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import Image from "next/image";
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
  logo: string;
};

const DILA_LINK = (
  <Link href="https://www.service-public.fr" target="_blank">
    Service-Public.fr
  </Link>
);

const REF_INTRO = (
  <>
    <p>
      Le <strong>Référentiel de Conformité de la Présence Numérique des Territoires</strong> (RCPNT)
      est édité par l&rsquo;
      <Link href="https://anct.gouv.fr/" target="_blank">
        Agence nationale de la cohésion des territoires
      </Link>{" "}
      (ANCT). Il vise à garantir l&rsquo;identification officielle des collectivités dans leurs
      usages numériques afin de renforcer leur sécurité en ligne et la confiance des usagers.
    </p>
    <p>
      Les critères sont classés selon deux niveaux d&rsquo;importance : <strong>essentiel</strong>{" "}
      ou <strong>recommandé</strong>. La conformité des collectivités est vérifiée quotidiennement à
      partir des données connues de l&rsquo;administration française et de la Suite territoriale. Le
      référentiel est structuré en deux parties qui correspondent aux principaux usages d&rsquo;un
      nom de domaine : le site internet et l&rsquo;adresse de messagerie de la collectivité.
    </p>
  </>
);

const ReferentielConformite: ReferentielSection[] = [
  {
    id: "site-internet",
    title: "1. Le site internet",
    logo: "/images/rcpnt-site.svg",
    items: [
      {
        num: "1.1",
        title: <>Un site internet doit être déclaré auprès de Service-Public.fr</>,
        whyItsImportant: (
          <>
            <p>
              Si la collectivité a un site internet, il doit être renseigné au sein de
              l&rsquo;Annuaire de l&rsquo;administration sur {DILA_LINK}.
            </p>
            <p>
              L&rsquo;ensemble des informations inscrites sur les pages de mairie de {DILA_LINK}{" "}
              constitue un jeu de données de référence pouvant être utilisé par les usagers et les
              services de l&rsquo;État. Elles sont maintenues par la direction de
              l&rsquo;information légale et administrative (DILA) et doivent être mises à jour par
              la mairie.
            </p>
          </>
        ),
        howToFix: (
          <>
            Pour déclarer le site internet de votre commune sur {DILA_LINK} :
            <ol>
              <li>Accédez à la page de votre mairie grâce à la barre de recherche&nbsp;;</li>
              <li>En bas de page, cliquez sur «&nbsp;Mettre cette page à jour&nbsp;»&nbsp;;</li>
              <li>
                Renseignez votre site internet au format <strong>https://[commune].fr</strong> dans
                la section «&nbsp;Contacts web&nbsp;».
              </li>
              <li>Envoyez votre demande. Elle sera examinée sous 48 heures.</li>
            </ol>
          </>
        ),
        type: "declarative",
        level: "mandatory",
      },
      {
        num: "1.2",
        title: <>Le site internet doit utiliser une extension de domaine souveraine</>,
        whyItsImportant: (
          <>
            <p>
              Seules les extensions géographiques administrées par un organisme français sont jugées
              conformes pour une administration publique locale. Elles permettent d&rsquo;instaurer
              une marque de confiance et de bénéficier de recours en cas de typosquatting.
            </p>
            <p>Ces extensions sont, pour chaque niveau :</p>
            <ul>
              <li>
                <strong>National</strong> : .fr
              </li>
              <li>
                <strong>Régional</strong> : .alsace, .bzh, .corsica, .paris, .eu
              </li>
              <li>
                <strong>Outre-mer</strong> : .re, .yt, .gp, .mq, .gf, .pm, .wf, .tf, .nc, .pf
              </li>
            </ul>
            <p>
              Toute autre extension est considérée comme non conforme. L&rsquo;extension{" "}
              <strong>.com</strong> notamment est réservée aux usages commerciaux, et{" "}
              <strong>.org</strong> aux activités associatives.
            </p>
          </>
        ),
        howToFix: (
          <>
            <p>Pour obtenir une extension de domaine conforme :</p>
            <ol>
              <li>
                <Link
                  href="https://www.afnic.fr/noms-de-domaine/tout-savoir/creer-un-nom-de-domaine/"
                  target="_blank"
                  rel="noopener"
                >
                  Vérifiez la disponibilité du domaine
                </Link>{" "}
                au format <strong>[commune].[extension]</strong>&nbsp;;
              </li>
              <li>
                Effectuez la demande auprès d&rsquo;un{" "}
                <Link
                  href="https://www.afnic.fr/noms-de-domaine/tout-savoir/annuaire-bureaux-enregistrement/"
                  target="_blank"
                  rel="noopener"
                >
                  bureau d&rsquo;enregistrement
                </Link>{" "}
                agréé.
              </li>
            </ol>
            <p>
              Si le nom de domaine souhaité est occupé par une entité qui n&rsquo;est pas légitime,
              vous pouvez entamer une{" "}
              <Link
                href="https://www.afnic.fr/noms-de-domaine/resoudre-un-litige/procedure-de-mediation/"
                target="_blank"
              >
                médiation
              </Link>{" "}
              auprès de l&rsquo;Afnic.
            </p>
          </>
        ),
        type: "declarative",
        level: "mandatory",
      },
      {
        num: "1.3",
        title: <>Le site internet doit être joignable</>,
        whyItsImportant: (
          <>
            <p>
              Un site internet est dit injoignable lorsqu&rsquo;il renvoie vers une page
              d&rsquo;erreur ou une page blanche. Cette indisponibilité a des impacts directs pour
              la collectivité :
            </p>
            <ul>
              <li>
                Impossibilité pour les usagers d&rsquo;accéder à l&rsquo;information officielle de
                votre commune ou aux services en ligne&nbsp;;
              </li>
              <li>Perte de confiance dans la présence numérique de la collectivité&nbsp;;</li>
              <li>Risque de confusion avec des sites frauduleux&nbsp;;</li>
              <li>Perturbation du service public.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>
              Pour tester la disponibilité du site internet de votre collectivité, vous pouvez
              utiliser un de ces services :
            </p>
            <ul>
              <li>
                <Link href="https://downforeveryoneorjustme.com/" target="_blank">
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
            <p>
              En cas d&rsquo;indisponibilité, l&rsquo;ANCT vous recommande de suivre ces étapes, en
              autonomie ou à l&rsquo;aide de votre prestataire informatique :
            </p>
            <ol>
              <li>Vérifiez l&rsquo;état de votre hébergement et son tableau de bord&nbsp;;</li>
              <li>Contrôlez les enregistrements DNS de votre nom de domaine&nbsp;;</li>
              <li>
                Examinez les logs du serveur web pour identifier d&rsquo;éventuelles erreurs&nbsp;;
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
              Le protocole HTTPS «&nbsp;protocole de transfert hypertextuel sécurisé&nbsp;» garantit
              la confidentialité et l&rsquo;intégrité des données échangées entre l&rsquo;usager et
              le site. Il est facilement reconnaissable dans l&rsquo;URL du site (https://) ou par
              la présence d&rsquo;une icône de cadenas dans la barre d&rsquo;adresse du navigateur.
            </p>
            <p>
              Sans ce protocole, les données transmises peuvent être interceptées ou modifiées par
              des acteurs malveillants. Certains navigateurs affichent des avertissements de
              sécurité sur ces sites non sécurisés pouvant effrayer l&rsquo;usager.
            </p>
          </>
        ),
        howToFix: (
          <>
            <p>Pour obtenir un protocole sécurisé HTTPS pour le site internet de votre commune :</p>
            <ol>
              <li>
                Utilisez un service comme{" "}
                <Link href="https://letsencrypt.org/fr/" target="_blank">
                  Let&rsquo;s Encrypt
                </Link>{" "}
                pour obtenir un certificat SSL gratuitement&nbsp;;
              </li>
              <li>
                Allez sur votre espace client de votre hébergeur, section «&nbsp;Certificat
                SSL&nbsp;» ou «&nbsp;HTTPS&nbsp;»&nbsp;;
              </li>
              <li>
                Configurez dans votre serveur web la redirection automatique HTTP vers HTTPS (selon
                votre site, il peut-être votre hébergeur, Wordpress ou autre)&nbsp;;
              </li>
              <li>
                En cas de problème, contactez votre hébergeur ou votre prestataire technique qui
                pourront vous accompagner dans cette démarche.
              </li>
            </ol>
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
            <p>
              Le certificat SSL (<i>Secure Sockets Layer</i>) est un certificat numérique qui assure
              l&rsquo;authenticité du site internet de la collectivité. Il doit être renouvelé
              chaque année. Un certificat SSL invalide pose plusieurs problèmes :
            </p>
            <ul>
              <li>La confidentialité des échanges n&rsquo;est plus garantie&nbsp;;</li>
              <li>Le site internet peut devenir inaccessible sur certains navigateurs&nbsp;;</li>
              <li>
                Certains navigateurs affichent des avertissements de sécurité qui effraient les
                usagers&nbsp;;
              </li>
              <li>La collectivité apparaît comme négligente de sa sécurité numérique.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour maintenir un certificat SSL valide pour le site internet de votre commune :</p>
            <ol>
              <li>Vérifiez la date d&rsquo;expiration de votre certificat actuel&nbsp;;</li>
              <li>
                Configurez le renouvellement automatique si possible (recommandé avec le service
                gratuit{" "}
                <Link href="https://letsencrypt.org/fr/" target="_blank">
                  Let&rsquo;s Encrypt
                </Link>
                )&nbsp;;
              </li>
              <li>Mettez en place une surveillance des dates d&rsquo;expiration&nbsp;;</li>
              <li>Vérifiez que le certificat correspond bien au nom de domaine utilisé.</li>
            </ol>
            <p>
              En cas de difficultés, contactez votre hébergeur ou votre prestataire technique qui
              pourront vous accompagner dans cette démarche.
            </p>
          </>
        ),
        type: "tested",
        level: "mandatory",
      },
      {
        num: "1.6",
        title: <>Le site déclaré sur Service-Public.fr ne doit pas rediriger ailleurs</>,
        whyItsImportant: (
          <>
            <p>
              Si le site internet renseigné sur l&rsquo;Annuaire de l&rsquo;administration de{" "}
              {DILA_LINK} redirige vers un autre nom de domaine, celui-ci ne peut pas être considéré
              comme le site officiel de la collectivité.
            </p>
          </>
        ),
        howToFix: (
          <>
            <p>
              Vérifiez que le site internet déclaré sur {DILA_LINK} ne redirige pas vers un autre
              nom de domaine. Si c&rsquo;est le cas, mettez à jour l&rsquo;adresse de votre site
              internet sur {DILA_LINK} :
            </p>
            <ol>
              <li>Accédez à la page de votre mairie grâce à la barre de recherche&nbsp;;</li>
              <li>En bas de page, cliquez sur «&nbsp;Mettre cette page à jour&nbsp;»&nbsp;;</li>
              <li>
                Renseignez la nouvelle adresse de votre site internet au format{" "}
                <strong>https://[commune].fr</strong> dans la section «&nbsp;Contacts web&nbsp;».
              </li>
              <li>Envoyez votre demande. Elle sera examinée sous 48 h.</li>
            </ol>
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
              Les redirections automatiques permettent de garantir un accès à un site internet
              sécurisé malgré une adresse internet en HTTP. Les redirections sont importantes, car
              elles permettent :
            </p>
            <ul>
              <li>
                De garantir l&rsquo;accès au site quelle que soit l&rsquo;adresse URL saisie par
                l&rsquo;usager&nbsp;;
              </li>
              <li>D&rsquo;éviter la duplication de contenu qui nuit au référencement&nbsp;;</li>
              <li>De s&rsquo;assurer que tous les accès passent par HTTPS&nbsp;;</li>
              <li>De maintenir une expérience utilisateur cohérente.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>
              Les redirections d&rsquo;usage principales à configurer pour le site internet de votre
              collectivité sont :
            </p>
            <ul>
              <li>La redirection automatique de HTTP vers HTTPS&nbsp;;</li>
              <li>
                La redirection des variantes du nom de domaine vers la version principale :
                <ul>
                  <li>
                    De <strong>commune.fr</strong> vers <strong>www.commune.fr</strong> (ou
                    l&rsquo;inverse)&nbsp;;
                  </li>
                  <li>Des anciennes adresses vers la nouvelle en cas de changement.</li>
                </ul>
              </li>
            </ul>
            <p>
              Ces redirections doivent être configurées au niveau du serveur web ou de
              l&rsquo;hébergement et doivent être vérifiées régulièrement par vos soins, votre
              hébergeur ou votre prestataire technique.
            </p>
          </>
        ),
        type: "tested",
        level: "recommended",
      },
      {
        num: "1.8",
        title: <>L&rsquo;adresse du site déclarée sur Service-Public.fr doit être en HTTPS</>,
        whyItsImportant: (
          <>
            <p>
              Si le site internet de votre commune utilise effectivement le protocole HTTPS, il est
              nécessaire de le renseigner dans {DILA_LINK} :
            </p>
            <ul>
              <li>Cela évite un passage initial non sécurisé par HTTP&nbsp;;</li>
              <li>Les usagers sont directement dirigés vers la version sécurisée&nbsp;;</li>
              <li>Les moteurs de recherche privilégient les liens HTTPS&nbsp;;</li>
              <li>Cela démontre le professionnalisme de la collectivité.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>
              Pour mettre à jour l&rsquo;adresse du site internet de votre commune sur {DILA_LINK} :
            </p>
            <ol>
              <li>Accédez à la page de votre mairie grâce à la barre de recherche&nbsp;;</li>
              <li>En bas de page, cliquez sur «&nbsp;Mettre cette page à jour&nbsp;»&nbsp;;</li>
              <li>
                Assurez-vous de remplir correctement la section «&nbsp;Contacts web&nbsp;», en
                remplaçant
                <strong>http://</strong> par <strong>https://</strong>&nbsp;;
              </li>
              <li>Envoyez votre demande. Elle sera examinée sous 48 h.</li>
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
    title: "2. La messagerie",
    logo: "/images/rcpnt-messagerie.svg",
    items: [
      {
        num: "2.1",
        title: <>Une adresse de messagerie doit être déclarée sur Service-Public.fr</>,
        whyItsImportant: (
          <>
            <p>
              L&rsquo;adresse de messagerie doit être correctement renseignée au sein de
              l&rsquo;Annuaire de l&rsquo;administration de {DILA_LINK}. L&rsquo;ensemble des
              informations inscrites sur les pages de mairie de {DILA_LINK} constitue un jeu de
              données pouvant être utilisé par les usagers et les services de l&rsquo;État. Elles
              sont maintenues par la direction de l&rsquo;information légale et administrative
              (DILA) et doivent être mises à jour par la mairie.
            </p>
            <p>
              La déclaration d&rsquo;une adresse de messagerie officielle est primordiale, car :
            </p>
            <ul>
              <li>Elle est le point de contact officiel principal pour les usagers&nbsp;;</li>
              <li>
                Elle participe à la transparence administrative et au bon fonctionnement du service
                public&nbsp;;
              </li>
              <li>C&rsquo;est une obligation légale pour les collectivités.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>
              Pour déclarer l&rsquo;adresse de messagerie de votre collectivité sur {DILA_LINK} :
            </p>
            <ol>
              <li>Accédez à la page de votre mairie grâce à la barre de recherche&nbsp;;</li>
              <li>En bas de page, cliquez sur «&nbsp;Mettre cette page à jour&nbsp;»&nbsp;;</li>
              <li>
                Renseignez correctement votre adresse de messagerie dans la section
                «&nbsp;Emails&nbsp;»&nbsp;;
              </li>
              <li>Envoyez votre demande. Elle sera examinée sous 48 h.</li>
            </ol>
          </>
        ),
        type: "declarative",
        level: "mandatory",
      },
      {
        num: "2.2",
        title: <>L&rsquo;adresse de messagerie ne doit pas utiliser un nom de domaine générique</>,
        whyItsImportant: (
          <>
            <p>
              Un nom de domaine est dit générique lorsqu&rsquo;il ne comporte pas le nom de la
              collectivité (par exemple : <strong>accueil@mairie-brigny.fr</strong>). Les domaines
              génériques les plus utilisés par les communes françaises sont{" "}
              <strong>wanadoo.fr</strong>, <strong>orange.fr</strong> ou encore{" "}
              <strong>gmail.com</strong> et présentent plusieurs risques :
            </p>
            <ul>
              <li>
                Impossibilité pour les émetteurs et destinataires de messages électroniques de
                s&rsquo;assurer formellement de l&rsquo;identité de leurs interlocuteurs&nbsp;;
              </li>
              <li>
                Non-conformité avec les bonnes pratiques de l&rsquo;administration numérique&nbsp;;
              </li>
              <li>Absence de contrôle sur la sécurité et la confidentialité des échanges&nbsp;;</li>
              <li>Perte de souveraineté sur les données échangées.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour obtenir une adresse de messagerie avec le nom de votre collectivité :</p>
            <ol>
              <li>
                Optez pour une solution de messagerie professionnelle en utilisant le même nom de
                domaine que le site internet de votre commune (ce nom de domaine doit correspondre
                au <Link href="#1.2">critère 1.2</Link>) :
                <ul>
                  <li>
                    Solution proposée par la structure de mutualisation de votre département&nbsp;;
                  </li>
                  <li>
                    Solution proposée par un éditeur privé sélectionné par votre commune&nbsp;;
                  </li>
                  <li>Solution proposée par la Suite territoriale.</li>
                </ul>
              </li>
              <li>
                Mettez en place une politique de transition :
                <ul>
                  <li>Informez vos contacts du changement d&rsquo;adresse de messagerie&nbsp;;</li>
                  <li>Configurez une réponse automatique sur l&rsquo;ancienne adresse&nbsp;;</li>
                  <li>
                    Maintenez l&rsquo;ancienne adresse en parallèle durant 3 mois minimum&nbsp;;
                  </li>
                  <li>
                    Mettez à jour les informations relatives à la messagerie de votre commune sur{" "}
                    {DILA_LINK}.
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
        title: <>Le nom de domaine de la messagerie doit correspondre à celui du site</>,
        whyItsImportant: (
          <>
            <p>
              La cohérence entre le nom de domaine du site internet et de l&rsquo;adresse de
              messagerie de votre commune est cruciale, car :
            </p>
            <ul>
              <li>Elle réduit les risques de confusion pour les usagers&nbsp;;</li>
              <li>Elle facilite l&rsquo;identification des communications officielles&nbsp;;</li>
              <li>Elle simplifie la gestion technique des services numériques&nbsp;;</li>
              <li>Elle renforce la présence numérique de votre collectivité.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour assurer cette cohérence :</p>
            <ol>
              <li>
                Identifiez le nom de domaine du site internet principal de votre commune (ce nom de
                domaine doit correspondre aux critères 1.3) ;
              </li>
              <li>
                Créez des adresses de messagerie utilisant ce même domaine avec votre solution de
                messagerie actuelle ou en choisissant une autre solution :
                <ul>
                  <li>
                    Solution proposée par la structure de mutualisation de votre département ;
                  </li>
                  <li>Solution proposée par un éditeur privé sélectionné par votre commune ;</li>
                  <li>Solution proposée par la Suite territoriale.</li>
                </ul>
              </li>
              <li>
                Mettez en place une politique de transition :
                <ul>
                  <li>Informez vos contacts du changement d&rsquo;adresse de messagerie&nbsp;;</li>
                  <li>Configurez une réponse automatique sur l&rsquo;ancienne adresse&nbsp;;</li>
                  <li>
                    Maintenez l&rsquo;ancienne adresse en parallèle durant 3 mois minimum&nbsp;;
                  </li>
                  <li>
                    Mettez à jour les informations relatives à la messagerie de votre commune sur{" "}
                    {DILA_LINK}.
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
        num: "2.4",
        title: <>Un enregistrement MX doit être configuré</>,
        whyItsImportant: (
          <>
            <p>
              Sans les enregistrements MX (<i>Mail Exchanger</i>) vous ne pouvez pas recevoir
              d&rsquo;emails. Ils permettent d&rsquo;indiquer vers quel serveur de messagerie
              (Protonmail, Sendinblue, etc.) vos emails doivent arriver. Ils sont fondamentaux, car
              :
            </p>
            <ul>
              <li>Ils permettent la réception des emails adressés à votre domaine&nbsp;;</li>
              <li>Leur absence rend impossible toute communication entrante&nbsp;;</li>
              <li>Une mauvaise configuration peut causer des pertes de messages.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour configurer les enregistrements MX :</p>
            <ol>
              <li>
                Accédez à l&rsquo;interface du gestionnaire du nom de domaine de messagerie&nbsp;;
              </li>
              <li>Allez à la «&nbsp;zone DNS&nbsp;» ou «&nbsp;enregistrement DNS&nbsp;»&nbsp;;</li>
              <li>
                Créez les enregistrements MX en précisant les priorités adéquates et le nom du
                serveur de messagerie&nbsp;;
              </li>
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
              En cas de difficultés, contactez votre hébergeur ou votre prestataire technique pour
              vous accompagner dans cette démarche.
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
            <p>
              Un enregistrement SPF (<i>Sender Policy Framework</i>) est un système de sécurité pour
              protéger votre adresse de messagerie. Il indique les serveurs de messagerie autorisés
              à envoyer des emails en votre nom. Sans SPF, n&rsquo;importe qui peut se faire passer
              pour vous en envoyant des emails avec votre nom de domaine.
            </p>
            <ul>
              <li>
                Il empêche l&rsquo;usurpation de votre nom de domaine pour l&rsquo;envoi de messages
                frauduleux&nbsp;;
              </li>
              <li>Il améliore la réception des emails que vous envoyez&nbsp;;</li>
              <li>Il protège votre réputation numérique.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour vérifier et configurer un enregistrement SPF sur votre nom de domaine :</p>
            <ol>
              <li>
                Testez votre configuration avec des outils comme{" "}
                <Link href="https://www.dmarcanalyzer.com/spf/checker/" target="_blank">
                  SPF Record Checker
                </Link>
              </li>
              <li>
                Accédez à l&rsquo;interface du gestionnaire du nom de domaine de messagerie&nbsp;;
              </li>
              <li>
                Au sein de la section «&nbsp;Zone DNS&nbsp;» ou «&nbsp;Gestion DNS&nbsp;», ajoutez
                l&rsquo;enregistrement TXT approprié à votre fournisseur de messagerie&nbsp;;
              </li>
              <li>
                Pour trouver et copier le bon enregistrement SPF selon votre fournisseur
                d&rsquo;email, vous pouvez vous rendre sur SPF Record Generator ou SPF Wizard.
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
              pour plus de détails. En cas de difficultés, contactez le gestionnaire du nom de
              domaine de votre messagerie ou votre prestataire technique pour vous accompagner dans
              cette démarche.
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
            <p>
              Le mécanisme DMARC (
              <i>Domain-based Message Authentication, Reporting and Conformance</i>) est un
              protocole de sécurité des emails. Il fonctionne conjointement avec SPF et DKIM pour
              protéger contre les emails malveillants et améliorer la réception de vos emails. Il
              est important, car :
            </p>
            <ul>
              <li>
                Il permet de détecter et bloquer les tentatives d&rsquo;usurpation de courrier
                électronique utilisées dans le phishing et d&rsquo;autres attaques basées sur la
                messagerie&nbsp;;
              </li>
              <li>
                Il fournit des rapports détaillés sur les tentatives d&rsquo;utilisation frauduleuse
                du domaine&nbsp;;
              </li>
              <li>Il renforce la confiance des destinataires dans vos communications&nbsp;;</li>
              <li>
                Il complète les protections SPF (voir critère 2.5) et DKIM pour une sécurité
                optimale.
              </li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour mettre en place DMARC :</p>
            <ol>
              <li>Il est nécessaire au préalable d&rsquo;avoir SPF et DKIM déjà en place&nbsp;;</li>
              <li>
                Accédez à l&rsquo;interface du gestionnaire du nom de domaine de messagerie et
                cherchez une section nommée «&nbsp;Zone DNS&nbsp;» par exemple&nbsp;;
              </li>
              <li>
                Créez un enregistrement TXT de type : <strong>_dmarc.votredomaine.fr</strong> avec
                une politique permissive (p=none) pour observer sans bloquer les emails
                entrants&nbsp;;
              </li>
              <li>Configurez une adresse email pour recevoir les rapports&nbsp;;</li>
              <li>Analysez les rapports et ajustez progressivement la politique.</li>
            </ol>
            <p>
              Consultez le{" "}
              <Link
                href="https://cyber.gouv.fr/sites/default/files/2020/06/anssi-guide-passerelle_internet_securisee-v3.pdf"
                target="_blank"
              >
                guide de configuration de l&rsquo;ANSSI en rubrique 5.4.3
              </Link>{" "}
              pour plus de détails. En cas de difficultés, contactez le gestionnaire du nom de
              domaine de votre messagerie ou votre prestataire technique pour vous accompagner dans
              cette démarche.
            </p>
          </>
        ),
        type: "tested",
        level: "recommended",
      },
      {
        num: "2.7",
        title: <>L&rsquo;enregistrement DMARC doit utiliser une politique de quarantaine</>,
        whyItsImportant: (
          <>
            <p>
              La politique de quarantaine DMARC signale les emails qui échouent à
              l&rsquo;authentification, qualifiés comme suspects, ils seront redirigés vers le
              dossier spam. Après avoir installé et observé le fonctionnement de
              l&rsquo;enregistrement DMARC, la mise en place d&rsquo;une politique de quarantaine
              DMARC est importante, car :
            </p>
            <ul>
              <li>Elle applique un traitement strict aux emails suspects&nbsp;;</li>
              <li>Elle réduit significativement les risques d&rsquo;hameçonnage&nbsp;;</li>
              <li>Elle démontre un engagement fort pour la sécurité email&nbsp;;</li>
              <li>Elle protège activement la réputation de la collectivité.</li>
            </ul>
          </>
        ),
        howToFix: (
          <>
            <p>Pour configurer une politique de quarantaine :</p>
            <ol>
              <li>
                Assurez-vous que SPF (voir critères 2.5) et DKIM sont correctement configurés&nbsp;;
              </li>
              <li>
                Modifiez l&rsquo;enregistrement DMARC pour inclure <strong>p=quarantine</strong> ou{" "}
                <strong>p=reject</strong>&nbsp;;
              </li>
              <li>
                Surveillez les rapports DMARC pour détecter d&rsquo;éventuels faux positifs&nbsp;;
              </li>
              <li>N&rsquo;utilisez pas un pourcentage (champ pct) inférieur à 100%.</li>
            </ol>
            <p>
              Vous pouvez augmenter le niveau de sécurité de cette politique en augmentant
              graduellement le pourcentage.
            </p>
            <p>
              En cas de difficultés, contactez le gestionnaire du nom de domaine de votre messagerie
              ou votre prestataire technique pour vous accompagner dans cette démarche.
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
            Utilisez la barre de recherche en haut de la page pour trouver votre collectivité&nbsp;;
          </li>
          <li>Consultez le rapport détaillé qui s&rsquo;affiche&nbsp;;</li>
          <li>Pour chaque critère non conforme, suivez les recommandations de correction.</li>
        </ol>
        <p>Les vérifications sont effectuées quotidiennement.</p>
      </>
    ),
  },
  {
    question: <>Que faire si je ne peux pas corriger une non-conformité ?</>,
    answer: (
      <>
        <p>Si vous rencontrez des difficultés pour corriger une non-conformité, vous pouvez :</p>
        <ul>
          <li>Contacter votre prestataire informatique habituel&nbsp;;</li>
          <li>Vous rapprocher de votre structure de mutualisation&nbsp;;</li>
          <li>Utiliser le formulaire de contact en bas de page pour obtenir de l&rsquo;aide.</li>
        </ul>
        <p>
          Les services de la Suite territoriale permettent de répondre à l&rsquo;ensemble des
          critères du référentiel.
        </p>
      </>
    ),
  },
  {
    question: <>Les critères vont-ils évoluer ?</>,
    answer: (
      <>
        <p>Le référentiel est voué à évoluer selon :</p>
        <ul>
          <li>l&rsquo;évolution des menaces et des bonnes pratiques de sécurité&nbsp;;</li>
          <li>les retours d&rsquo;expérience des collectivités&nbsp;;</li>
          <li>les nouvelles obligations réglementaires.</li>
        </ul>
        <p>
          Chaque mise à jour majeure sera communiquée avec un délai d&rsquo;adaptation approprié.
        </p>
      </>
    ),
  },
  {
    question: <>Pourquoi certains critères sont-ils essentiels et d&rsquo;autres recommandés ?</>,
    answer: (
      <>
        <p>Cette distinction reflète deux niveaux d&rsquo;exigence :</p>
        <ul>
          <li>
            <strong>les critères essentiels</strong> correspondent au niveau minimal de sécurité
            attendu d&rsquo;une collectivité&nbsp;;
          </li>
          <li>
            <strong>les critères recommandés</strong> permettent d&rsquo;atteindre un niveau de
            sécurité optimal, mais peuvent nécessiter plus de ressources ou de compétences
            techniques.
          </li>
        </ul>
        <p>
          L&rsquo;ANCT encourage toutes les collectivités à viser la conformité avec
          l&rsquo;ensemble des critères, essentiels comme recommandés.
        </p>
      </>
    ),
  },
  {
    question: <>Pourquoi l&rsquo;utilisation de DKIM ne fait-elle pas partie du référentiel ?</>,
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
          est effectivement très fortement recommandée pour toutes les collectivités. Cependant,
          elle n&rsquo;est malheureusement pas encore testable automatiquement, car elle dépend
          d&rsquo;un <i>sélecteur</i> qui peut être arbitrairement choisi par l&rsquo;expéditeur.
          Nous utilisons uniquement des critères automatiquement vérifiables dans le Référentiel.
        </p>
        <p>
          Une future version de ce Référentiel pourra s&rsquo;appuyer sur l&rsquo;envoi régulier
          d&rsquo;emails depuis les adresses de messagerie de la collectivité pour vérifier la
          configuration de DKIM et la délivrabilité des emails en général.
        </p>
      </>
    ),
  },
  {
    question: <>Suis-je obligé(e) d&rsquo;utiliser la Suite territoriale pour être conforme ?</>,
    answer: (
      <>
        <p>
          Non, vous n&rsquo;êtes pas obligé(e) d&rsquo;utiliser la Suite territoriale pour être
          conforme. Vous pouvez utiliser l&rsquo;outil ou la solution de votre choix. Cependant, la
          Suite territoriale propose des services faciles à utiliser pour vous aider à être conforme
          et vous accompagner dans cette démarche.
        </p>
      </>
    ),
  },
  {
    question: <>Le référentiel relève-t-il d&rsquo;une obligation légale ?</>,
    answer: (
      <>
        <p>
          Non, le référentiel n&rsquo;est pour l&rsquo;instant adossé à aucune loi et ne constitue
          par conséquent pas une obligation réglementaire. Il synthétise toutefois les
          recommandations et retours d&rsquo;expérience de plusieurs administrations d&rsquo;État
          (ANCT, ANSSI, DILA), de partenaires (associations d&rsquo;élus, opérateurs publics de
          services numériques) et des collectivités territoriales qui entendent répondre au besoin
          d&rsquo;élever le niveau de sécurité numérique des collectivités.
        </p>
      </>
    ),
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

  const [statsLoadingError, setStatsLoadingError] = useState(false);
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
      .then((res) => {
        if (!res.ok) {
          setStatsLoadingError(true);
        } else {
          return res.json();
        }
      })
      .then((data) => setStats(data));
  }, []);

  const getStatsForRef = (ref: string) => {
    if (!stats || !stats.global) return null;

    const stat = stats.global.find((s) => s.ref === ref);
    if (!stat) return null;

    const total_existing = ref.endsWith(".1")
      ? stat.total
      : (stats.global.find((s) => s.ref === ref.replace(/\.\d+$/, ".1")) || stat).valid;

    return {
      percentage: stat.total > 0 ? Math.round((stat.valid / stat.total) * 10000) / 100 : 0,
      percentage_of_existing:
        stat.total > 0 ? Math.round((stat.valid / total_existing) * 10000) / 100 : 0,
      valid: stat.valid,
      total: stat.total,
      valid_pop: stat.valid_pop,
      total_pop: stat.total_pop,
    };
  };

  // Add this new effect to handle anchor navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash) {
        // Give the DOM time to render
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) element.click();
          //   // Scroll the element into view
          //   element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    };

    // Handle initial load
    handleHashChange();

    // Add event listener for hash changes
    window.addEventListener("hashchange", handleHashChange);

    // Cleanup
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <>
      <NextSeo
        title="RCPNT - Référentiel de Conformité de la Présence Numérique des Territoires"
        description="Garantir l'identification officielle des collectivités dans leurs usages numériques afin de renforcer leur sécurité et la confiance des usagers."
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
            <h2
              className={fr.cx("fr-text--lg", "fr-pt-1w", "fr-mb-2w", "fr-text--bold")}
              style={{
                textAlign: "center",
                color: "var(--text-title-blue-france)",
              }}
            >
              Ma commune est-elle conforme ?
            </h2>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mb-4w")}>
              <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                <div className={fr.cx("fr-search-bar")} style={{ width: "100%" }}>
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
          <div
            className={fr.cx(
              "fr-col-xl-8",
              "fr-col-offset-xl-2",
              "fr-col-lg-10",
              "fr-col-offset-lg-1",
            )}
          >
            <div id="about">
              <div
                className={fr.cx("fr-mb-3w", "fr-text--md")}
                style={{ color: "var(--text-disabled-grey)" }}
                onClick={(e) => {
                  // Easter egg for Thibaud who likes BOLD
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.altKey) {
                    document.body.style.fontWeight = "bold";
                  }
                }}
              >
                Version 0.1, publiée le 10 Avril 2025
              </div>

              <div className={fr.cx("fr-text--lg", "fr-mb-5w")}>{REF_INTRO}</div>
            </div>

            <div id="referentiel">
              {ReferentielConformite.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className={"rcpnt-section " + fr.cx("fr-p-2w", "fr-mb-4w")}
                  style={{ border: "1px solid var(--border-default-blue-france)" }}
                >
                  <div
                    className={fr.cx("fr-px-2w", "fr-py-1w")}
                    style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}
                  >
                    <Image
                      src={section.logo}
                      alt=""
                      width={60}
                      height={60}
                      role="presentation"
                      aria-hidden="true"
                    />
                    <h2
                      className={fr.cx("fr-h2", "fr-py-2w")}
                      style={{ color: "var(--text-title-blue-france)", margin: 0 }}
                    >
                      {section.title}
                    </h2>
                  </div>

                  <div>
                    {section.items.map((item) => (
                      <Accordion
                        key={item.num}
                        titleAs="h3"
                        label={
                          <div
                            id={item.num.toLowerCase()}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              gap: "0.3rem",
                            }}
                          >
                            <span style={{ minWidth: "2rem" }}>{item.num}</span>
                            <span style={{ flex: 1 }}>{item.title}</span>
                            <span
                              className={fr.cx(
                                "fr-badge",
                                "fr-badge--sm",
                                "fr-badge--no-icon",
                                "fr-mr-1w",
                                item.level === "mandatory" ? "fr-badge--success" : "fr-badge--info",
                              )}
                            >
                              {item.level === "mandatory" ? "Essentiel" : "Recommandé"}
                            </span>
                          </div>
                        }
                      >
                        <div className={fr.cx("fr-mb-2w")}>
                          <div>
                            {/*
                            <span className={fr.cx("fr-badge", "fr-badge--sm", "fr-mr-2w")}>
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
                              {item.type === "tested" ? "Testé quotidiennement" : "Déclaratif"}
                            </span>
                            */}

                            <Link
                              href={`#${item.num.toLowerCase()}`}
                              className={fr.cx(
                                "ri-links-line",
                                "fr-icon--md",
                                "fr-mr-1w",
                                "fr-raw-link",
                              )}
                              style={{ color: "var(--text-title-blue-france)", float: "right" }}
                              title="Lien vers ce critère"
                            ></Link>
                          </div>

                          <h4 className={fr.cx("fr-text--bold", "fr-mb-1w", "fr-mt-1w", "fr-h5")}>
                            <span
                              className={fr.cx(
                                "fr-icon-arrow-right-line",
                                "fr-icon--md",
                                "fr-mr-1w",
                              )}
                              style={{ color: "var(--text-title-blue-france)" }}
                              aria-hidden="true"
                            />
                            Pourquoi est-ce important ?
                          </h4>
                          <div className={fr.cx("fr-mb-2w", "fr-pl-4w")}>
                            {item.whyItsImportant}
                          </div>

                          <h4 className={fr.cx("fr-text--bold", "fr-mb-1w", "fr-h5")}>
                            <span
                              className={fr.cx(
                                "fr-icon-arrow-right-line",
                                "fr-icon--md",
                                "fr-mr-1w",
                              )}
                              style={{ color: "var(--text-title-blue-france)" }}
                              aria-hidden="true"
                            />
                            Comment s&rsquo;y conformer ?
                          </h4>
                          <div className={fr.cx("fr-pl-4w")}>{item.howToFix}</div>

                          <div
                            style={{
                              backgroundColor: "var(--background-alt-blue-cumulus)",
                              color: "var(--text-label-blue-cumulus)",
                            }}
                            className={fr.cx("fr-mt-3w", "fr-p-2w")}
                          >
                            <span className={fr.cx("fr-text--bold")}>
                              {statsLoadingError ? (
                                "Erreur lors du chargement des statistiques, veuillez réessayer plus tard."
                              ) : !stats ? (
                                "Chargement des statistiques..."
                              ) : (
                                <>
                                  <span
                                    className={fr.cx(
                                      "fr-icon-info-fill",
                                      "fr-icon--md",
                                      "fr-mr-1w",
                                    )}
                                    aria-hidden="true"
                                  />
                                  {getStatsForRef(item.num)?.percentage_of_existing}%
                                </>
                              )}
                            </span>{" "}
                            <span>
                              {stats && getStatsForRef(item.num) && (
                                <>
                                  des communes{" "}
                                  {!item.num.endsWith(".1") &&
                                    (item.num.startsWith("1.") ? (
                                      <>ayant un site internet</>
                                    ) : (
                                      <>ayant une adresse de messagerie</>
                                    ))}{" "}
                                  sont conformes à ce critère.
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </Accordion>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div id="faq" className={fr.cx("fr-my-8w") + " rcpnt-section"}>
              <h2 className={fr.cx("fr-h2", "fr-mb-3w")}>Foire aux questions</h2>
              <FaqList faqs={FAQS} />
            </div>

            <ContactUs />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferentielPage;
