import type { Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

type SuiteServicesBasicViewProps = {
  commune: Commune;
};

export default function SuiteServicesBasicView({ commune }: SuiteServicesBasicViewProps) {

  return (
    <div className={fr.cx("fr-container", "fr-mb-8w")}>
      <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
        <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
          <div className="suite-services-basic-section">
            <h2 className={fr.cx("fr-h2")}>Accédez aux services de la suite territoriale </h2>
            <p>
              Retrouvez tous les services de la suite territoriale et de nos partenaires publiques et privés, pour répondre à vos enjeux d’identité pour l’authentification, de communication, de partage de vos documents, etc.
            </p>
            <div
              className="fr-mb-1w"
              style={{ display: "flex", flexDirection: "row", gap: "1rem" }}
            >
              <Button
                priority="primary"
                linkProps={{
                  href: `/bienvenue/${commune.siret}/contact`,
                }}
              >
                Nous contacter
              </Button>
              <Button
                priority="secondary"
                linkProps={{
                  href: `grist.anct.gouv.fr`,
                  target: "_blank",
                }}
              >
                Obtenir un compte démo
              </Button>
            </div>
          </div>
        </div>
        <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-offset-md-1")}>
          <Image
            src="/images/suite-basic-illustration.svg"
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
