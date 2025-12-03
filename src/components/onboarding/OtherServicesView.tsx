import type { Service } from "@/lib/onboarding";
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
      description: "Une démarche personnalisée pour identifier vos besoins, définir des priorités et vous guider dans vos projets numériques.",
      url: "https://anct.gouv.fr/programmes-dispositifs/incubateur-des-territoires/accompagnement-numerique-sur-mesure",
      linkText: "Candidater dès maintenant",
    },
    {
      name: "Administration +",
      description: "Aide à la résolution des blocages administratifs de vos citoyens.",
      logo_url: "https://operateurs.suite.anct.gouv.fr/api/v1.0/servicelogo/5/",
      url: "https://administration-plus.fr",
      linkText: "Découvrir ce service",
    },
    {
      name: "Mon espace collectivité",
      description: "Pour faciliter la coordination et suivre l’avancée de vos projets locaux.",
      logo_url: "https://operateurs.suite.anct.gouv.fr/api/v1.0/servicelogo/11/",
      url: "https://mon-espace-collectivite.fr",
      linkText: "Découvrir ce service",
    },
    {
      name: "Aides territoires",
      description: "Trouver les financements et les accompagnements à vos projets.",
      logo_url: "https://operateurs.suite.anct.gouv.fr/api/v1.0/servicelogo/6/",
      url: "https://aides-territoires.fr",
      linkText: "Voir les aides disponibles",
    },
  ];

  return (
    <div className={fr.cx("fr-container")}>
      <div className={fr.cx("fr-grid-row", "fr-mb-12w")}>
        <h2 className={fr.cx("fr-h2")}>Les autres services accessibles à la collectivité</h2>
        <div className={fr.cx("fr-col-12")}>
          <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            {((organisation.type === "commune" && organisation.population < 3500) ||
              (organisation.type === "epci" && organisation.population < 15000)) && (
              <div className={fr.cx("fr-col-12")}>
                <div className="other-service">
                  <div className="content">
                    <div className="title">
                      <h5
                        style={{ color: "var(--light-decisions-text-text-default-grey, #3A3A3A)" }}
                      >
                        {services[0].name}
                      </h5>
                    </div>
                    <p className="description">
                      {services[0].description}
                    </p>
                    <p>
                      <Link
                        className="fr-link"
                        href="https://anct.gouv.fr/programmes-dispositifs/incubateur-des-territoires/accompagnement-numerique-sur-mesure"
                        target="_blank"
                      >
                        {services[0].linkText}
                      </Link>
                    </p>
                  </div>
                  <img src="/images/temp-opsn.png" alt="Temp OPSN" />
                </div>
              </div>
            )}

            {services.slice(1).map((service) => (
              <div key={service.id} className={fr.cx("fr-col-12", "fr-col-md-4")}>
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
                    <p className="description">
                      {service.description}
                    </p>
                    <p>
                      <Link className="fr-link" href={service.url} target="_blank">
                        {service.linkText}
                      </Link>
                    </p>
                  </div>
                  <img
                    style={{
                      position: "absolute",
                      bottom: "-40px",
                      right: "-10px",
                      borderRadius: "0px",
                    }}
                    src="/images/temp-opsn.png"
                    alt="Temp OPSN"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
