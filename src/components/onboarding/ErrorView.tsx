import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Head from "next/head";

interface ErrorViewProps {
  error?: string;
}

/**
 * Error view component for onboarding
 */
export default function ErrorView({ error }: ErrorViewProps) {
  return (
    <>
      <Head>
        <title>Commune non trouvée | La Suite territoriale</title>
      </Head>
      <Alert title="Commune non trouvée" description={error} severity="error" />
      <div className={fr.cx("fr-mt-4w")}>
        <Button
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
