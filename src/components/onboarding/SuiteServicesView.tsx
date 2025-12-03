import type { Service } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";
import { useState } from "react";

type SuiteServicesViewProps = {
  services: Service[];
};

/**
 * View for displaying the services available through the Suite territoriale
 */
export default function SuiteServicesView({ services }: SuiteServicesViewProps) {
  const [selectedService, setSelectedService] = useState<Service | undefined>(
    services.find((s) => s.name === "Domaine collectivite.fr"),
  );

  return (
    <div className={fr.cx("fr-container")}>
      <div className={fr.cx("fr-grid-row", "fr-mb-12w", "fr-grid-row--middle")}>
        <div
          className={fr.cx("fr-col-12", "fr-col-md-6")}
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          <img
            src="/images/temp-opsn.png"
            style={{ width: "100%", height: "auto" }}
            alt="Temp OPSN"
          />
        </div>
        <div className={fr.cx("fr-col-12", "fr-col-md-5", "fr-col-offset-md-1")}>
          <div className="suite-services-section">
            <h2 className={fr.cx("fr-h2")}>Utilisez tous les services de la Suite territoriale</h2>
            <p>
              Grâce à l’Incubateur des territoires, la collectivité peut également accéder à ces
              services :
            </p>
            <p>
              <Link className="fr-link" href="" target="_blank">
                {selectedService?.name}
              </Link>{" "}
              pour fournir un nom de domaine institutionnel, à toutes les collectivités qui en ont
              besoin.
            </p>
            <div className="service-app-buttons fr-mb-4w">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`service-app-button ${selectedService?.id === service.id ? "selected" : ""}`}
                  onClick={() => setSelectedService(service)}
                >
                  <img src={service.logo_url ?? undefined} alt={service.name} />
                  <span className="title">{service.name}</span>
                </div>
              ))}
            </div>
            <div
              className="fr-mb-1w"
              style={{ display: "flex", flexDirection: "row", gap: "1rem" }}
            >
              <Button
                priority="primary"
                linkProps={{
                  href: "/conformite/cartographie",
                }}
              >
                Commencez dès maintenant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
