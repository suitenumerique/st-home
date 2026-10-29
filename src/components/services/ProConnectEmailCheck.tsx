import CommuneSearch, { type Commune } from "@/components/CommuneSearch";
import { useSmallScreen } from "@/lib/hooks";
import { checkEmail, EMAIL_FORMAT, type EmailCheck } from "@/lib/proconnect/checkEmail";
import { isSharedAddress } from "@/lib/proconnect/sharedAddresses";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import { type FormEvent, type ReactNode, useId, useRef, useState } from "react";

const SECTION_BACKGROUND =
  "linear-gradient(180deg, rgba(246, 246, 246, 0) 0%, var(--background-alt-grey) 50%)";
// The timeline above already ends on 120px of air.
const SECTION_PADDING_TOP = 24;
const SECTION_PADDING_BOTTOM = 120;
const CONTACT_EMAIL = "contact@suite.anct.gouv.fr";
const MESSAGES_URL = "/services/messages";
const DOMAINES_URL = "/services/domaines";
const COMMUNE_PLACEHOLDER = "Entrez le nom de votre territoire ou son code postal";
const COMMUNE_PLACEHOLDER_SMALL_SCREEN = "Nom ou code postal";

type State =
  | { status: "idle" }
  | { status: "loading"; email: string }
  | { status: "result"; email: string; check: EmailCheck }
  | { status: "unavailable"; email: string };

