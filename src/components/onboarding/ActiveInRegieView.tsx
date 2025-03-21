import type { Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Head from "next/head";

type ActiveInRegieViewProps = {
  commune: Commune;
};

/**
 * View for organizations that are already active in Régie
 */
export default function ActiveInRegieView({ commune }: ActiveInRegieViewProps) {
  return (
    <>
      <Head>
        <title>{commune.name} | La Suite territoriale</title>
      </Head>

      <h1 className={fr.cx("fr-h2", "fr-mb-3w")}>Bienvenue {commune.name} !</h1>

      <Alert
        severity="success"
        title="Votre organisation est déjà active dans la Régie"
        description={
          <p>
            Vous pouvez vous connecter directement pour accéder à vos services.
          </p>
        }
        className={fr.cx("fr-mb-4w")}
      />

      <div className={fr.cx("fr-btns-group", "fr-btns-group--inline-reverse")}>
        <Button
          linkProps={{
            href: `/login/${commune.siret}`,
          }}
        >
          Se connecter
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
