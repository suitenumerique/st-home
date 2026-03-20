import type { Service } from "@/lib/schema";
import Link from "next/link";

type ServicePickerProps = {
  services: Service[];
  selectedService: Service | undefined;
  onSelect: (service: Service) => void;
};

export default function ServicePicker({ services, selectedService, onSelect }: ServicePickerProps) {
  return (
    <>
      {selectedService && (
        <p>
          <Link
            className="fr-link"
            href={selectedService.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {selectedService.name}
          </Link>
          {selectedService.description && (
            <>
              {" "}
              pour{" "}
              {selectedService.description[0].toLowerCase() + selectedService.description.slice(1)}.
            </>
          )}
        </p>
      )}
      <div className="service-app-buttons fr-mb-4w">
        {services.map((service) => (
          <div
            key={service.id}
            className={`service-app-button ${selectedService?.id === service.id ? "selected" : ""}`}
            onClick={() => onSelect(service)}
          >
            <img src={service.logo_url ?? undefined} alt={service.name} />
            <span className="title">{service.name}</span>
          </div>
        ))}
      </div>
    </>
  );
}
