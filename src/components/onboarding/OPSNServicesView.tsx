import type { Commune, OperatorWithRole, Service } from "@/lib/schema";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";
import { useEffect, useState } from "react";
import ServiceIllustration, { preloadServiceIllustrations } from "./ServiceIllustration";
import ServicePicker from "./ServicePicker";

type OPSNServicesViewProps = {
  operator: OperatorWithRole;
  services: Service[];
  commune: Commune;
  reversed?: boolean;
};

export default function OPSNServicesView({
  operator,
  services,
  commune,
  reversed = false,
}: OPSNServicesViewProps) {
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);

  useEffect(() => {
    setSelectedService(services[0]);
    preloadServiceIllustrations();
  }, [services]);

  return (
    <div className={fr.cx("fr-container", "fr-mb-8w")}>
      <div
        className={fr.cx("fr-grid-row", "fr-grid-row--middle")}
        style={{
          justifyContent: "space-between",
          ...(reversed ? { flexDirection: "row-reverse" } : {}),
        }}
      >
        <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
          <div className="opsn-services-section">
            <h2 className={fr.cx("fr-h2")}>
              Obtenez les services de la Suite territoriale avec{" "}
              {operator.name_with_article || operator.name}
            </h2>
            <p>
              La structure de mutualisation accompagnera la collectivité à la mise en œuvre des
              outils de son offre, tels que :
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
                  href: `/bienvenue/${commune.siret}/contact?operator=${operator.id}`,
                }}
              >
                Contacter
              </Button>
              <Button
                priority="secondary"
                linkProps={{
                  href: operator.website || "",
                }}
              >
                Voir l'offre de service
              </Button>
            </div>
            <p className={fr.cx("fr-text--sm")}>
              Si vous avez une question concernant ce partenaire,{" "}
              <Link href={`/bienvenue/${commune.siret}/contact`}>contactez-nous</Link>.
            </p>
          </div>
        </div>
        <ServiceIllustration selectedService={selectedService} />
      </div>
    </div>
  );
}
