import type { Commune, Service } from "@/lib/schema";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useEffect, useState } from "react";
import ServiceIllustration, { preloadServiceIllustrations } from "./ServiceIllustration";
import ServicePicker from "./ServicePicker";

type SuiteServicesViewProps = {
  services: Service[];
  commune: Commune;
  reversed?: boolean;
};

/**
 * View for displaying the services available through the Suite territoriale
 */
export default function SuiteServicesView({
  services,
  commune,
  reversed = false,
}: SuiteServicesViewProps) {
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);

  useEffect(() => {
    setSelectedService(services[0]);
    preloadServiceIllustrations();
  }, [services]);

  return (
    <div className={fr.cx("fr-container")}>
      <div
        className={fr.cx("fr-grid-row", "fr-mb-12w", "fr-grid-row--middle")}
        style={{
          justifyContent: "space-between",
          ...(reversed ? { flexDirection: "row-reverse" } : {}),
        }}
      >
        <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
          <div className="suite-services-section">
            <h2 className={fr.cx("fr-h2")}>
              Utilisez les autres services de la Suite territoriale
            </h2>
            <p>
              Grâce à l'Incubateur des territoires, la collectivité peut également accéder à ces
              services :
            </p>
            <ServicePicker
              services={services}
              selectedService={selectedService}
              onSelect={setSelectedService}
            />
            <div
              className="fr-mb-1w"
              style={{ display: "flex", flexDirection: "row", gap: "1rem" }}
            >
              <Button
                priority="primary"
                linkProps={{
                  href: `/bienvenue/${commune.siret}/contact`,
                }}
              >
                Contactez-nous
              </Button>
            </div>
          </div>
        </div>
        <ServiceIllustration selectedService={selectedService} />
      </div>
    </div>
  );
}
