import TrialContact from "@/components/TrialContact";
import { ELIGIBILITY_SEARCH_ANCHOR, type ServicePage } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";

const FOOTER_GAP = "12rem";

export default function ServiceTrial({ service }: { service: ServicePage }) {
  const accessLink = service.hero.eligibilitySearch
    ? { text: "Voir mes modalités d’accès", href: `#${ELIGIBILITY_SEARCH_ANCHOR}` }
    : undefined;

  return (
    <section className={fr.cx("fr-container")} style={{ marginBottom: FOOTER_GAP }}>
      <TrialContact primaryAction={accessLink} />
    </section>
  );
}
