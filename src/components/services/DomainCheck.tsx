import { checkDomain, type DomainCheck as Check } from "@/lib/domaines/checkDomain";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import {
  CheckActions,
  CheckBadge,
  CheckForm,
  CheckLead,
  CheckLoading,
  CheckNotice,
  CheckRetryActions,
  CheckSection,
  CheckStatus,
  useLatestRequest,
} from "./CheckParts";

const SECTION_PADDING_BOTTOM = 80;
const HOME_URL = "/";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "result"; check: Exclude<Check, { kind: "invalid" }> }
  | { status: "invalid" };

export default function DomainCheck({ offersHref }: { offersHref: string }) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const requests = useLatestRequest();

  const run = async (input: string) => {
    const request = requests.begin();
    setState({ status: "loading" });

    const check = await checkDomain(input);
    if (!requests.isLatest(request)) return;
    setState(check.kind === "invalid" ? { status: "invalid" } : { status: "result", check });
  };

  const reset = ({ keepValue = false } = {}) => {
    requests.cancel();
    if (!keepValue) setValue("");
    setState({ status: "idle" });
    inputRef.current?.focus();
  };

  const error = state.status === "invalid";
  const wide =
    state.status === "result" &&
    (state.check.kind === "accent" || state.check.kind === "compliant");

  return (
    <CheckSection
      title="Vérifier le nom de domaine de ma collectivité"
      paddingBottom={SECTION_PADDING_BOTTOM}
      wide={wide}
    >
      {state.status !== "result" && (
        <CheckLead>
          Renseignez ci-dessous l&rsquo;adresse de messagerie ou le site internet de votre
          collectivité pour vérifier sa conformité.
        </CheckLead>
      )}

      <CheckForm
        inputRef={inputRef}
        label="Adresse de messagerie ou site internet"
        value={value}
        onChange={(next) => {
          setValue(next);
          if (state.status !== "idle") {
            requests.cancel();
            setState({ status: "idle" });
          }
        }}
        onSubmit={() => (state.status === "idle" ? run(value) : reset())}
        idle={state.status === "idle"}
        submitLabel="Vérifier"
        resetLabel="Vérifier un autre nom de domaine"
        greyedSubmit={state.status === "idle" && value.trim() === ""}
        message={error ? { severity: "error", text: "Format non reconnu" } : undefined}
        inputProps={{
          type: "text",
          inputMode: "url",
          autoCapitalize: "none",
          spellCheck: false,
          placeholder: "Entrer nomdemairie.fr ou contact@nomdemairie.fr",
        }}
      />

      {state.status === "idle" && (
        <>
          <CheckNotice />
          <p className={fr.cx("fr-mt-3w", "fr-mb-0")}>
            <Link href={offersHref} className={fr.cx("fr-link")}>
              Aucun nom de domaine&nbsp;? Découvrez les offres existantes.
            </Link>
          </p>
        </>
      )}

      {state.status === "loading" && <CheckLoading />}

      {error && <CheckRetryActions onRetry={() => reset({ keepValue: true })} />}

      {state.status === "result" && <Result check={state.check} offersHref={offersHref} />}
    </CheckSection>
  );
}

function Result({
  check,
  offersHref,
}: {
  check: Exclude<Check, { kind: "invalid" }>;
  offersHref: string;
}) {
  const getDomain = (
    <Link href={offersHref} className={fr.cx("fr-btn")}>
      Obtenir un nom de domaine
    </Link>
  );
  const servicesHref = "siret" in check && check.siret ? `/bienvenue/${check.siret}` : HOME_URL;
  const startServices = (secondary: boolean) => (
    <Link
      href={servicesHref}
      className={fr.cx("fr-btn", ...(secondary ? (["fr-btn--secondary"] as const) : []))}
    >
      {secondary ? "Commencer à utiliser les services" : "Découvrir mes services"}
    </Link>
  );

  const { severity, badge, text, actions } = ((): {
    severity: "success" | "warning" | "error";
    badge: string;
    text: ReactNode;
    actions: ReactNode;
  } => {
    switch (check.kind) {
      case "extension":
        return {
          severity: "error",
          badge: "Extension inadaptée",
          text: (
            <>
              L&rsquo;extension .{check.extension}&nbsp;est destinée à d&rsquo;autres usages.
              Réservez un nom de domaine officiel avec l&rsquo;extension .fr ou une extension
              d&rsquo;outre-mer et régionale.
            </>
          ),
          actions: getDomain,
        };
      case "accent":
        return {
          severity: "error",
          badge: "Caractère accentué",
          text: (
            <>
              Les noms de domaine accentués s&rsquo;affichent mal dans certains logiciels et
              facilitent l&rsquo;usurpation par des caractères qui se ressemblent. Réservez un nom
              de domaine sans accent.
            </>
          ),
          actions: getDomain,
        };
      case "generic":
        return {
          severity: "error",
          badge: "Domaine générique",
          text: (
            <>
              Le domaine {check.domain}&nbsp;est générique et utilisé par de nombreuses personnes.
              Réservez un nom de domaine appartenant à votre collectivité.
            </>
          ),
          actions: getDomain,
        };
      case "homonym":
        return {
          severity: "warning",
          badge: "Homonyme détecté",
          text: (
            <>
              Plusieurs collectivités se nomment {check.name}. Pour éviter toute confusion et
              identifier plus facilement votre collectivité, il est recommandé d&rsquo;ajouter le
              numéro de votre département.
            </>
          ),
          actions: (
            <>
              {getDomain}
              {startServices(true)}
            </>
          ),
        };
      case "compliant":
        return {
          severity: "success",
          badge: "Conforme",
          text: (
            <>
              Bonne nouvelle&nbsp;! Le nom de domaine respecte les critères du Référentiel de la
              présence numérique des territoires.
              <br />
              Découvrez vos services selon votre administration et sa localisation.
            </>
          ),
          actions: startServices(false),
        };
    }
  })();

  return (
    <>
      <CheckStatus
        rows={[
          { label: "Nom de domaine", badge: <CheckBadge severity={severity}>{badge}</CheckBadge> },
        ]}
      />
      <p className={fr.cx("fr-text--md", "fr-mb-0")}>{text}</p>
      <CheckActions>{actions}</CheckActions>
    </>
  );
}
