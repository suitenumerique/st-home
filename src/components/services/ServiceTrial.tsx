import TrialContact from "@/components/TrialContact";
import { type ServiceTrialBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";

// Last block of the page: it needs more air above the footer than the DSFR
// spacing scale goes (`fr-pb-16w`, its largest step, is 8rem).
const BOTTOM_PADDING = "12rem";

export default function ServiceTrial({ block }: { block: ServiceTrialBlock }) {
  return (
    <section
      className={fr.cx("fr-container", "fr-pt-10w")}
      style={{ paddingBottom: BOTTOM_PADDING }}
    >
      <TrialContact primaryAction={block.accessLink} />
    </section>
  );
}