export default function ProConnectEmailCheck() {
  const isSmallScreen = useSmallScreen(1000);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  // A second check sent while the first is in flight must not let the slower
  // answer overwrite the newer one.
  const requestId = useRef(0);
  const messageId = useId();

  const run = async (address: string, organization?: Commune) => {
    const id = ++requestId.current;

    if (!EMAIL_FORMAT.test(address)) {
      setState({ status: "result", email: address, check: { kind: "invalid" } });
      return;
    }

    setState({ status: "loading", email: address });

    try {
      const check = await checkEmail(address, organization);
      if (id !== requestId.current) return;
      setState({
        status: "result",
        email: address,
        check:
          check.kind === "compliant" && isSharedAddress(address)
            ? { kind: "shared", provider: check.provider }
            : check,
      });
    } catch (error) {
      console.error("Error checking email", error);
      if (id !== requestId.current) return;
      setState({ status: "unavailable", email: address });
    }
  };

  const reset = ({ keepEmail = false } = {}) => {
    requestId.current++;
    if (!keepEmail) setEmail("");
    setState({ status: "idle" });
    inputRef.current?.focus();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (state.status === "idle") {
      run(email.trim());
    } else {
      reset();
    }
  };

  const check = state.status === "result" ? state.check : null;

  if (state.status === "result" && check?.kind === "unknown") {
    return (
      <Section>
        <p className={fr.cx("fr-text--md", "fr-mb-3w")}>
          L&rsquo;adresse <strong>{state.email}</strong>&nbsp;n&rsquo;est rattachée à aucune
          collectivité dans nos annuaires, veuillez préciser le nom de votre collectivité.
        </p>
        <div
          className={`${styles.heroSearch} ${styles.heroSearchArrowRight}`}
          style={{ textAlign: "left" }}
        >
          <CommuneSearch
            smallButton
            placeholder={isSmallScreen ? COMMUNE_PLACEHOLDER_SMALL_SCREEN : COMMUNE_PLACEHOLDER}
            onSelect={(commune) => run(state.email, commune)}
          />
        </div>
        <Notice />
        <button
          type="button"
          className={fr.cx("fr-link", "fr-link--icon-left", "fr-icon-arrow-left-line", "fr-mt-3w")}
          onClick={() => reset()}
        >
          revenir en arrière
        </button>
      </Section>
    );
  }

  const error = check?.kind === "invalid";
  const unavailable = state.status === "unavailable";

  return (
    <Section wide={check?.kind === "generic"}>
      {(state.status !== "result" || error) && (
        <p className={`${fr.cx("fr-text--md", "fr-mb-3w")} ${styles.heroSearchLead}`}>
          Pour connaître votre fournisseur d&rsquo;identité et vérifier la conformité de votre
          adresse, veuillez indiquer l&rsquo;adresse courriel que vous souhaitez utiliser.
        </p>
      )}

      <form onSubmit={submit} className={styles.emailCheck}>
        <div
          className={fr.cx(
            "fr-input-group",
            "fr-mb-0",
            ...(error ? (["fr-input-group--error"] as const) : []),
            ...(unavailable ? (["fr-input-group--info"] as const) : []),
          )}
        >
          <label htmlFor={`${messageId}-input`} className={fr.cx("fr-sr-only")}>
            Adresse de messagerie
          </label>
          <div className={styles.emailCheckField}>
            <input
              ref={inputRef}
              id={`${messageId}-input`}
              className={fr.cx("fr-input")}
              type="email"
              autoComplete="email"
              placeholder="Entrer votre adresse de messagerie"
              value={email}
              required
              aria-describedby={error || unavailable ? messageId : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
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
              }`}
            >
              <span className={fr.cx("fr-sr-only")}>
                {state.status === "idle" ? "Vérifier" : "Vérifier une autre adresse"}
              </span>
            </button>
          </div>
          {(error || unavailable) && (
            <div className={fr.cx("fr-messages-group")} id={messageId} aria-live="polite">
              <p className={fr.cx("fr-message", error ? "fr-message--error" : "fr-message--info")}>
                {error
                  ? "Format d’adresse de messagerie invalide"
                  : "Le service de vérification est momentanément indisponible. Réessayez dans quelques minutes."}
              </p>
            </div>
          )}
        </div>
      </form>

      {state.status === "idle" && <Notice />}
      {state.status === "loading" && <p className={fr.cx("fr-mt-3w", "fr-mb-0")}>Vérification…</p>}

      {error && (
        <Actions>
          <button
            type="button"
            className={fr.cx("fr-btn")}
            onClick={() => reset({ keepEmail: true })}
          >
            Réessayer
          </button>
          <a href={`mailto:${CONTACT_EMAIL}`} className={fr.cx("fr-btn", "fr-btn--secondary")}>
            Nous contacter
          </a>
        </Actions>
      )}

      {check && check.kind !== "invalid" && check.kind !== "unknown" && (
        <Result check={check} onReset={() => reset()} />
      )}
    </Section>
  );
}

function Section({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <section style={{ backgroundImage: SECTION_BACKGROUND }}>
      <div
        className={fr.cx("fr-container")}
        style={{ paddingTop: SECTION_PADDING_TOP, paddingBottom: SECTION_PADDING_BOTTOM }}
      >
        <div className={`${styles.heroSearchText} ${wide ? styles.heroSearchTextWide : ""}`}>
          <h2 className={`${fr.cx("fr-h3", "fr-mb-2w")} ${styles.emailCheckTitle}`}>
            Vérifier mon adresse de messagerie pour l&rsquo;authentification ProConnect
          </h2>
          {children}
        </div>
      </div>
    </section>
  );
}

function Notice() {
  return (
    <p className={fr.cx("fr-text--xs", "fr-mt-1w", "fr-mb-0")}>
      Les données ne sont pas conservées.
    </p>
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

function Status({ rows }: { rows: { label: string; badge: ReactNode }[] }) {
  return (
    <dl className={`${fr.cx("fr-mt-3w", "fr-mb-2w")} ${styles.emailCheckStatus}`}>
      {rows.map((row) => (
        <div key={row.label} style={{ display: "contents" }}>
          <dt className={fr.cx("fr-text--md", "fr-text--bold", "fr-mb-0")}>{row.label}</dt>
          <dd className={fr.cx("fr-mb-0")}>{row.badge}</dd>
        </div>
      ))}
    </dl>
  );
}

function Badge({
  severity,
  children,
}: {
  severity: "success" | "error" | "info";
  children: ReactNode;
}) {
  return <p className={fr.cx("fr-badge", "fr-badge--sm", `fr-badge--${severity}`)}>{children}</p>;
}

function Result({
  check,
  onReset,
}: {
  check: Exclude<EmailCheck, { kind: "invalid" } | { kind: "unknown" }>;
  onReset: () => void;
}) {
  const provider = {
    label: "Fournisseur d’identité",
    badge: <Badge severity="info">{check.provider}</Badge>,
  };

  switch (check.kind) {
    case "compliant":
      return (
        <>
          <Status
            rows={[
              {
                label: "Nom de domaine et adresse",
                badge: <Badge severity="success">Conforme</Badge>,
              },
              provider,
            ]}
          />
          <p className={fr.cx("fr-text--md", "fr-mb-0")}>
            Votre adresse de messagerie est reconnue par ProConnect. Vous pouvez créer votre compte
            ProConnect avec cette adresse auprès de votre fournisseur d&rsquo;identité.
          </p>
          <Actions>
            <Link href={`/bienvenue/${check.siret}`} className={fr.cx("fr-btn")}>
              Découvrir mes services
            </Link>
          </Actions>
        </>
      );
    case "shared":
      return (
        <>
          <Status
            rows={[
              { label: "Adresse de messagerie", badge: <Badge severity="error">Partagée</Badge> },
              provider,
            ]}
          />
          <p className={fr.cx("fr-text--md", "fr-mb-0")}>
            Le nom de domaine est conforme, mais cette adresse est partagée entre plusieurs
            personnes. Un compte ProConnect est individuel et requiert une adresse nominative. Créez
            votre adresse de messagerie avec votre nom de domaine (prenom.nom@nomdemairie.fr).
          </p>
          <Actions>
            <Link href={MESSAGES_URL} className={fr.cx("fr-btn")}>
              Créer des adresses avec Messages
            </Link>
            <button
              type="button"
              className={fr.cx("fr-btn", "fr-btn--secondary")}
              onClick={onReset}
            >
              Vérifier une autre adresse
            </button>
          </Actions>
        </>
      );
    case "generic":
      return (
        <>
          <Status
            rows={[
              {
                label: "Nom de domaine",
                badge: (
                  <Badge severity="error">
                    {check.genericDomain ? "Générique" : "Non reconnu"}
                  </Badge>
                ),
              },
              provider,
            ]}
          />
          <p className={fr.cx("fr-text--md", "fr-mb-0")}>
            {check.genericDomain ? (
              <>
                Le domaine {check.domain}&nbsp;est générique et utilisé par de nombreuses personnes.
              </>
            ) : (
              <>
                Le domaine {check.domain}&nbsp;n&rsquo;est pas celui de votre collectivité dans
                l&rsquo;Annuaire de l&rsquo;administration.
              </>
            )}{" "}
            ProConnect ne peut pas l&rsquo;associer à <strong>{check.organizationName}</strong>.
            Pour créer votre compte, votre collectivité doit disposer d&rsquo;un nom de domaine
            institutionnel (nomdemairie.fr) et d&rsquo;une adresse nominative sur ce domaine
            (prenom.nom@nomdemairie.fr).
          </p>
          <Actions>
            <Link href={DOMAINES_URL} className={fr.cx("fr-btn")}>
              Obtenir un nom de domaine
            </Link>
          </Actions>
        </>
      );
  }
}
