import BackToTop from "@/components/BackToTop";
import CommuneSearch from "@/components/CommuneSearch";
import ContactUs from "@/components/ContactUs";
import HeroSection from "@/components/HeroSection";
import Newsletter from "@/components/Newsletter";
import StatsSlider from "@/components/StatsSlider";
import { useSmallScreen } from "@/lib/hooks";
import { Commune, StatItem } from "@/types";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

interface ToolItem {
  id: string;
  title: ReactNode;
  description: ReactNode;
  imageSrc: string;
  link: string;
}

interface PartnerItem {
  title: string;
  description: string;
  imageSrc: string;
  link: string;
}

export default function Home() {
  const router = useRouter();
  const isSmallScreen = useSmallScreen(1000);

  const tools: ToolItem[] = [
    {
      id: "identite-numerique",
      title: <>Une identité&nbsp;numérique professionnelle</>,
      description: (
        <>pour les agents publics et les élus locaux de toutes les collectivités territoriales</>
      ),
      imageSrc: "/images/logo-proconnect.svg",
      link: "/services#proconnect",
    },
    {
      id: "socle-services",
      title: <>Un socle&nbsp;de&nbsp;services essentiels</>,
      description: (
        <>
          composé d&rsquo;un nom de domaine conforme, d&rsquo;une messagerie et d&rsquo;un espace de
          stockage
        </>
      ),
      imageSrc: "/images/socle.svg",
      link: "/services",
    },
    {
      id: "ecosysteme-applicatif",
      title: <>Un écosystème&nbsp;d&rsquo;applicatifs mutualisés</>,
      description: (
        <>opérés par l&rsquo;État, les opérateurs de mutualisation et les éditeurs privés</>
      ),
      imageSrc: "/images/ecosysteme.svg",
      link: "/services#ecosysteme",
    },
  ];

  const stats: StatItem[] = [
    {
      value: "32 %",
      title: "sans nom de domaine",
      content: (
        <>
          Selon les données de l&rsquo;Etat, 11&nbsp;000 communes ne disposent pas d&rsquo;un nom de
          domaine permettant une identification formelle en ligne via un site web ou une adresse de
          messagerie.
          <br />
          <br />
          Voir notre{" "}
          <Link
            href="https://grist.incubateur.anct.gouv.fr/o/anct/gVoLeTsdJL8q/Suite-territoriale-Deploiement?embed=true"
            target="_blank"
            rel="noopener"
          >
            Cartographie de conformité
          </Link>
          .
        </>
      ),
    },
    // {
    //   value: "15 %",
    //   title: "sans certificat de sécurité",
    //   content: (
    //     <>
    //       Plus d&rsquo;un site sur trois ne sont pas signés par un protocole
    //       d&rsquo;accès sécurisé (HTTPS) pour la confidentialité des données
    //       échangées.
    //       <br />
    //       <br />
    //       Voir notre{" "}
    //       <Link
    //         href="https://grist.incubateur.anct.gouv.fr/o/anct/gVoLeTsdJL8q/Suite-territoriale-Deploiement?embed=true"
    //         target="_blank"
    //         rel="noopener"
    //       >
    //         Cartographie de conformité
    //       </Link>
    //       .
    //     </>
    //   ),
    // },
    {
      value: "8 %",
      title: "extensions non conformes",
      content: (
        <>
          2 900 sites web de communes utilisent une extension inadéquate (.com, .org etc). Seuls le{" "}
          <strong>.fr</strong> et les extensions géographiques (<strong>.bzh</strong>,{" "}
          <strong>.re</strong>, ...) constituent une marque de confiance suffisante.
          <br />
          <br />
          Voir notre{" "}
          <Link
            href="https://grist.incubateur.anct.gouv.fr/o/anct/gVoLeTsdJL8q/Suite-territoriale-Deploiement?embed=true"
            target="_blank"
            rel="noopener"
          >
            Cartographie de conformité
          </Link>
          .
        </>
      ),
    },
    {
      value: "1/10",
      title: "victime d'une cyberattaque",
      content: (
        <>
          10% des collectivités déclarent avoir été victimes d&rsquo;une ou plusieurs cyberattaques
          au cours des 12 derniers mois. 45% des victimes n&rsquo;en identifient pas la cause.
          <br />
          <br />
          Voir la{" "}
          <Link
            href="https://www.cybermalveillance.gouv.fr/tous-nos-contenus/actualites/cp-etude-2024-cybersecurite-collectivites"
            target="_blank"
            rel="noopener"
          >
            3e édition du baromètre de la maturité cyber des collectivités
          </Link>
          .
        </>
      ),
    },
    {
      value: "278",
      title: "cyberattaques documentées",
      content: (
        <>
          278 organismes publics (communes, EPCI, syndicats, hôpitaux) victimes de cyberattaques ont
          été recensés par le réseau Déclic depuis 2019
          <br />
          <br />
          Voir la{" "}
          <Link
            href="https://umap.openstreetmap.fr/fr/map/attaques-cybersecurite-aupres-dorganismes-publics_821557#8/47.991/-1.475"
            target="_blank"
            rel="noopener"
          >
            cartographie interactive des cyberattaques du réseau Déclic
          </Link>
          .
        </>
      ),
    },
    {
      value: "50 %",
      title: "messageries compromises",
      content: (
        <>
          La moitié des adresses de contact des collectivités ont fait l&rsquo;objet d&rsquo;une ou
          plusieurs fuites de données, dont une majorité concerne potentiellement le mot de passe.
          <br />
          <br />
          Étude effectuée à partir du site{" "}
          <Link href="https://haveibeenpwned.com" target="_blank" rel="noopener">
            HaveIBeenPwned.com
          </Link>{" "}
          en 2024.
        </>
      ),
    },
    {
      value: "75 %",
      title: "messageries génériques",
      content: (
        <>
          La majorité des emails des collectivités reposent sur des noms de domaine génériques
          rendant l&rsquo;identification formelle du destinataire et de l&rsquo;expéditeur
          impossible : wanadoo.fr, orange.fr, gmail.com, yahoo.fr, etc.
          <br />
          <br />
          Voir notre{" "}
          <Link
            href="https://grist.incubateur.anct.gouv.fr/o/anct/gVoLeTsdJL8q/Suite-territoriale-Deploiement?embed=true"
            target="_blank"
            rel="noopener"
          >
            Cartographie de conformité
          </Link>
          .
        </>
      ),
    },

    {
      value: "3",
      title: "causes principales",
      content: (
        <>
          Les principales causes de la vulnérabilité des collectivités face aux cyberattaques
          relèvent de l&rsquo;usage et des outils numériques utilisés. L&rsquo;hameçonnage (ou{" "}
          <i>phishing</i>) est la cause principale (30%) suivi du téléchargement d&rsquo;un virus et
          de la consultation d&rsquo;un site infecté (10%).
          <br />
          <br />
          Voir la{" "}
          <Link
            href="https://www.cybermalveillance.gouv.fr/tous-nos-contenus/actualites/cp-etude-2024-cybersecurite-collectivites"
            target="_blank"
            rel="noopener"
          >
            3e édition du baromètre de la maturité cyber des collectivités
          </Link>
          .
        </>
      ),
    },
    {
      value: "4",
      title: "conséquences importantes",
      content: (
        <>
          Les principales conséquences d&rsquo;une cyberattaque sont l&rsquo;interruption
          d&rsquo;activité et de service (35%), la destruction ou le vol de données (24%), la perte
          financière liée au paiement d&rsquo;une rançon et l&rsquo;atteinte à la réputation (10%).
          <br />
          <br />
          Voir la{" "}
          <Link
            href="https://www.cybermalveillance.gouv.fr/tous-nos-contenus/actualites/cp-etude-2024-cybersecurite-collectivites"
            target="_blank"
            rel="noopener"
          >
            3e édition du baromètre de la maturité cyber des collectivités
          </Link>
          .
        </>
      ),
    },
    {
      value: "18/mois",
      title: "incidents cyber",
      content: (
        <>
          Les CSIRT territoriaux et l&rsquo;ANSSI ont recensé en moyenne 18 incidents cyber
          affectant une collectivité territoriale tous les mois. Ces incidents représentent 14% de
          l&rsquo;ensemble des incidents traités par l&rsquo;ANSSI.
          <br />
          <br />
          Voir la{" "}
          <Link
            href="https://www.cert.ssi.gouv.fr/cti/CERTFR-2025-CTI-002/"
            target="_blank"
            rel="noopener"
          >
            synthèse de l&rsquo;ANSSI sur la menace ciblant les collectivités territoriales en 2024
          </Link>
          .
        </>
      ),
    },
  ];

  const partners: PartnerItem[] = [
    {
      title: "ANSSI",
      description:
        "L'Agence nationale de la sécurité des systèmes d'information a notamment pour mission d'animer et de coordonner les travaux interministériels en matière de sécurité des systèmes d'information. Dans le cadre du plan France 2030, elle finance et assure la sécurisation de la plateforme.",
      imageSrc: "/images/anssi.png",
      link: "https://cyber.gouv.fr/",
    },
    {
      title: "ANCT",
      description:
        "L'Agence Nationale de la Cohésion des territoires  soutient les collectivités dans leur fonctionnement et projets. L'Incubateur des territoires développe et peut opérer la Suite territoriale pour les communes de moins de 3 500 habitants et les EPCI de moins de 15 000 habitants.",
      imageSrc: "/images/anct2.png",
      link: "https://anct.gouv.fr/",
    },
    {
      title: "DINUM",
      description: `La Direction Interministérielle du Numérique (DINUM) assure le développement de la Suite numérique qui vise à fédérer les professionnels de la sphère publique autour d'applications interconnectées. Certaines briques de cette Suite sont réutilisées et adaptées aux territoires dans le cadre de la Suite territoriale.`,
      imageSrc: "/images/dinum.png",
      link: "https://www.numerique.gouv.fr/",
    },
    {
      title: "OPSN",
      description:
        "Les Opérateurs Publics de Services Numériques (OPSN) développent, opèrent et assurent déjà le déploiement opérationnel de services numériques sécurisés pour le compte des collectivités. Ils sont associés à la coconstruction et au déploiement de la Suite territoriale.",
      imageSrc: "/images/declic.png",
      link: "https://www.asso-declic.fr/",
    },
  ];

  const handleCommuneSelect = (selectedCommune: Commune) => {
    router.push(`/bienvenue/${selectedCommune.siret}`);
  };

  return (
    <>
      <HeroSection>
        <div className={fr.cx("fr-container", "fr-py-4w")}>
          <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
            <div
              className={fr.cx("fr-col-12", "fr-col-md-8", "fr-col-lg-8", "fr-mb-3w", "fr-mt-2w")}
            >
              <h1
                className={fr.cx("fr-h1", "fr-mb-3w")}
                style={{
                  textAlign: "center",
                  color: "var(--text-title-blue-france)",
                }}
              >
                La Suite territoriale
              </h1>
              <p className={fr.cx("fr-text--lg", "fr-mb-3w")} style={{ textAlign: "center" }}>
                Un ensemble de services numériques simples, souverains et sécurisés
                pour&nbsp;outiller les&nbsp;collectivités territoriales dans leurs besoins
                essentiels.
              </p>

              <h2
                className={fr.cx("fr-text--lg", "fr-pt-3w", "fr-mb-0", "fr-text--bold")}
                style={{
                  textAlign: "center",
                  color: "var(--text-title-blue-france)",
                }}
              >
                Ma collectivité est-elle éligible ?
              </h2>
            </div>
          </div>

          <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mb-2w")}>
            <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
              <div className={fr.cx("fr-search-bar")} style={{ width: "100%" }}>
                <CommuneSearch
                  onSelect={handleCommuneSelect}
                  placeholder={
                    isSmallScreen
                      ? "Nom ou code postal"
                      : "Renseignez le nom ou le code postal de votre collectivité"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </HeroSection>

      {/* Event notification
      <section
        style={{
          borderBottom: "1px solid var(--border-default-grey)",
          color: "var(--text-title-blue-france)",
        }}
      >
        <div className={fr.cx("fr-container", "fr-py-2w")}>
          <span className={fr.cx("fr-icon-info-fill")}></span>
          <span>
            <strong>&nbsp;Permanences &nbsp;</strong> Rendez-vous chaque mardi
            de 14h à 15h pour répondre à toutes vos questions &nbsp;&nbsp;
            <Link
              href="https://grist.incubateur.anct.gouv.fr/o/anct/forms/wGtUJsgNfkD3wRNUHULm5B/500"
              className={fr.cx("fr-link")}
              target="_blank"
              rel="noopener"
            >
              Inscription
            </Link>
          </span>
        </div>
      </section>
      */}

      <section
        style={{
          borderBottom: "1px solid var(--border-default-grey)",
          color: "var(--text-title-blue-france)",
        }}
      >
        <div className={fr.cx("fr-container", "fr-py-2w")}>
          <span className={fr.cx("fr-icon-info-fill")}></span>
          <span>
            <strong>&nbsp;Webinaires et permanences &nbsp;</strong> Notre équipe répond à toutes vos
            questions et vous présente l&rsquo;actualité de la Suite territoriale. &nbsp;&nbsp;
            <Link
              href="https://grist.incubateur.anct.gouv.fr/o/anct/forms/wGtUJsgNfkD3wRNUHULm5B/500"
              className={fr.cx("fr-link")}
              target="_blank"
              rel="noopener"
            >
              Inscription
            </Link>
          </span>
        </div>
      </section>

      {/* Tools section */}
      <section className={fr.cx("fr-container", "fr-mt-6w", "fr-mb-10w")}>
        <h2 className={fr.cx("fr-h2", "fr-mb-4w")}>
          Des outils professionnels pour votre collectivité
        </h2>

        <div
          className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}
          style={{ position: "relative" }}
        >
          <Image
            src="/images/coin-bottom-left.svg"
            alt=""
            role="presentation"
            width={100}
            height={100}
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
            }}
          />
          {tools.map((tool) => (
            <div key={tool.id} className={fr.cx("fr-col-12", "fr-col-md-4")}>
              <Card
                title={tool.title}
                desc={tool.description}
                linkProps={{
                  href: tool.link,
                }}
                titleAs="h3"
                imageUrl={tool.imageSrc}
                nativeImgProps={{
                  style: {
                    objectFit: "contain",
                    maxWidth: "50%",
                    margin: "30px auto 0 auto",
                  },
                }}
                imageAlt=""
                enlargeLink
                style={{
                  textAlign: "center",
                  border: "1px solid var(--border-default-grey)",
                  borderBottom: "3px solid var(--border-plain-blue-france)",
                }}
                classes={{
                  root: fr.cx("fr-card--no-border"),
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Stats slider */}
      <section style={{ backgroundColor: "var(--background-alt-blue-france)" }}>
        <div className={fr.cx("fr-container", "fr-pt-8w")}>
          <h2 className={fr.cx("fr-h2", "fr-mb-6w")}>Quels enjeux pour les collectivités ?</h2>

          <StatsSlider stats={stats} />
        </div>
      </section>

      {/* Map section */}
      <section style={{ backgroundColor: "var(--background-alt-blue-france)" }}>
        <div className={fr.cx("fr-container", "fr-py-6w")}>
          <div className={fr.cx("fr-grid-row", "fr-px-4w")} style={{ backgroundColor: "white" }}>
            <div
              className={fr.cx("fr-col-12", "fr-col-md-2")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image src="/images/carto.svg" alt="" width={178} height={158} />
            </div>
            <div className={fr.cx("fr-col-12", "fr-col-md-10", "fr-pl-3w", "fr-py-4w")}>
              <h3 className={fr.cx("fr-h4", "fr-mb-2w")}>
                Parcourez la Cartographie de conformité
              </h3>
              <p>
                Elle permet d&rsquo;identifier les communes françaises dotées ou non du socle de
                services numériques essentiels garantissant une communication en ligne sécurisée
                selon quatre critères, tout en facilitant l&rsquo;actualisation de leurs données.
              </p>
              <Button
                priority="secondary"
                iconPosition="right"
                iconId="fr-icon-map-pin-2-line"
                linkProps={{
                  href: "https://grist.incubateur.anct.gouv.fr/o/anct/gVoLeTsdJL8q/Suite-territoriale-Deploiement?embed=true",
                }}
              >
                Voir la carte
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners section */}
      <section>
        <div className={fr.cx("fr-container", "fr-my-6w")}>
          <h2 className={fr.cx("fr-h2", "fr-mb-4w")}>Un écosystème de partenaires</h2>

          <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            {partners.map((partner) => (
              <div key={partner.title} className={fr.cx("fr-col-12", "fr-col-md-3")}>
                <Card
                  title={partner.title}
                  desc={partner.description}
                  linkProps={{
                    href: partner.link,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }}
                  titleAs="h3"
                  imageUrl={partner.imageSrc}
                  border
                  imageAlt=""
                  enlargeLink
                  nativeImgProps={{
                    style: {
                      objectFit: "contain",
                      padding: "20px auto 0px auto",
                    },
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact section */}

      <section className={fr.cx("fr-my-10w", "fr-container")}>
        <div className={fr.cx("fr-grid-row")}>
          <div className={fr.cx("fr-col-offset-lg-2", "fr-col-lg-8")}>
            <ContactUs />
          </div>
        </div>
      </section>

      {/* Back to top button */}
      <BackToTop />

      {/* Newsletter section */}
      <section
        className={fr.cx("fr-mt-6w")}
        style={{ backgroundColor: "var(--background-alt-blue-france)" }}
      >
        <div className={fr.cx("fr-container")}>
          <Newsletter />
        </div>
      </section>
    </>
  );
}
