import { type Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
// import Link from "next/link";

interface Props {
  commune?: Commune;
}

export default function ComingSoonView({}: Props) {
  return (
    <>
      <div
        className={fr.cx("fr-py-4w", "fr-px-4w")}
        style={{ backgroundColor: "var(--background-alt-blue-france)" }}
      >
        <h2>La Suite territoriale arrive bientôt !</h2>
        <p>
          Vous représentez une collectivité ? Inscrivez-vous dès maintenant pour
          être les premiers informés et testeurs :)
        </p>
        <Button
          linkProps={{
            href: "https://grist.incubateur.anct.gouv.fr/o/anct/forms/nuyZtejstHFwuekKzP3Juz/281",
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
