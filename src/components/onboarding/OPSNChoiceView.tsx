import type { mutualizationStructures, organizations } from "@/lib/schema";
import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
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
  const baseUrl = `/bienvenue/${commune.siret}`;

  return (
    <Card
      className={fr.cx("fr-card--no-arrow")}
      title={structure.shortname || structure.name}
      start={<Badge className={fr.cx("fr-mb-2w")}>{structure.type}</Badge>}
      desc={
        <>
          {structure.website && (
            <>
              Site web :{" "}
              <Link href={structure.website} target="_blank" rel="noopener noreferrer">
                {structure.website}
              </Link>
            </>
          )}
        </>
      }
      footer={
        <div
          className={fr.cx(
            "fr-btns-group",
            "fr-btns-group--inline-reverse",
            "fr-btns-group--icon-left",
          )}
        >
          <Button
            linkProps={{
              href: `${baseUrl}?structureId=${structure.id}&isExistingMember=true`,
            }}
          >
            Je suis adhérent
          </Button>
          <Button
            priority="secondary"
            linkProps={{
              href: `${baseUrl}?structureId=${structure.id}&isExistingMember=false`,
            }}
          >
            Pas adhérent mais je souhaite une mise en relation
          </Button>
        </div>
      }
      border
      size="large"
    />
  );
}

/**
 * View for organizations to choose their mutualization structure
 */
export default function OPSNChoiceView({ commune }: OPSNChoiceViewProps) {
  return (
    <>
      <p className={fr.cx("fr-text--lg", "fr-mb-2w")}>
        Vous n&rsquo;êtes pas encore adhérent à la ST.
      </p>

      <p className={fr.cx("fr-text--lg", "fr-mb-3w")}>
        Cependant, votre territoire est couvert par des structures de mutualisation, qui peuvent
        vous accompagner :
      </p>

      <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
        {commune.structures.map((structure) => (
          <div key={structure.id} className={fr.cx("fr-col-12", "fr-col-md-6")}>
            <StructureCard structure={structure} commune={commune} />
          </div>
        ))}
      </div>

      <p className={fr.cx("fr-text--lg", "fr-mt-4w")}>
        Si vous ne souhaitez pas vous faire accompagner par une structure, et que vous souhaitez
        vous inscrire à la ST directement auprès de l&rsquo;ANCT,{" "}
        <Button
          priority="tertiary"
          linkProps={{
            href: `/bienvenue/${commune.siret}?direct=1`,
          }}
        >
          cliquez ici
        </Button>
      </p>
    </>
  );
}
