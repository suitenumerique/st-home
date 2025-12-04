import { Commune } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";

type DepartmentPresenceViewProps = {
  organisation: Commune;
};

/**
 * View for displaying the department presence indicators
 */
export default function DepartmentPresenceView({ organisation }: DepartmentPresenceViewProps) {
  return (
    <div className={fr.cx("fr-container")}>
      <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
        <h2 className={fr.cx("fr-h2")}>Consultez la présence numérique de votre département</h2>

        <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
          <div className="departement-section">
            <p className="section-name">
              Les Chiffres clés de la conformité · {organisation.insee_dep}
            </p>
            <p className="section-description">
              Tout comprendre sur le niveau de conformité de votre département.
            </p>
            <div className={fr.cx("fr-grid-row")}>
              <div className={fr.cx("fr-col-6")}>
                <div className="card-indicator">
                  <p className="card-value">56 %</p>
                  <p className="card-title">des collectivités ont un site web conforme</p>
                </div>
              </div>
              <div className={fr.cx("fr-col-6")}>
                <div className="card-indicator">
                  <p className="card-value">
                    <i
                      className={fr.cx("fr-icon-arrow-up-line", "fr-icon--md")}
                      aria-hidden="true"
                    />
                    2 %
                  </p>
                  <p className="card-title">
                    Progression du dernier trimestre de la mise en conformité
                  </p>
                </div>
              </div>
              <div className={fr.cx("fr-col-6")}>
                <div className="card-indicator">
                  <p className="card-value">37 %</p>
                  <p className="card-title">des collectivités ont une messagerie conforme</p>
                </div>
              </div>
            </div>
            <p className="fr-mb-1w">
              <Link className="fr-link" href="">
                Voir la cartographie de la présence numérique
                <i
                  className={fr.cx("fr-icon-arrow-right-line", "fr-icon--sm", "fr-ml-1w")}
                  aria-hidden="true"
                />
              </Link>
            </p>
          </div>
        </div>

        <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
          <div className="departement-section">
            <p className="section-name">
              Les Chiffres clés du déploiement · {organisation.insee_dep}
            </p>
            <p className="section-description">
              Découvrez les utilisateurs de nos services dans votre département.
            </p>
            <div className={fr.cx("fr-grid-row")}>
              <div className={fr.cx("fr-col-6")}>
                <div className="card-indicator">
                  <p className="card-value">156</p>
                  <p className="card-title">Utilisateurs de la Suite territoriale</p>
                </div>
              </div>
              <div className={fr.cx("fr-col-6")}>
                <div className="card-indicator">
                  <p className="card-value">9</p>
                  <p className="card-title">Accompagnements</p>
                </div>
              </div>
              <div className={fr.cx("fr-col-6")}>
                <div className="card-indicator">
                  <p className="card-value">579</p>
                  <p className="card-title">Base adresses locale</p>
                </div>
              </div>
              <div className={fr.cx("fr-col-6")}>
                <div className="card-indicator">
                  <p className="card-value">
                    <i
                      className={fr.cx("fr-icon-arrow-up-line", "fr-icon--md")}
                      aria-hidden="true"
                    />
                    4 %
                  </p>
                  <p className="card-title">
                    Progression du dernier trimestre des utilisateurs actifs
                  </p>
                </div>
              </div>
            </div>
            <p className="fr-mb-1w">
              <Link className="fr-link" href="">
                Voir la cartographie de la présence numérique
                <i
                  className={fr.cx("fr-icon-arrow-right-line", "fr-icon--sm", "fr-ml-1w")}
                  aria-hidden="true"
                />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
