import TrialContact from "@/components/TrialContact";
import { ELIGIBILITY_SEARCH_ANCHOR, type ServicePage } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";

// Last block of the page, with a wide gap to the footer, as in the mockup.
const SECTION_PADDING_TOP = 120;
const SECTION_PADDING_BOTTOM = 240;

export default function ServiceTrial({ service }: { service: ServicePage }) {
  const accessLink = service.hero.eligibilitySearch
    ? { text: "Voir mes modalités d’accès", href: `#${ELIGIBILITY_SEARCH_ANCHOR}` }
    : undefined;

  return (
    <section
      className={fr.cx("fr-container")}
      style={{ paddingTop: SECTION_PADDING_TOP, paddingBottom: SECTION_PADDING_BOTTOM }}
    >
      <TrialContact primaryAction={accessLink} heading={service.trialHeading} />
    </section>
  );
}
