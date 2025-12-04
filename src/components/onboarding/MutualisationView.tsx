import type { Commune, Service } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";
import { useState } from "react";

type MutualisationViewProps = {
  organisation: Commune;
  services: Service[];
};

/**
 * View for displaying the services available through the Suite territoriale
 */
export default function MutualisationView({ services }: MutualisationViewProps) {
  const [selectedService, setSelectedService] = useState<Service | undefined>(
    services.find((s) => s.name === "Messages"),
  );

  return (
    <div className={fr.cx("fr-container")}>
      <div className={fr.cx("fr-grid-row", "fr-mb-12w", "fr-grid-row--middle")}>
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
            <p>
              <Link className="fr-link" href="">
                {selectedService?.name}
              </Link>{" "}
              pour envoyer et recevoir vos courriels professionnels.
            </p>
            <div className="service-app-buttons fr-mb-4w">
              {services.map((service: Service) => (
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
                Contactez-nous
              </Button>
            </div>
          </div>
        </div>
        <div
          className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-offset-md-1")}
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
