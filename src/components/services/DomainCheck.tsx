import { checkDomain, type DomainCheck as Check } from "@/lib/domaines/checkDomain";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";

const SECTION_BACKGROUND =
  "linear-gradient(180deg, rgba(246, 246, 246, 0) 0%, var(--background-alt-grey) 50%)";
// The prerequisites above already end on 120px of air.
const SECTION_PADDING_TOP = 24;
const SECTION_PADDING_BOTTOM = 80;
const CONTACT_EMAIL = "contact@suite.anct.gouv.fr";
const TERRITOIRES_URL = "/territoires";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "result"; check: Exclude<Check, { kind: "invalid" }> }
  | { status: "invalid" };

export default function DomainCheck({ offersHref }: { offersHref: string }) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  // A second check sent while the first is in flight must not let the slower
  // answer overwrite the newer one.
  const requestId = useRef(0);
  const messageId = useId();

  const run = async (input: string) => {
    const id = ++requestId.current;
    setState({ status: "loading" });

    const check = await checkDomain(input);
    if (id !== requestId.current) return;
    setState(check.kind === "invalid" ? { status: "invalid" } : { status: "result", check });
  };

  const reset = ({ keepValue = false } = {}) => {
    requestId.current++;
    if (!keepValue) setValue("");
    setState({ status: "idle" });
    inputRef.current?.focus();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (state.status === "idle") {
      run(value);
    } else {
      reset();
    }
  };

  const error = state.status === "invalid";
  const empty = state.status === "idle" && value.trim() === "";

  return (
    <section style={{ backgroundImage: SECTION_BACKGROUND }}>
      <div
        className={fr.cx("fr-container")}
        style={{ paddingTop: SECTION_PADDING_TOP, paddingBottom: SECTION_PADDING_BOTTOM }}
      >
        <div className={styles.heroSearchText}>
          <h2 className={fr.cx("fr-h3", "fr-mb-2w")}>
            Vérifier le nom de domaine de ma collectivité
          </h2>

          {state.status !== "result" && (
            <p className={`${fr.cx("fr-text--md", "fr-mb-3w")} ${styles.heroSearchLead}`}>
              Renseignez ci-dessous l&rsquo;adresse de messagerie ou le site internet de votre
              collectivité pour vérifier sa conformité.
            </p>
          )}

          <form onSubmit={submit} className={styles.emailCheck}>
            <div
              className={fr.cx(
                "fr-input-group",
                "fr-mb-0",
                ...(error ? (["fr-input-group--error"] as const) : []),
              )}
            >
              <label htmlFor={`${messageId}-input`} className={fr.cx("fr-sr-only")}>
                Adresse de messagerie ou site internet
              </label>
              <div className={styles.emailCheckField}>
                <input
                  ref={inputRef}
                  id={`${messageId}-input`}
                  className={fr.cx("fr-input")}
                  type="text"
                  inputMode="url"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="Entrer nomdemairie.fr ou contact@nomdemairie.fr"
                  value={value}
                  required
                  aria-describedby={error ? messageId : undefined}
                  onChange={(event) => {
                    setValue(event.target.value);
                    if (state.status !== "idle") {
                      requestId.current++;
                      setState({ status: "idle" });
                    }
                  }}
                />
                <button
                  type="submit"
                  className={`${fr.cx("fr-btn")} ${styles.heroSearchReset} ${
                    state.status === "idle" ? styles.emailCheckSubmit : ""
                  } ${empty ? styles.domainCheckSubmitEmpty : ""}`}
                >
                  <span className={fr.cx("fr-sr-only")}>
                    {state.status === "idle" ? "Vérifier" : "Vérifier un autre nom de domaine"}
                  </span>
                </button>
              </div>
              {error && (
                <div className={fr.cx("fr-messages-group")} id={messageId} aria-live="polite">
                  <p className={fr.cx("fr-message", "fr-message--error")}>Format non reconnu</p>
                </div>
              )}
            </div>
          </form>

          {state.status === "idle" && (
            <>
              <p className={fr.cx("fr-text--xs", "fr-mt-1w", "fr-mb-0")}>
                Les données ne sont pas conservées.
              </p>
              <p className={fr.cx("fr-mt-3w", "fr-mb-0")}>
                <Link href={offersHref} className={fr.cx("fr-link")}>
                  Aucun nom de domaine&nbsp;? Découvrez les offres existantes.
                </Link>
              </p>
            </>
          )}

          {state.status === "loading" && (
            <p className={fr.cx("fr-mt-3w", "fr-mb-0")}>Vérification…</p>
          )}

          {error && (
            <Actions>
              <button
                type="button"
                className={fr.cx("fr-btn")}
                onClick={() => reset({ keepValue: true })}
              >
                Réessayer
              </button>
              <a href={`mailto:${CONTACT_EMAIL}`} className={fr.cx("fr-btn", "fr-btn--secondary")}>
                Nous contacter
              </a>
            </Actions>
          )}

          {state.status === "result" && <Result check={state.check} offersHref={offersHref} />}
        </div>
      </div>
    </section>
  );
}

function Actions({ children }: { children: ReactNode }) {
  return (
    <div
      className={fr.cx("fr-mt-3w")}
      style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}
    >
      {children}
    </div>
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
  const servicesHref =
    "siret" in check && check.siret ? `/bienvenue/${check.siret}` : TERRITOIRES_URL;
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
      <dl className={`${fr.cx("fr-mt-3w", "fr-mb-2w")} ${styles.emailCheckStatus}`}>
        <dt className={fr.cx("fr-text--md", "fr-text--bold", "fr-mb-0")}>Nom de domaine</dt>
        <dd className={fr.cx("fr-mb-0")}>
          <p className={fr.cx("fr-badge", "fr-badge--sm", `fr-badge--${severity}`)}>{badge}</p>
        </dd>
      </dl>
      <p className={fr.cx("fr-text--md", "fr-mb-0")}>{text}</p>
      <Actions>{actions}</Actions>
    </>
  );
}
