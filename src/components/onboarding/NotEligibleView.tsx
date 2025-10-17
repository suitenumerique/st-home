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

        {commune.insee_reg?.startsWith("0") ? (
          <p>
            Les collectivités d'Outre-mer intéressées par la Suite territoriale peuvent bénéficier
            d&rsquo;un accompagnement spécifique.
          </p>
        ) : (
          <>
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
                La collectivité n&rsquo;est pas directement éligible car sa population de{" "}
                {commune.population.toLocaleString("fr-FR")} habitants dépasse le seuil fixé par
                l&rsquo;ANCT (15 000 habitants).
                <br />
                <br />
                Cependant, elle peut bénéficier d&rsquo;un accompagnement spécifique.
              </p>
            )}
          </>
        )}
        <Button
          linkProps={{
            href: `mailto:contact@suite.anct.gouv.fr`,
          }}
          priority="primary"
        >
          Contactez-nous pour en discuter !
        </Button>
      </div>
    </>
  );
}
