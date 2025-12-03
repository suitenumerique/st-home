import type { Service } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";

type UsedServicesViewProps = {
  services: Service[];
};

/**
 * View for displaying the organisation used services
 */
export default function UsedServicesView({ services }: UsedServicesViewProps) {
  return (
    <>
      <h2 className={fr.cx("fr-h2")} style={{ textAlign: "center" }}>
        Les services activés dans la collectivité
      </h2>
      <p style={{ textAlign: "center" }}>
        Vous faites partie de la collectivité ? Connectez-vous directement aux services.
      </p>
      <div
        className="fr-container"
        style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1rem" }}
      >
        {services.map((service) => (
          <div
            key={service.id}
            className="service-tile"
            onClick={() => window.open(service.url, "_blank")}
          >
            <div className="content">
              <img src={service.logo_url ?? undefined} alt={service.name} />
              <span className="title">{service.name}</span>
              <i
                className={fr.cx("fr-icon-arrow-right-up-line", "fr-icon--md")}
                style={{ color: "var(--text-title-blue-france)" }}
                aria-hidden="true"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
