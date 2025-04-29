import type { mutualizationStructures, organizations } from "@/lib/schema";
import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { type InferSelectModel } from "drizzle-orm";
import Link from "next/link";

// Require structures to be defined for this view
type OrganizationWithStructures = InferSelectModel<typeof organizations> & {
  structures: NonNullable<InferSelectModel<typeof mutualizationStructures>[]>;
};

type OPSNChoiceViewProps = {
  commune: OrganizationWithStructures;
};

/**
 * Component to display a single mutualization structure card with actions
 */
function StructureCard({
  structure,
  commune,
}: {
  structure: InferSelectModel<typeof mutualizationStructures>;
  commune: OrganizationWithStructures;
}) {
  const offreUrl = structure.website || "";

  return (
    <div
      className={fr.cx("fr-p-4w")}
      style={{ backgroundColor: "var(--background-alt-blue-france)" }}
    >
      <Badge className={fr.cx("fr-mb-2w")} severity="success" noIcon small>
        Partenaire
      </Badge>
      <h3 style={{ marginBottom: "0" }}>{structure.shortname || structure.name}</h3>
      <p
        className={fr.cx("fr-text--sm")}
        style={{ color: "var(--text-disabled-grey)", minHeight: "4em" }}
      >
        {structure.name}
      </p>
      {offreUrl && (
        <Link href={offreUrl} target="_blank" rel="noopener noreferrer">
          Voir l&rsquo;offre de services
        </Link>
      )}
      <br />
      <br />
      <br />

      <Button
        linkProps={{
          href: `/bienvenue/${commune.siret}/inscription?structureId=${structure.id}`,
        }}
      >
        Rejoindre le Groupe pilote
      </Button>
    </div>
  );
}

/**
 * View for organizations to choose their mutualization structure
 */
export default function OPSNChoiceView({ commune }: OPSNChoiceViewProps) {
  return (
    <>
      <h2>La Suite territoriale arrive bientôt !</h2>

      <p className={fr.cx("fr-text--lg", "fr-mb-3w")}>
        La collectivité pourra bénéficier prochainement de l&rsquo;accompagnement de la structure de
        mutualisation de son choix pour mettre en œuvre nos outils. Rejoignez son Groupe pilote dès
        maintenant pour être informé et tester les services.
      </p>

      <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
        {commune.structures.map((structure) => (
          <div key={structure.id} className={fr.cx("fr-col-12", "fr-col-md-6")}>
            <StructureCard structure={structure} commune={commune} />
          </div>
        ))}
      </div>

      {commune.st_eligible && (
        <p className={fr.cx("fr-text--lg", "fr-mt-4w")}>
          En cas de doute ou si vous ne souhaitez pas adhérer aux structures proposées,{" "}
          <Link
            href={`/bienvenue/${commune.siret}/inscription`}
            className={fr.cx("fr-link", "fr-text--lg")}
          >
            contactez-nous
          </Link>
          .
        </p>
      )}
    </>
  );
}
