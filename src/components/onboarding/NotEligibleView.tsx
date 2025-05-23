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
        {commune.type === "commune" ? (
          <p>
            La commune n&rsquo;est pas directement éligible car sa population de{" "}
            {commune.population.toLocaleString("fr-FR")} habitants dépasse le seuil fixé par
            l&rsquo;ANCT (3 500 habitants).
            <br />
            <br />
            Cependant, elle peut bénéficier d&rsquo;un accompagnement spécifique.
          </p>
        ) : (
          <p>
            L&rsquo;EPCI n&rsquo;est pas directement éligible car sa population de{" "}
            {commune.population.toLocaleString("fr-FR")} habitants dépasse le seuil fixé par
            l&rsquo;ANCT (15 000 habitants).
            <br />
            <br />
            Cependant, il peut bénéficier d&rsquo;un accompagnement spécifique.
          </p>
        )}
        <Button
          linkProps={{
            href: `mailto:lasuiteterritoriale@anct.gouv.fr`,
          }}
          priority="primary"
        >
          Contactez-nous pour en discuter !
        </Button>
      </div>
    </>
  );
}
