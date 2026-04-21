import FaqList from "@/components/FaqList";
import { fetchPartenairesRegions } from "@/lib/db";
import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Button } from "@codegouvfr/react-dsfr/Button";
import TrialContact from "@/components/TrialContact";
import { departmentsRegion } from "@/lib/departmentsRegion";

import { GetServerSideProps, NextPage } from "next";

import { NextSeo } from "next-seo";
import Link from "next/link";
import Image from "next/image";

type RegionItem = {
  name: string;
  website?: string | null;
  status: "partenaire" | "partenaire_avec_services" | "intention" | null;
  hasProConnect: boolean | null;
};

type RegionSection = {
  id: string;
  name: string;
  items: RegionItem[];
};

type PartenairesProps = {
  regions: RegionSection[];
  regionsDromSections: RegionSection[];
};

function OpsnItem({ item }: { item: RegionItem }) {
  return (
    <div
      className="opsn-item"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      <div style={{ flex: "1 1 auto", minWidth: 0, display: "flex", alignItems: "center" }}>
        {item.website ? (
          <Link
            href={item.website}
            target="_blank"
            rel="noopener noreferrer"
            className={fr.cx("fr-link") + " no-underline opsn-item__link"}
            style={{ display: "inline-flex", width: "fit-content", alignItems: "center" }}
          >
            {item.name}
          </Link>
        ) : (
          <span>{item.name}</span>
        )}
      </div>
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
        {item.status ? (
          <span
            className={fr.cx(
              "fr-badge",
              "fr-badge--sm",
              "fr-badge--no-icon",
              item.status === "partenaire" || item.status === "partenaire_avec_services"
                ? "fr-badge--success"
                : "fr-badge--new"
            )}
          >
            {item.status === "partenaire" || item.status === "partenaire_avec_services" ? "Partenaire" : "À venir"}
          </span>
        ) : null}
        {item.hasProConnect ? (
          <span className={fr.cx("fr-badge", "fr-badge--sm", "fr-badge--no-icon", "fr-badge--info")}>
            ProConnect
          </span>
        ) : null}
      </div>
    </div>
  );
}

function NoOpsnItem({ isDrom }: { isDrom: boolean }) {
  return (
    <div
      className="no-opsn-item"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      <p className={fr.cx("fr-mb-0", isDrom ? "fr-pl-2w" : "fr-pl-0")}
         style={{ color: "var(--text-mention-grey)" }}>
        <em>Aucun partenaire trouvé</em>
      </p>
      <Link href="mailto:contact@suite.anct.gouv.fr" 
            className={fr.cx("fr-link") + " no-underline opsn-item__link no-opsn-item__link"}
            style={{ display: "inline-flex", width: "fit-content", alignItems: "center" }}
            target="_blank" 
            rel="noopener noreferrer">
              Devenez partenaire
      </Link>
    </div>
  );
}

const REF_INTRO = (
  <>
    <p>
      L'Agence nationale de la cohésion des territoires est partenaire des opérateurs publics de services numériques (OPSN) du réseau <Link href="https://www.asso-declic.fr/" target="_blank">Déclic</Link> pour le déploiement de la Suite territoriale auprès des communes de moins de 3 500 habitants et des intercommunalités de moins de 15 000 habitants. 
    </p>
    <p>
    Cette page évolutive recense l’ensemble de nos partenaires au local. Vous êtes une structure publique (opérateurs publics de services numériques, centre de gestion, intercommunalités, etc.) qui offre des services numériques essentiels ?<br />
      <Link href="mailto:contact@suite.anct.gouv.fr" className={fr.cx("fr-link")} target="_blank" rel="noopener noreferrer">
        Contactez-nous pour être référencé
      </Link>
    </p>
  </>
);

