import type { Commune, Operator, Service } from "@/lib/schema";
import { capitalizeFirst } from "@/lib/string";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";
import { useEffect, useState } from "react";
import ServiceIllustration, { preloadServiceIllustrations } from "./ServiceIllustration";
import ServicePicker from "./ServicePicker";

export const ANCT_OPERATOR_ID = "9f5624fc-ef99-4d10-ae3f-403a81eb16ef";

type Op = Pick<Operator, "id" | "name" | "name_with_article" | "website">;

type OperatorServicesBlockProps = {
  op: Op;
  services: Service[];
  isSocle: boolean;
  commune: Commune;
  reversed?: boolean;
};

export default function OperatorServicesBlock({
  op,
  services,
  isSocle,
  commune,
  reversed = false,
}: OperatorServicesBlockProps) {
  const [selectedService, setSelectedService] = useState<Service | undefined>(services[0]);

  useEffect(() => {
    preloadServiceIllustrations();
  }, []);

  const firstServiceId = services[0]?.id;
  useEffect(() => {
    setSelectedService((current) => (current?.id === firstServiceId ? current : services[0]));
  }, [firstServiceId, services]);

  const isAnct = op.id === ANCT_OPERATOR_ID;
  const opName = op.name_with_article || op.name;

  const heading = isSocle
    ? `Obtenez le socle de la Suite territoriale avec ${opName}`
    : `Accédez à l’écosystème applicatif avec ${opName}`;

  const description = isSocle ? (
    <>
      <strong>{capitalizeFirst(opName)}</strong> peut accompagner la collectivité dans la mise en
      œuvre du socle de la Suite territoriale.
    </>
  ) : (
    <>
      <strong>{capitalizeFirst(opName)}</strong> intègre à son offre d’autres services
      complémentaires au socle. Vous y retrouvez également les services de nos partenaires publics
      et privés.
    </>
  );

  const contactHref = isAnct
    ? `/bienvenue/${commune.siret}/contact`
    : `/bienvenue/${commune.siret}/contact?operator=${op.id}`;

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
            <h2 className={fr.cx("fr-h2")}>{heading}</h2>
            <p>{description}</p>
            <ServicePicker
              services={services}
              selectedService={selectedService}
              onSelect={setSelectedService}
            />
            <div
              className="fr-mb-1w"
              style={{ display: "flex", flexDirection: "row", gap: "1rem" }}
            >
              <Button priority="primary" linkProps={{ href: contactHref }}>
                Contacter
              </Button>
              {!isAnct && op.website && (
                <Button
                  priority="secondary"
                  linkProps={{
                    href: op.website,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }}
                >
                  Voir l’offre de service
                </Button>
              )}
            </div>
            {!isAnct && (
              <p className={fr.cx("fr-text--xs")} style={{ color: "var(--text-mention-grey)" }}>
                Si vous avez une question concernant ce partenaire,{" "}
                <Link href={`/bienvenue/${commune.siret}/contact`}>contactez-nous</Link>.
              </p>
            )}
          </div>
        </div>
        <ServiceIllustration selectedService={selectedService} />
      </div>
    </div>
  );
}
