import ContactUs from "@/components/ContactUs";
import FaqList from "@/components/FaqList";
import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";

type RegionItem = {
  title: string;
  url: string;
  tags: ("partenaire" | "wip" | "pro-connect")[] | null;
};

type RegionSection = {
  id: string;
  title: string;
  items: RegionItem[];
};

const REF_INTRO = (
  <>
    <p>
      L'Agence nationale de la cohésion des territoires est partenaire des opérateurs publics de services numériques (OPSN) du réseau <Link href="https://www.asso-declic.fr/" target="_blank">Déclic</Link> pour le déploiement de la Suite territoriale auprès des communes de moins de 3 500 habitants et des intercommunalités de moins de 15 000 habitants. 
    </p>
    <p>
      Vous êtes une structure publique qui offre des services numériques essentiels ? <br />
      <Link href="mailto:contact@suite.anct.gouv.fr" className={fr.cx("fr-link")} target="_blank" rel="noopener noreferrer">
        Contactez-nous pour être référencé
      </Link>
    </p>
  </>
);

export const Regions: RegionSection[] = [
  {
    id: "auvergne-rhone-alpes",
    title: "Auvergne-Rhône-Alpes",
    items: [
      {
        title: "Mégalise Bretagne",
        url: "https://www.megalise-bretagne.fr/",
        tags: ['partenaire', 'pro-connect'],
      },
      {
        title: "Centre de gestion de la fonction publique territoriale du Finistère (29)",
        url: "https://cdg29.fr/",
        tags: ["wip"],
      },
      {
        title: "Centre de gestion de la fonction publique territoriale des Côtes-d'Armor (22)",
        url: "https://cdg22.fr/",
        tags: null,
      },
    ],
  },
  {
    id: "bourgogne-franche-comte",
    title: "Bourgogne-Franche-Comté",
    items: [
      {
        title: "Centre de gestion de la fonction publique territoriale du Doubs (25)",
        url: "https://cdg25.fr/",
        tags: null,
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
        <p>Voici son historique :</p>
        <ul>
          <li>
            <strong>Version 0.2</strong> (16 Août 2025) : Ajout du critère 2.8
          </li>
          <li>
            <strong>Version 0.1</strong> (10 Avril 2025) : Première version publique
          </li>
        </ul>
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
  {
    question: <>Que faire si mon site internet est signalé injoignable par erreur ?</>,
    answer: (
      <>
        <p>
          Les vérifications quotidiennes du RPNT sont effectuées par des robots qui peuvent être
          bloqués par certaines configurations ou services tiers.
          <br />
          Veuillez vous assurer que votre site est accessible depuis toutes nos adresses IP
          publiques, listées sur{" "}
          <Link
            href="https://docs.outscale.com/en/userguide/OUTSCALE-Public-IPs.html"
            target="_blank"
          >
            cette page
          </Link>{" "}
          dans la ligne "cloudgouv-eu-west-1".
        </p>
      </>
    ),
  },
];

const PartenairesPage: NextPage = () => {
  return (
    <>
      <NextSeo
        title="Les structures de mutualisation dans votre territoire"
        description="L'Agence nationale de la cohésion des territoires est partenaire des opérateurs publics de services numériques (OPSN) du réseau Déclic pour le déploiement de la Suite territoriale auprès des communes de moins de 3 500 habitants et des intercommunalités de moins de 15 000 habitants. "
      />

      {/* <HeroSection>
        <div className={fr.cx("fr-container", "fr-pt-5w")}>
          <div style={{ textAlign: "center" }}>
            <h1
              className={fr.cx("fr-h1", "fr-mb-2w")}
              style={{ color: "var(--text-title-blue-france)", fontSize: "2.2rem !important" }}
            >
              Référentiel de la Présence Numérique des Territoires
            </h1>
            <h2
              className={fr.cx("fr-text--lg", "fr-pt-1w", "fr-mb-2w", "fr-text--bold")}
              style={{
                textAlign: "center",
                color: "var(--text-title-blue-france)",
              }}
            >
              Ma collectivité est-elle conforme ?
            </h2>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mb-4w")}>
              <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                <div className={fr.cx("fr-search-bar")} style={{ width: "100%" }}>
                  <CommuneSearch
                    onSelect={handleCommuneSelect}
                    placeholder={
                      isSmallScreen
                        ? "Nom ou code postal"
                        : "Renseignez le nom ou le code postal de votre collectivité"
                    }
                    style={{
                      backgroundColor: "white",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </HeroSection> */}

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
              <h1
                className={fr.cx("fr-h1", "fr-pt-12v", "fr-mb-15v")}
                style={{
                  textAlign: "center",
                  fontSize: "2.2rem !important",
                }}
              >
                Les structures de mutualisation dans votre territoire
              </h1>
              <div className={fr.cx("fr-text--lg", "fr-mb-15v")}>{REF_INTRO}</div>
              <p
                className={fr.cx("fr-mb-3w", "fr-text--md")}
                style={{ textAlign: "right" }}
              >
                Dernière mise à jour le 16 avril 2026
              </p>
            </div>

            <div id="referentiel">
              {Regions.map((region) => (
                <div
                  key={region.id}
                  id={region.id}
                  className={fr.cx("fr-p-1w", "fr-mb-4w")}
                  style={{
                    border: "1px solid var(--border-default-blue-france)",
                    borderRadius: "16px",
                  }}
                >
                  <div>
                    <Accordion
                      className="partenaires-accordion--no-borders"
                      label={
                        <div
                          id={region.id.toLowerCase()}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            gap: "0.3rem",
                          }}
                        >
                          <h2 style={{ flex: 1, color: "var(--text-title-blue-france)" }}>{region.title}</h2>
                        </div>
                      }
                    >
                      <ul className={fr.cx("fr-links-group", "fr-mb-0") + " partenaires-links-list"}>
                        {region.items.map((item) => (
                          <li key={item.url} className="partenaires-links-item">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "1rem",
                              }}
                            >
                              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                                <Link
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={fr.cx("fr-link")}
                                  style={{ display: "inline-flex", width: "fit-content" }}
                                >
                                  {item.title}
                                </Link>
                              </div>
                              {item.tags?.length ? (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                    flexWrap: "wrap",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    flex: "0 0 auto",
                                  }}
                                >
                                  {item.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className={fr.cx(
                                        "fr-badge",
                                        "fr-badge--sm",
                                        "fr-badge--no-icon",
                                        tag === "partenaire"
                                          ? "fr-badge--success"
                                          : tag === "wip"
                                            ? "fr-badge--warning"
                                            : "fr-badge--info",
                                      )}
                                    >
                                      {tag === "partenaire"
                                        ? "Partenaire"
                                        : tag === "wip"
                                          ? "En cours"
                                          : "ProConnect"}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Accordion>
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

export default PartenairesPage;
