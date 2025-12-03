import type { Service } from "@/lib/onboarding";
import { Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";

type OtherServicesViewProps = {
  organisation: Commune;
  services: Service[];
};

/**
 * View for displaying the other services accessible to the organisation
 */
export default function OtherServicesView({ organisation, services }: OtherServicesViewProps) {
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
                        L'accompagnement numérique sur mesure
                      </h5>
                    </div>
                    <p className="description">
                      Une démarche personnalisée pour identifier vos besoins, définir des
                      prioritéset vous guider dans vos projets numériques.
                    </p>
                    <p>
                      <Link
                        className="fr-link"
                        href="https://anct.gouv.fr/programmes-dispositifs/incubateur-des-territoires/accompagnement-numerique-sur-mesure"
                        target="_blank"
                      >
                        Candidater dès maintenant
                      </Link>
                    </p>
                  </div>
                  <img src="/images/temp-opsn.png" alt="Temp OPSN" />
                </div>
              </div>
            )}

            {services.map((service) => (
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
                      Aide à la résolution des blocages administratifs de vos citoyens.
                    </p>
                    <p>
                      <Link className="fr-link" href={service.url} target="_blank">
                        Découvrir ce service
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
