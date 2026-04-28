import type { Commune, Service, OperatorWithRole } from "@/lib/schema";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useEffect, useState } from "react";
import ServiceIllustration, { preloadServiceIllustrations } from "./ServiceIllustration";
import ServicePicker from "./ServicePicker";

type SuiteServicesViewProps = {
  operator: OperatorWithRole;
  services: Service[];
  commune: Commune;
  reversed?: boolean;
};

/**
 * View for displaying the services available through the Suite territoriale
 */
export default function SuiteServicesView({
  operator,
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
              Accédez à l’écosystème applicatif avec{" "}
              {operator.name_with_article || operator.name}
            </h2>
            <p>
              <strong>{operator.name_with_article || operator.name}</strong> intègre à son offre d’autres services complémentaires au socle. Vous y retrouvez également les services de nos partenaires publics et privés.
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
                Commencer
              </Button>
            </div>
          </div>
        </div>
        <ServiceIllustration selectedService={selectedService} />
      </div>
    </div>
  );
}
