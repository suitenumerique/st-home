import type { Commune, Service } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

type SuiteServicesViewProps = {
  services: Service[];
  commune: Commune;
};

/**
 * View for displaying the services available through the Suite territoriale
 */
export default function SuiteServicesView({ services, commune }: SuiteServicesViewProps) {
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);

  const existingImgIds = [3, 4, 8, 12, 49, 99991];

  useEffect(() => {
    setSelectedService(services[0]);
    existingImgIds.forEach((id) => {
      const img = new window.Image();
      img.src = `/images/temp-st-illu-${id}.svg`;
    });
  }, [services]);

  return (
    <div className={fr.cx("fr-container")}>
      <div className={fr.cx("fr-grid-row", "fr-mb-12w", "fr-grid-row--middle")}>
        <div
          className={fr.cx("fr-col-12", "fr-col-md-6")}
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          {/* <img
            src={
              existingImgIds.includes(selectedService?.id ?? -1)
                ? `/images/temp-st-illu-${selectedService?.id}.svg`
                : "/images/temp-opsn.png"
            }
            style={{ width: "100%", height: "auto" }}
            alt={selectedService?.name ?? ""}
          /> */}
          <Image
            src={
              existingImgIds.includes(selectedService?.id ?? -1)
                ? `/images/temp-st-illu-${selectedService?.id}.svg`
                : "/images/temp-opsn.png"
            }
            width={670}
            height={400}
            style={{ width: "100%", height: "auto" }}
            alt={selectedService?.name ?? ""}
          />
        </div>
        <div className={fr.cx("fr-col-12", "fr-col-md-5", "fr-col-offset-md-1")}>
          <div className="suite-services-section">
            <h2 className={fr.cx("fr-h2")}>Utilisez les autres services de la Suite territoriale</h2>
            <p>
              Grâce à l’Incubateur des territoires, la collectivité peut également accéder à ces
              services :
            </p>
            <p>
              <Link className="fr-link" href={selectedService?.url ?? ""}>
                {selectedService?.name}
              </Link>{" "}
              {selectedService?.description ?? ""}
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
                  href: `/bienvenue/${commune.siret}/contact`,
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
