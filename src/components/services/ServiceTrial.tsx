import TrialContact from "@/components/TrialContact";
import { type ServiceTrialBlock } from "@/lib/services/types";
import { fr } from "@codegouvfr/react-dsfr";

// Last block of the page: the gap to the footer is wider than the shared
// section gap, and than the DSFR spacing scale goes (`fr-mb-16w`, its
// largest step, is 8rem).
const FOOTER_GAP = "12rem";

export default function ServiceTrial({ block }: { block: ServiceTrialBlock }) {
  return (
    <section className={fr.cx("fr-container")} style={{ marginBottom: FOOTER_GAP }}>
      <TrialContact primaryAction={block.accessLink} />
    </section>
  );
}
