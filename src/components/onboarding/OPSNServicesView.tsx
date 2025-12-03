import type { Service } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";
import { useState } from "react";

type OPSNServicesViewProps = {
  services: Service[];
};

/**
 * View for displaying the OPSN services
 */
export default function OPSNServicesView({ services }: OPSNServicesViewProps) {
  const [selectedService, setSelectedService] = useState<Service | undefined>(
    services.find((s) => s.name === "Messages"),
  );

  return (
    <div className={fr.cx("fr-container")}>
      <div className={fr.cx("fr-grid-row", "fr-mb-8w", "fr-grid-row--middle")}>
        <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
          <div className="opsn-services-section">
            <h2 className={fr.cx("fr-h2")}>
              Obtenez les services de la Suite territoriale avec Adico
            </h2>
            <p>
              La structure de mutualisation accompagnera la collectivité à la mise en œuvre des
              outils de son offre, tels que :
            </p>
            {selectedService && (
              <p>
                <Link className="fr-link" href={selectedService.url} target="_blank">
                  {selectedService.name}
                </Link>{" "}
                pour stocker et partager simplement vos documents.
              </p>
            )}
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
                Contacter l'Adico
              </Button>
              <Button
                priority="secondary"
                linkProps={{
                  href: "/conformite/cartographie",
                }}
              >
                Voir l'offre de service
              </Button>
            </div>
            <p className="fr-text--sm">
              Si la structure proposée ne vous convient pas,{" "}
              <span>
                <Link href="mailto:contact@suite.anct.gouv.fr">écrivez-nous</Link>
              </span>
            </p>
          </div>
        </div>
        <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-offset-md-1")}>
          <img
            src="/images/temp-opsn.png"
            style={{ width: "100%", height: "auto" }}
            alt="Temp OPSN"
          />
        </div>
      </div>
    </div>
  );
}
