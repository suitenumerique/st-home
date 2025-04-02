import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";

export default function BackToTop() {
  return (
    <div className={fr.cx("fr-mb-4w")} style={{ textAlign: "center" }}>
      <div className={fr.cx("fr-container")}>
        <Link
          className={fr.cx("fr-link", "fr-link--icon-left", "fr-icon-arrow-up-fill")}
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Haut de page
        </Link>
      </div>
    </div>
  );
}