const FAQS = [
  {
    question: <>Qui peut devenir partenaire ?</>,
    answer: (
      <>
        <p>
          <strong>Toute structure publiques de mutualisation</strong> qui accompagne les collectivités dans leur transformation numérique est invitée à devenir partenaire de l'ANCT pour déployer les services de la Suite territoriale :
        </p>
        <ul>
          <li>
            Opérateurs Publics de Services Numériques (OPSN)
          </li>
          <li>Intercommunalités</li>
          <li>Centres de gestion de la fonction publique territoriale (CDG)</li>
          <li>Syndicats mixtes informatiques</li>
          <li>Agences techniques départementales</li>
          <li>Groupements d'intérêt public (GIP)</li>
          <li>Associations et associations d'élus</li>
          <li>etc...</li>
        </ul>
        <p>
          Ancrées dans les territoires, ces partenaires sont les relais de proximité essentiels pour déployer les services numériques souverains auprès des communes, en particulier les plus vulnérables, selon le principe de subsidiarité.
        </p>
      </>
    ),
  },
  {
    question: <>Les acteurs privés peuvent-ils devenir partenaires ?</>,
    answer: (
      <>
        <p>
          <strong>Oui, tous les acteurs de la filière du numérique française </strong> (hébergeurs, intégrateurs, éditeurs...) sont également des partenaires de l'ANCT, mobilisés pour concevoir, faire évoluer et déployer des services numériques souverains et interopérables auprès des territoires.
        </p>
        <p>
          <strong>Cette coopération public/privé permet la pleine complémentarité</strong> entre les offres privées et les services numériques proposés par l'Etat. Elle se matérialise par exemple par :
        </p>
        <ul>
          <li><strong>le raccordement des fournisseurs de services</strong> à la fédération ProConnect permettant d'authentifier les utilisateurs professionnels de manière sécurisée ;</li>
          <li><strong>le référencement et la valorisation des services</strong> privés auprès des collectivités territoriales ;</li>
          <li><strong>l'hébergement et l'intégration des logiciels libres</strong> pour le compte des structures publiques de mutualisation ;</li>
          <li><strong>la contribution des équipes de développement aux mêmes logiciels libres ;</strong></li>
          <li><strong>etc...</strong></li>
        </ul>
      </>
    ),
  },
  {
    question: <>Quelles sont les étapes pour devenir partenaire ?</>,
    answer: (
      <>
        <p>Pour devenir partenaire de la Suite territoriale, les structures de mutualisation sont invitées à :</p>
        <ol>
          <li>Contacter l'équipe à l'adresse <Link href="mailto:contact@suite.anct.gouv.fr" className={fr.cx("fr-link")} target="_blank" rel="noopener noreferrer">contact@suite.anct.gouv.fr</Link></li>
          <li>Formaliser leur volonté à travers un courrier d'intention ;</li>
          <li>Signer un contrat de partenariat public-public avec l'ANCT.</li>
        </ol>
      </>
    ),
  },
  {
    question: <>Quelle garanties concernant la pérennité de la Suite territoriale ?</>,
    answer: (
      <>
        <p>
          <strong>L'ANCT et ses partenaires publics s'engagent mutuellement pour une durée de trois ans à travers un contrat de partenariat public-public</strong> renouvelable. Ces contrats permettent la mutualisation des ressources en vue d'atteindre un objectif commun : sécuriser durablement les systèmes d'information et usages numériques des plus petites collectivités.
        </p>
        <p>
          <strong>La démultiplication des partenaires publics, associés au sein d'une gouvernance commune, garantit la résilience du modèle.</strong> La coopération entre un opérateur de l'Etat et les opérateurs des territoires autour d'un objet commun est la principale garantie de maintien en condition opérationnelle et de pérennité des services numériques de la Suite territoriale.
        </p>
        <p>
          <strong>L'architecture technique décentralisée de la Suite territoriale</strong> et son déploiement par une fédération de partenaires est la principale garantie de sécurisation selon les critères de l'Agence nationale de la sécurité des systèmes d'information (ANSSI), partenaire du projet. Elle assure également l'indépendance des collectivités locales dans leurs propres choix techniques.
        </p>
        <p>
          <strong>Les logiciels sont développés en open source, garantissant non seulement la transparence</strong> des investissements de l'Etat dans les services de la Suite territoriale, mais également leur libre appropriation et contribution par l'ensemble de l'écosystème : collectivités, structures de mutualisation, filière privée, états européens etc.
        </p>
      </>
    ),
  },
  {
    question: <>Quelle est la différence entre la Suite numérique et la Suite territoriale ?</>,
    answer: (
      <>
        <p>
          <strong>La Suite territoriale et LaSuite numérique proposent toutes les deux des communs numériques simples et interopérables</strong>, mis à la disposition des professionnels de la sphère publique et accessibles via une authentification unique sécurisée ProConnect.
        </p>
        <p>
          <strong>La Suite territoriale</strong> est un ensemble de services numériques opérés par l'Agence Nationale de Cohésion des Territoires (ANCT) et les partenaires des territoires. Elle s'adresse aux élus et agents publics des plus petites collectivités territoriales.
        </p>
        <p>
          <Link href="https://lasuite.numerique.gouv.fr/" target="_blank" rel="noopener noreferrer">La suite</Link> numérique est un ensemble de services numériques mis à disposition par la Direction Interministérielle du Numérique (DINUM) aux agents de la fonction publique d'Etat.
        </p>
      </>
    ),
  },
  {
    question: <>Puis-je uniquement déployer une fédération d'identité ProConnect ?</>,
    answer: (
      <>
        <p>
          Le raccordement à la fédération d'identités numériques professionnelles ProConnect peut être réalisé en autonomie par tous les partenaires, publics comme privés. L'Espace Partenaires ProConnect permet de guider le raccordement :
        </p>
        <ul>
          <li>
            <Link href="https://partenaires.proconnect.gouv.fr/docs/fournisseur-identite" target="_blank" rel="noopener noreferrer">En tant que Fournisseurs d'Identité</Link> pour les structures publiques de mutualisation qui disposent de leur propre annuaire d'utilisateurs professionnels ;
          </li>
          <li>
            <Link href="https://partenaires.proconnect.gouv.fr/docs/fournisseur-service" target="_blank" rel="noopener noreferrer">En tant que Fournisseurs de services</Link> pour les partenaires publics ou privés qui souhaitent intégrer ProConnect comme moyen d'authentification unique sécurisé.
          </li>
        </ul>
        <p>
          <strong>ProConnect est une fédération opérée par l'Etat et la DINUM</strong> qui valide les demandes de raccordement <Link href="https://datapass.api.gouv.fr/demandes/pro_connect_identity_provider/nouveau" target="_blank" rel="noopener noreferrer">via Datapass</Link> et garantit le support technique.
        </p>
        <p>
          <strong>Dans le cadre de la Suite territoriale, l'ANCT déploie ProConnect</strong> auprès des collectivités en accompagnant le raccordement et la sécurisation des fournisseurs d'identité territoriaux.
        </p>
      </>
    ),
  },
];

