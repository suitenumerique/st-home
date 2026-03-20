import type { Service } from "@/lib/schema";
import { fr } from "@codegouvfr/react-dsfr";

const FALLBACK_IMAGE = "/images/bienvenue-illu/opsn-basic.jpg";

// Service IDs that have a dedicated illustration
const EXISTING_ILLUSTRATION_IDS: number[] = [2, 12, 99];

type ServiceIllustrationProps = {
  selectedService: Service | undefined;
};

export function getServiceIllustrationSrc(serviceId: number | undefined): string {
  if (serviceId && EXISTING_ILLUSTRATION_IDS.includes(serviceId)) {
    return `/images/bienvenue-illu/service-${serviceId}.jpg`;
  }
  return FALLBACK_IMAGE;
}

export function preloadServiceIllustrations() {
  EXISTING_ILLUSTRATION_IDS.forEach((id) => {
    const img = new window.Image();
    img.src = `/images/bienvenue-illu/service-${id}.jpg`;
  });
}

export default function ServiceIllustration({ selectedService }: ServiceIllustrationProps) {
  return (
    <div
      className={fr.cx("fr-col-12", "fr-col-md-6")}
      style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <img
        src={getServiceIllustrationSrc(selectedService?.id)}
        style={{ width: "100%", height: "auto" }}
        alt={selectedService?.name ?? ""}
      />
    </div>
  );
}
