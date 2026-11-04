import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import {
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type RefObject,
  useId,
  useRef,
} from "react";

// Building blocks of the checks under the hero of the service pages
// (DomainCheck, ProConnectEmailCheck).

export const CONTACT_EMAIL = "contact@suite.anct.gouv.fr";

const SECTION_BACKGROUND =
  "linear-gradient(180deg, rgba(246, 246, 246, 0) 0%, var(--background-alt-grey) 50%)";
// The block above a check already ends on 120px of air.
const SECTION_PADDING_TOP = 24;

/**
 * A second check sent while the first is in flight must not let the slower
 * answer overwrite the newer one: only the answer of the latest `begin` counts.
 */
export function useLatestRequest() {
  const latest = useRef(0);

  return {
    begin: () => ++latest.current,
    cancel: () => {
      latest.current++;
    },
    isLatest: (request: number) => request === latest.current,
  };
}

export function CheckSection({
  title,
  titleClassName,
  paddingBottom,
  wide = false,
  children,
}: {
  title: ReactNode;
  titleClassName?: string;
  paddingBottom: number;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section style={{ backgroundImage: SECTION_BACKGROUND }}>
      <div
        className={fr.cx("fr-container")}
        style={{ paddingTop: SECTION_PADDING_TOP, paddingBottom }}
      >
        <div className={`${styles.heroSearchText} ${wide ? styles.heroSearchTextWide : ""}`}>
          <h2 className={`${fr.cx("fr-h3", "fr-mb-2w")} ${titleClassName ?? ""}`}>{title}</h2>
          {children}
        </div>
      </div>
    </section>
  );
}

export function CheckLead({ children }: { children: ReactNode }) {
  return (
    <p className={`${fr.cx("fr-text--md", "fr-mb-3w")} ${styles.heroSearchLead}`}>{children}</p>
  );
}

export function CheckNotice() {
  return (
    <p className={fr.cx("fr-text--xs", "fr-mt-1w", "fr-mb-0")}>
      Les données ne sont pas conservées.
    </p>
  );
}

export function CheckLoading() {
  return <p className={fr.cx("fr-mt-3w", "fr-mb-0")}>Vérification…</p>;
}

export function CheckActions({ children }: { children: ReactNode }) {
  return (
    <div
      className={fr.cx("fr-mt-3w")}
      style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}
    >
      {children}
    </div>
  );
}

/** What to offer when the input could not be read. */
export function CheckRetryActions({ onRetry }: { onRetry: () => void }) {
  return (
    <CheckActions>
      <button type="button" className={fr.cx("fr-btn")} onClick={onRetry}>
        Réessayer
      </button>
      <a href={`mailto:${CONTACT_EMAIL}`} className={fr.cx("fr-btn", "fr-btn--secondary")}>
        Nous contacter
      </a>
    </CheckActions>
  );
}

export function CheckBadge({
  severity,
  children,
}: {
  severity: "success" | "warning" | "error" | "info";
  children: ReactNode;
}) {
  return <p className={fr.cx("fr-badge", "fr-badge--sm", `fr-badge--${severity}`)}>{children}</p>;
}

export function CheckStatus({ rows }: { rows: { label: string; badge: ReactNode }[] }) {
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

/**
 * The field and its submit button. Once a check has been run (`idle` false),
 * submitting starts another one: the button then reads as a reset.
 */
export function CheckForm({
  inputRef,
  label,
  value,
  onChange,
  onSubmit,
  idle,
  submitLabel,
  resetLabel,
  greyedSubmit = false,
  message,
  inputProps,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  idle: boolean;
  submitLabel: string;
  resetLabel: string;
  /** Greys the submit button out, e.g. until something is typed. */
  greyedSubmit?: boolean;
  message?: { severity: "error" | "info"; text: string };
  inputProps: Pick<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "inputMode" | "autoComplete" | "autoCapitalize" | "spellCheck" | "placeholder"
  >;
}) {
  const id = useId();
  const messageId = `${id}-message`;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={submit} className={styles.emailCheck}>
      <div
        className={fr.cx(
          "fr-input-group",
          "fr-mb-0",
          ...(message ? ([`fr-input-group--${message.severity}`] as const) : []),
        )}
      >
        <label htmlFor={`${id}-input`} className={fr.cx("fr-sr-only")}>
          {label}
        </label>
        <div className={styles.emailCheckField}>
          <input
            ref={inputRef}
            id={`${id}-input`}
            className={fr.cx("fr-input")}
            value={value}
            required
            aria-describedby={message ? messageId : undefined}
            onChange={(event) => onChange(event.target.value)}
            {...inputProps}
          />
          <button
            type="submit"
            className={`${fr.cx("fr-btn")} ${styles.heroSearchReset} ${
              idle ? styles.emailCheckSubmit : ""
            } ${greyedSubmit ? styles.domainCheckSubmitEmpty : ""}`}
          >
            <span className={fr.cx("fr-sr-only")}>{idle ? submitLabel : resetLabel}</span>
          </button>
        </div>
        {message && (
          <div className={fr.cx("fr-messages-group")} id={messageId} aria-live="polite">
            <p className={fr.cx("fr-message", `fr-message--${message.severity}`)}>{message.text}</p>
          </div>
        )}
      </div>
    </form>
  );
}
