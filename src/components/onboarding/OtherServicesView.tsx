import { Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";

type OtherServicesViewProps = {
  organisation: Commune;
};

/**
 * View for displaying the other services accessible to the organisation
 */
export default function OtherServicesView({ organisation }: OtherServicesViewProps) {
  const services = [
    {
      name: "Accompagnement numérique sur mesure",
      description:
        "Une démarche personnalisée pour identifier vos besoins, définir des priorités et vous guider dans vos projets numériques.",
      url: "https://anct.gouv.fr/programmes-dispositifs/incubateur-des-territoires/accompagnement-numerique-sur-mesure",
      link_text: "Candidater dès maintenant",
      picture_url: "/images/temp-st-illu-ansm.svg",
    },
    {
      name: "Administration +",
      description: "Aide à la résolution des blocages administratifs de vos citoyens.",
      logo_url: "https://operateurs.suite.anct.gouv.fr/api/v1.0/servicelogo/5/",
      url: "https://administration-plus.fr",
      link_text: "Découvrir ce service",
      picture_url: "/images/temp-st-illu-aplus.jpeg",
    },
    {
      name: "Mon espace collectivité",
      description: "Pour faciliter la coordination et suivre l’avancée de vos projets locaux.",
      logo_url: "https://operateurs.suite.anct.gouv.fr/api/v1.0/servicelogo/11/",
      url: "https://mon-espace-collectivite.fr",
      link_text: "Découvrir ce service",
      picture_url: "/images/temp-st-illu-mec.svg",
    },
    {
      name: "Aides territoires",
      description: "Trouver les financements et les accompagnements à vos projets.",
      logo_url: "https://operateurs.suite.anct.gouv.fr/api/v1.0/servicelogo/6/",
      url: "https://aides-territoires.fr",
      link_text: "Voir les aides disponibles",
      picture_url: "/images/temp-st-illu-at.svg",
    },
  ];

  return (
    <div className={fr.cx("fr-container")}>
      <div className={fr.cx("fr-grid-row", "fr-mb-12w")}>
        <h2 className={fr.cx("fr-h2")}>Les autres services accessibles à la collectivité</h2>
        <div className={fr.cx("fr-col-12")}>
          <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            {organisation.type === "commune" && organisation.population < 3500 && (
              <div className={fr.cx("fr-col-12")}>
                <div className="other-service">
                  <div className="content" style={{maxWidth: "600px"}}>
                    <div className="title">
                      <h5
                        style={{ color: "var(--light-decisions-text-text-default-grey, #3A3A3A)" }}
                      >
                        {services[0].name}
                      </h5>
                    </div>
                    <p className="description">{services[0].description}</p>
                    <p>
                      <Link
                        className="fr-link"
                        href="https://anct.gouv.fr/programmes-dispositifs/incubateur-des-territoires/accompagnement-numerique-sur-mesure"
                        target="_blank"
                      >
                        {services[0].link_text}
                      </Link>
                    </p>
                  </div>
                  <img
                    style={{
                      position: "absolute",
                      bottom: "-2px",
                      right: "70px",
                      borderRadius: "0px",
                      width: "250px",
                    }}
                    src={services[0].picture_url ?? undefined} alt={services[0].name}
                  />
                </div>
              </div>
            )}

            {services.slice(1).map((service, index) => (
              <div key={index} className={fr.cx("fr-col-12", "fr-col-md-4")}>
                <div className="other-service" style={{ paddingBottom: "170px" }}>
                  <div className="content">
                    <div className="title">
                      <img src={service.logo_url ?? undefined} alt={service.name} />
                      <h5
                        style={{ color: "var(--light-decisions-text-text-default-grey, #3A3A3A)" }}
                      >
                        {service.name}
                      </h5>
                    </div>
                    <p className="description">{service.description}</p>
                    <p>
                      <Link className="fr-link" href={service.url} target="_blank">
                        {service.link_text}
                      </Link>
                    </p>
                  </div>
                  {service.picture_url && (
                    <img
                      style={{
                        position: "absolute",
                        bottom: "-35px",
                        right: "-8px",
                        borderRadius: "0px",
                      }}
                      src={service.picture_url}
                      alt={service.name}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
