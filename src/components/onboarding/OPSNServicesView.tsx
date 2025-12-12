import type { Commune, Service } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";
import { useEffect, useState } from "react";

type OPSNServicesViewProps = {
  services: Service[];
  commune: Commune & { structures: Structure[] };
};

type Structure = {
  id: string;
  name: string;
  shortname: string | null;
  website: string | null;
};

/**
 * View for displaying the OPSN services
 */
export default function OPSNServicesView({ services, commune }: OPSNServicesViewProps) {
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);

  const existingImgIds = [12, 49, 99992];

  useEffect(() => {
    setSelectedService(services[0]);
    existingImgIds.forEach((id) => {
      const img = new Image();
      img.src = `/images/temp-st-illu-${id}.svg`;
    });
  }, [services]);

  function StructureCard({
    structure,
    services,
    displayStructureName = true,
    selectedService,
    setSelectedService,
  }: {
    structure: Structure;
    services: Service[];
    displayStructureName?: boolean;
    selectedService: Service | undefined;
    setSelectedService: (service: Service) => void;
  }) {
    return (
      <>
        {displayStructureName && (
          <h3 className={fr.cx("fr-h3")}>{structure.shortname || structure.name}</h3>
        )}
        <p>
          La structure de mutualisation accompagnera la collectivité à la mise en œuvre des outils
          de son offre, tels que :
        </p>
        {selectedService && (
          <p>
            { selectedService.name !== 'Nom de domaine' && (
              <><Link className="fr-link" href={selectedService.url}>
                {selectedService.name}
              </Link>{' '}</>
            )}
            {selectedService.description}
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
        <div className="fr-mb-1w" style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
          <Button
            priority="primary"
            linkProps={{
              href: `/bienvenue/${commune.siret}/contact`,
            }}
          >
            Contacter {structure.shortname || structure.name}
          </Button>
          <Button
            priority="secondary"
            linkProps={{
              href: structure.website || "",
            }}
          >
            Voir l'offre de service
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className={fr.cx("fr-container", "fr-mb-8w")}>
      {commune.structures.length > 1 ? (
        <div className={fr.cx("fr-grid-row")}>
          <div className={fr.cx("fr-col-12")}>
            <h2 className={fr.cx("fr-h2")} style={{ maxWidth: "670px" }}>
              Obtenez les services de la Suite territoriale avec un opérateur local
            </h2>
            <div style={{ width: "100%", textAlign: "center", marginBottom: "3rem" }}>
              <img
                src={
                  existingImgIds.includes(selectedService?.id ?? 0)
                    ? `/images/temp-st-illu-${selectedService?.id}.svg`
                    : "/images/temp-opsn.png"
                }
                style={{ width: "100%", height: "auto", maxWidth: "670px" }}
                alt={selectedService?.name ?? ""}
              />
            </div>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-2w")}>
              {commune.structures.map((structure) => (
                <div key={structure.id} className={fr.cx("fr-col-12", "fr-col-md-6")}>
                  <div className="opsn-services-section">
                    <StructureCard
                      structure={structure}
                      services={services}
                      selectedService={selectedService}
                      setSelectedService={setSelectedService}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
          <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
            <div className="opsn-services-section">
              <h2 className={fr.cx("fr-h2")}>
                Obtenez les services de la Suite territoriale avec{" "}
                {commune.structures[0].shortname || commune.structures[0].name}
              </h2>
              <StructureCard
                displayStructureName={false}
                structure={commune.structures[0]}
                services={services}
                selectedService={selectedService}
                setSelectedService={setSelectedService}
              />
            </div>
          </div>
          <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-offset-md-1")}>
            <img
              src={
                existingImgIds.includes(selectedService?.id ?? 0)
                  ? `/images/temp-st-illu-${selectedService?.id}.svg`
                  : "/images/temp-opsn.png"
              }
              style={{ width: "100%", height: "auto" }}
              alt={selectedService?.name ?? ""}
            />
          </div>
        </div>
      )}
      <p className="fr-text--sm">
        {commune.structures.length > 1
          ? "Si les opérateurs proposés ne vous conviennent pas, "
          : "Si la structure proposée ne vous convient pas, "}
        <span>
          <Link href="mailto:contact@suite.anct.gouv.fr">écrivez-nous</Link>
        </span>
      </p>
    </div>
  );
}
