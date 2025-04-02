import type { Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Head from "next/head";

type UniqueCodeRequestViewProps = {
  commune: Commune;
};

/**
 * View for requesting a unique code
 */
export default function UniqueCodeRequestView({ commune }: UniqueCodeRequestViewProps) {
  return (
    <>
      <Head>
        <title>{commune.name} | La Suite territoriale</title>
      </Head>

      <Alert
        severity="info"
        title="Demande de code unique"
        description={
          <>
            <p>
              En tant que commune de moins de 3500 habitants, vous pouvez demander un code unique
              pour accéder à la Suite territoriale.
            </p>
            <p>
              Ce code vous sera envoyé par courrier à l&rsquo;adresse officielle de votre mairie.
            </p>
          </>
        }
        className={fr.cx("fr-mb-4w")}
      />

      <form>
        <div className={fr.cx("fr-mb-4w")}>
          <Input
            label="Nom"
            nativeInputProps={{
              type: "text",
              name: "name",
              required: true,
            }}
          />
        </div>

        <div className={fr.cx("fr-mb-4w")}>
          <Input
            label="Prénom"
            nativeInputProps={{
              type: "text",
              name: "firstname",
              required: true,
            }}
          />
        </div>

        <div className={fr.cx("fr-mb-4w")}>
          <Input
            label="Fonction"
            nativeInputProps={{
              type: "text",
              name: "role",
              required: true,
            }}
          />
        </div>

        <div className={fr.cx("fr-mb-4w")}>
          <Input
            label="Email"
            nativeInputProps={{
              type: "email",
              name: "email",
              required: true,
            }}
          />
        </div>

        <div className={fr.cx("fr-btns-group", "fr-btns-group--inline-reverse")}>
          <Button type="submit">Demander le code</Button>
          <Button
            priority="secondary"
            linkProps={{
              href: "/",
            }}
          >
            Retour à l&rsquo;accueil
          </Button>
        </div>
      </form>
    </>
  );
}
