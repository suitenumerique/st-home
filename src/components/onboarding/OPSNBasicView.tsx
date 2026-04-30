import type { Commune, OperatorWithRole } from "@/lib/schema";
import { capitalizeFirst } from "@/lib/string";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";
import Link from "next/link";

type OPSNBasicViewProps = {
  operator: OperatorWithRole;
  commune: Commune;
  reversed?: boolean;
};

export default function OPSNBasicView({ operator, commune, reversed = false }: OPSNBasicViewProps) {
  return (
    <div className={fr.cx("fr-container")}>
      <div
        className={fr.cx("fr-grid-row", "fr-grid-row--middle")}
        style={{
          justifyContent: "space-between",
          ...(reversed ? { flexDirection: "row-reverse" } : {}),
        }}
      >
        <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
          <h2 className={fr.cx("fr-h2")}>
            Accédez bientôt aux services avec {operator.name_with_article || operator.name}
          </h2>
          <p>
            <strong>{capitalizeFirst(operator.name_with_article || operator.name)}</strong> fait
            évoluer son offre de services pour accompagner prochainement les collectivités
            adhérentes dans la mise en place d’une sélection d’outils.
          </p>
          <div className="fr-mb-2w" style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
            <Button
              priority="primary"
              linkProps={{
                href: `/bienvenue/${commune.siret}/contact?operator=${operator.id}`,
              }}
            >
              Contacter
            </Button>
            {operator.website && (
              <Button
                priority="secondary"
                linkProps={{
                  href: operator.website,
                  target: "_blank",
                  rel: "noopener noreferrer",
                }}
              >
                Voir l'offre de service
              </Button>
            )}
          </div>

          <p className={fr.cx("fr-text--xs")} style={{ color: "var(--text-mention-grey)" }}>
            Si vous avez une question concernant ce partenaire,{" "}
            <Link href={`/bienvenue/${commune.siret}/contact`}>contactez-nous</Link>.
          </p>
        </div>
        <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
          <Image
            src="/images/bienvenue-illu/opsn-basic.jpg"
            width={670}
            height={400}
            style={{ width: "100%", height: "auto" }}
            alt="Illustration de la Suite territoriale"
          />
        </div>
      </div>
    </div>
  );
}
