import type { Commune } from "@/lib/schema";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import CommuneInfo from "./CommuneInfo";

type OrganisationPresenceViewProps = {
  organisation: Commune;
};

/**
 * View for displaying the organisation presence
 */
export default function OrganisationPresenceView({ organisation }: OrganisationPresenceViewProps) {
  // const [expanded, setExpanded] = useState(false);
  const typeTitles: Record<string, string> = {
    commune: "La présence numérique de la commune",
    epci: "La présence numérique de l'EPCI",
    region: "La présence numérique de la région",
    departement: "La présence numérique du département",
  };
  const title = typeTitles[organisation.type] ?? "La présence numérique de la collectivité";

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        padding: "40px 40px 32px 40px",
        borderRadius: "8px",
        border: "1px solid var(--light-border-default-grey, #DDD)",
      }}
    >
      <h3
        className={fr.cx("fr-h3", "fr-mb-1w")}
        style={{ color: "var(--light-text-default-grey, #3A3A3A)" }}
      >
        {title}
      </h3>
      <p className="fr-mb-3w">
        Parcourez la situation de la collectivité selon le{" "}
        <Link href="/conformite/referentiel">
          Référentiel de la Présence Numérique des Territoires
        </Link>{" "}
        :
      </p>
      <CommuneInfo commune={organisation} />
    </div>
  );
}
