import type { Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Head from "next/head";

type OPSNProConnectViewProps = {
  commune: Commune;
};

/**
 * View for OPSN organizations that can use ProConnect
 */
export default function OPSNProConnectView({ commune }: OPSNProConnectViewProps) {
  return (
    <>
      <Head>
        <title>{commune.name} | La Suite territoriale</title>
      </Head>

      <p className={fr.cx("fr-text--lg", "fr-mb-3w")}>
        Votre OPSN est compatible avec ProConnect. Vous pouvez vous connecter directement pour
        activer la Régie.
      </p>

      <Alert
        severity="info"
        title="Connexion avec ProConnect"
        description={
          <>
            <p>
              En tant qu&rsquo;OPSN compatible avec ProConnect, vous pouvez vous connecter avec
              votre email professionnel.
            </p>
            <p>
              Après la connexion, vous serez guidé pour activer la Régie pour votre organisation.
            </p>
          </>
        }
        className={fr.cx("fr-mb-4w")}
      />

      <div className={fr.cx("fr-stepper", "fr-mb-4w")}>
        <h2 className={fr.cx("fr-stepper__title")}>Les étapes d&rsquo;activation</h2>
        <div className={fr.cx("fr-stepper__steps")} data-fr-current-step="1" data-fr-steps="2">
          <div>
            <p className={fr.cx("fr-stepper__title")}>
              <span className={fr.cx("fr-stepper__state")}>Étape </span>
              Connexion avec ProConnect
            </p>
            <p className={fr.cx("fr-stepper__details")}>
              Connectez-vous avec votre email professionnel via ProConnect.
            </p>
          </div>
          <div>
            <p className={fr.cx("fr-stepper__title")}>
              <span className={fr.cx("fr-stepper__state")}>Étape </span>
              Activation de la Régie
            </p>
            <p className={fr.cx("fr-stepper__details")}>
              Configurez et activez la Régie pour votre organisation.
            </p>
          </div>
        </div>
      </div>

      <div className={fr.cx("fr-btns-group", "fr-btns-group--inline-reverse")}>
        <Button
          linkProps={{
            href: `/login-proconnect-then-regie/${commune.siret}`,
          }}
        >
          Se connecter avec ProConnect
        </Button>
        <Button
          priority="secondary"
          linkProps={{
            href: "/",
          }}
        >
          Retour à l&rsquo;accueil
        </Button>
      </div>
    </>
  );
}
