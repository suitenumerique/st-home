import { fr } from "@codegouvfr/react-dsfr";
import Image from "next/image";
import Link from "next/link";

export default function ContactUs() {
  return (
    <div
      style={{
        position: "relative",
      }}
      className={fr.cx("fr-grid-row")}
    >
      <Image
        src="/images/coin-top-left.svg"
        alt=""
        role="presentation"
        width={48}
        height={50}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      <Image
        src="/images/coin-bottom-right.svg"
        alt=""
        role="presentation"
        width={48}
        height={50}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
        }}
      />
      <div className={fr.cx("fr-pt-7w", "fr-pb-4w", "fr-col-offset-sm-1", "fr-col-sm-10")}>
        <h3 className={fr.cx("fr-h3", "fr-mb-2w")}>Vous avez une question ? Une remarque ?</h3>
        <p className={fr.cx("fr-mb-2w")}>
          Vous souhaitez devenir partenaire de la Suite territoriale ou vous avez une question sur{" "}
          <Link href="/services" className={fr.cx("fr-link")}>
            nos services
          </Link>{" "}
          ?
        </p>
        <p>
          Écrivez-nous à{" "}
          <Link href="mailto:lasuiteterritoriale@anct.gouv.fr" className={fr.cx("fr-link")}>
            lasuiteterritoriale@anct.gouv.fr
          </Link>
        </p>
      </div>
    </div>
  );
}
