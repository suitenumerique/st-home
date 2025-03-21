import type { Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import Head from "next/head";

type ContactUsViewProps = {
  commune: Commune;
};

/**
 * View for contact form
 */
export default function ContactUsView({ commune }: ContactUsViewProps) {
  return (
    <>
      <Head>
        <title>{commune.name} | La Suite territoriale</title>
      </Head>

      <h1 className={fr.cx("fr-h2", "fr-mb-3w")}>Bienvenue {commune.name} !</h1>

      <p className={fr.cx("fr-text--lg", "fr-mb-3w")}>
        Pour vous accompagner dans votre démarche d&rsquo;adhésion à la Suite
        territoriale, merci de nous laisser vos coordonnées.
      </p>

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

        <div className={fr.cx("fr-mb-4w")}>
          <Input
            label="Téléphone"
            nativeInputProps={{
              type: "tel",
              name: "phone",
              required: true,
            }}
          />
        </div>

        <div className={fr.cx("fr-mb-4w")}>
          <Select
            label="Moyen de contact préféré"
            nativeSelectProps={{
              name: "preferred_contact",
              required: true,
            }}
          >
            <option value="">Sélectionnez une option</option>
            <option value="email">Email</option>
            <option value="phone">Téléphone</option>
          </Select>
        </div>

        <div
          className={fr.cx("fr-btns-group", "fr-btns-group--inline-reverse")}
        >
          <Button type="submit">Envoyer</Button>
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
