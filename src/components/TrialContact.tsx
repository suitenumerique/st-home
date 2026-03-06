import { Button } from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

export default function TrialContact() {
  return (
    <div className="trial-contact">
      <Image src="/images/interest-test.svg" alt="" role="presentation" width={580} height={105} />
      <div className="buttons">
        <Button
          priority="primary"
          linkProps={{
            href: "/conformite/cartographie",
          }}
        >
          Obtenir un compte démo
        </Button>
        <Button
          priority="secondary"
          iconPosition="left"
          iconId="fr-icon-mail-fill"
          linkProps={{
            href: "mailto:contact@suite.anct.gouv.fr",
          }}
        >
          Nous contacter
        </Button>
      </div>
    </div>
  );
}