const PartenairesPage: NextPage<PartenairesProps> = ({ regions, regionsDromSections }) => {
  return (
    <>
      <NextSeo
        title="Les partenaires publics de la Suite territoriale"
        description="L'Agence nationale de la cohésion des territoires est partenaire des opérateurs publics de services numériques (OPSN) du réseau Déclic pour le déploiement de la Suite territoriale auprès des communes de moins de 3 500 habitants et des intercommunalités de moins de 15 000 habitants."
      />

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
                className={fr.cx("fr-h1") + " partenaires-title"}
                style={{
                  textAlign: "center",
                }}
              >
                Les partenaires publics<br />de la Suite territoriale
              </h1>
              <div className={fr.cx("fr-text--lg", "fr-mb-15v")}>{REF_INTRO}</div>
            </div>

            <div id="regions">
              {regions.map((region) => (
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
                      defaultExpanded={
                        region.id === "drom-region"
                          ? regionsDromSections.length === 1
                          : region.items.length === 1
                      }
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
                          <h2 style={{ flex: 1, color: "var(--text-title-blue-france)" }}>{region.name}</h2>
                        </div>
                      }
                    >
                      <ul className={fr.cx("fr-links-group", "fr-mb-0") + " partenaires-links-list"}>
                        {region.id === "drom-region"
                          ? regionsDromSections.map((dromRegion) => (
                              <li
                                key={`drom-${dromRegion.id}`}
                                className="partenaires-drom-links-item"
                              >
                                <span><strong>{dromRegion.name}</strong></span>
                                {dromRegion.items.length > 0 ? (
                                  <ul className={fr.cx("fr-links-group", "fr-mb-0") + " partenaires-drom-links-list"}>
                                    {dromRegion.items.map((item) => (
                                      <li key={`${dromRegion.id}-${item.name}`} className="partenaires-drom-links-item">
                                        <OpsnItem item={item} />
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <NoOpsnItem isDrom={true} />
                                )}
                              </li>
                            ))
                          : region.items.length > 0 ? (
                              region.items.map((item) => (
                                <li key={`${region.id}-${item.name}`} className="partenaires-links-item">
                                  <OpsnItem item={item} />
                                </li>
                              ))
                            ) : (
                              <li className="partenaires-links-item">
                                <NoOpsnItem isDrom={false} />
                              </li>
                            )}
                      </ul>
                    </Accordion>
                  </div>
                </div>
              ))}
            </div>
            <div id="declic" className={fr.cx("fr-p-4w", "fr-mt-9w")} style={{
              border: "1px solid var(--border-default-grey)",
              borderRadius: "16px",
              backgroundColor: "#F5F5FE80",
            }}>
              <Image src="/images/logo-declic.svg" alt="Déclic" width={275} height={53} />
              <p className={fr.cx("fr-mt-4w", "fr-mb-2w")}>
                Déclic est la fédération des Opérateurs Publics de Services Numériques (OPSN). Ce réseau, exclusivement dévoué à l’intérêt général des collectivités, consiste à mutualiser l’information, les expériences, la veille technologique et réglementaire, par une mise en commun d’outils et de moyens.
              </p>
              <Button
                linkProps={{ href: "https://www.asso-declic.fr/" }}
              >
                Voir l'intégralité du réseau
              </Button>
            </div>

            <div id="faq" className={fr.cx("fr-my-8w") + " rcpnt-section"}>
              <h2 className={fr.cx("fr-h2", "fr-mb-3w")}>Questions générales</h2>
              <FaqList faqs={FAQS} />
            </div>

            <section className={fr.cx("fr-my-15w")}>
              <TrialContact priority="primary" />
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PartenairesProps> = async () => {
  try {
    const apiRegions = await fetchPartenairesRegions();

    const getIsDrom = (regionName: unknown) =>
      typeof regionName === "string"
        ? (departmentsRegion.find((r) => r.name === regionName)?.isDrom ?? false)
        : false;

    const regionsMetropolitaines = apiRegions.filter((region) => !getIsDrom(region.name));
    const dromSection = {
      id: `drom-region`,
      name: 'Départements et régions d\'outre-mer',
      data: [],
    }
    const regionsDrom = apiRegions.filter((region) => getIsDrom(region.name));
    
    const regions: RegionSection[] = [...regionsMetropolitaines, dromSection].map((region, idx) => ({
      id: (region as { id?: string }).id ?? `region-${idx}`,
      name: region.name,
      items: region.data.map((r) => ({
        name: r.name,
        website: r.website ?? null,
        status: r.status,
        hasProConnect: r.hasProConnect ?? null,
      })),
    }));

    const regionsDromSections: RegionSection[] = regionsDrom.map((region, idx) => ({
      id: `drom-region-${idx}`,
      name: region.name,
      items: region.data.map((r) => ({
        name: r.name,
        website: r.website ?? null,
        status: r.status,
        hasProConnect: r.hasProConnect ?? null,
      })),
    }));

    return { props: { regions, regionsDromSections } };
  } catch (error) {
    console.error("Error fetching partenaires:", error);
    return { props: { regions: [], regionsDromSections: [] } };
  }
};

export default PartenairesPage;
