import { Button } from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

export default function TrialContact({
  signupUrl,
  priority,
}: {
  signupUrl?: string;
  priority?: "primary" | "secondary";
}) {
  return (
    <div className="trial-contact">
      <Image
        className="trial-contact__image"
        src="/images/interest-test.svg"
        alt=""
        role="presentation"
        width={580}
        height={105}
        sizes="(max-width: 768px) 100vw, 580px"
        style={{ width: "100%", maxWidth: 580, height: "auto" }}
      />
      <div className="buttons">
        {signupUrl ? (
          <Button priority={priority || "secondary"} linkProps={{ href: signupUrl }}>
            Nous contacter
          </Button>
        ) : (
          <Button
            priority={priority || "secondary"}
            iconPosition="left"
            iconId="fr-icon-mail-fill"
            linkProps={{ href: "mailto:contact@suite.anct.gouv.fr" }}
          >
            Nous contacter
          </Button>
        )}
      </div>
    </div>
  );
}
