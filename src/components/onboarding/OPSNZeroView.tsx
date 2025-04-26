import { type Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
// import Link from "next/link";

interface Props {
  commune: Commune;
}

export default function OPSNZeroView({ commune }: Props) {
  return (
    <>
      <div
        className={fr.cx("fr-py-4w", "fr-px-4w")}
        style={{ backgroundColor: "var(--background-alt-blue-france)" }}
      >
        <h2>La Suite territoriale arrive bientôt !</h2>
        <p>
          Vous êtes agent public ou élu local d&rsquo;une collectivité territoriale française ?
          Rejoignez le Groupe pilote pour rester informé et tester les services.
        </p>
        <Button
          linkProps={{
            href: `/bienvenue/${commune.siret}/inscription`,
          }}
          priority="primary"
        >
          Rejoindre le Groupe pilote
        </Button>
      </div>

      {/*
      <p>
        Vous souhaitez devenir une structure de mutualisation partenaire de la
        Suite territoriale ?{" "}
        <Link href="mailto:lasuiteterritoriale@anct.gouv.fr">Contactez-nous.</Link>
      </p>
      */}
    </>
  );
}
