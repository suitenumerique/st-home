import type { Commune, Service } from "@/lib/schema";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useState } from "react";
import ServicePicker from "./ServicePicker";

type MutualisationViewProps = {
  organisation: Commune;
  services: Service[];
  reversed?: boolean;
};

/**
 * View for displaying the services available through the Suite territoriale
 */
export default function MutualisationView({ services, reversed = false }: MutualisationViewProps) {
  const [selectedService, setSelectedService] = useState<Service | undefined>(services[0]);

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
            <h2 className={fr.cx("fr-h2")}>Envie d’aller plus loin ? </h2>
            <p>
              La collectivité n’est pas directement éligible aux autres services de la Suite
              territoriale, mais elle peut bénéficier d’un accompagnement spécifique.
            </p>
            <p>
              Vous pouvez également devenir une structure de mutualisation pour proposer à vos
              collectivités de moins de 3500 habitants l’un ou les services suivants :
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
                  href: "mailto:contact@suite.anct.gouv.fr",
                }}
              >
                Contactez-nous
              </Button>
            </div>
          </div>
        </div>
        <div
          className={fr.cx("fr-col-12", "fr-col-md-6")}
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          <img
            src="/images/illu-lst.svg"
            style={{ width: "100%", maxWidth: "440px", height: "auto" }}
            alt="La Suite Territoriale"
          />
        </div>
      </div>
    </div>
  );
}
