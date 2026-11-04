import CommuneSearch, { type Commune } from "@/components/CommuneSearch";
import { useSmallScreen } from "@/lib/hooks";
import { checkEmail, EMAIL_FORMAT, type EmailCheck } from "@/lib/proconnect/checkEmail";
import { isSharedAddress } from "@/lib/proconnect/sharedAddresses";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import { type ReactNode, useRef, useState } from "react";
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

const SECTION_PADDING_BOTTOM = 120;
const MESSAGES_URL = "/services/messages";
const DOMAINES_URL = "/services/domaines";
const COMMUNE_PLACEHOLDER = "Entrez le nom de votre territoire ou son code postal";
const COMMUNE_PLACEHOLDER_SMALL_SCREEN = "Nom ou code postal";
const UNAVAILABLE_MESSAGE =
  "Le service de vérification est momentanément indisponible. Réessayez dans quelques minutes.";

type State =
  | { status: "idle" }
  | { status: "loading"; email: string }
  | { status: "result"; email: string; check: EmailCheck }
  | { status: "unavailable"; email: string };

function Section({ wide = false, children }: { wide?: boolean; children: ReactNode }) {
  return (
    <CheckSection
      title="Vérifier mon adresse de messagerie pour l’authentification ProConnect"
      titleClassName={styles.emailCheckTitle}
      paddingBottom={SECTION_PADDING_BOTTOM}
      wide={wide}
    >
      {children}
    </CheckSection>
  );
}

export default function ProConnectEmailCheck() {
  const isSmallScreen = useSmallScreen(1000);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const requests = useLatestRequest();

  const run = async (address: string, organization?: Commune) => {
    const request = requests.begin();

    if (!EMAIL_FORMAT.test(address)) {
      setState({ status: "result", email: address, check: { kind: "invalid" } });
      return;
    }

    setState({ status: "loading", email: address });

    try {
      const check = await checkEmail(address, organization);
      if (!requests.isLatest(request)) return;
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
      if (!requests.isLatest(request)) return;
      setState({ status: "unavailable", email: address });
    }
  };

  const reset = ({ keepEmail = false } = {}) => {
    requests.cancel();
    if (!keepEmail) setEmail("");
    setState({ status: "idle" });
    inputRef.current?.focus();
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
        <CheckNotice />
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
        <CheckLead>
          Pour connaître votre fournisseur d&rsquo;identité et vérifier la conformité de votre
          adresse, veuillez indiquer l&rsquo;adresse courriel que vous souhaitez utiliser.
        </CheckLead>
      )}

      <CheckForm
        inputRef={inputRef}
        label="Adresse de messagerie"
        value={email}
        onChange={(next) => {
          setEmail(next);
          if (state.status !== "idle") {
            requests.cancel();
            setState({ status: "idle" });
          }
        }}
        onSubmit={() => (state.status === "idle" ? run(email.trim()) : reset())}
        idle={state.status === "idle"}
        submitLabel="Vérifier"
        resetLabel="Vérifier une autre adresse"
        message={
          error
            ? { severity: "error", text: "Format d’adresse de messagerie invalide" }
            : unavailable
              ? { severity: "info", text: UNAVAILABLE_MESSAGE }
              : undefined
        }
        inputProps={{
          type: "email",
          autoComplete: "email",
          placeholder: "Entrer votre adresse de messagerie",
        }}
      />

      {state.status === "idle" && <CheckNotice />}
      {state.status === "loading" && <CheckLoading />}

      {error && <CheckRetryActions onRetry={() => reset({ keepEmail: true })} />}

      {check && check.kind !== "invalid" && check.kind !== "unknown" && (
        <Result check={check} onReset={() => reset()} />
      )}
    </Section>
  );
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
    badge: <CheckBadge severity="info">{check.provider}</CheckBadge>,
  };

  switch (check.kind) {
    case "compliant":
      return (
        <>
          <CheckStatus
            rows={[
              {
                label: "Nom de domaine et adresse",
                badge: <CheckBadge severity="success">Conforme</CheckBadge>,
              },
              provider,
            ]}
          />
          <p className={fr.cx("fr-text--md", "fr-mb-0")}>
            Votre adresse de messagerie est reconnue par ProConnect. Vous pouvez créer votre compte
            ProConnect avec cette adresse auprès de votre fournisseur d&rsquo;identité.
          </p>
          <CheckActions>
            <Link href={`/bienvenue/${check.siret}`} className={fr.cx("fr-btn")}>
              Découvrir mes services
            </Link>
          </CheckActions>
        </>
      );
    case "shared":
      return (
        <>
          <CheckStatus
            rows={[
              {
                label: "Adresse de messagerie",
                badge: <CheckBadge severity="error">Partagée</CheckBadge>,
              },
              provider,
            ]}
          />
          <p className={fr.cx("fr-text--md", "fr-mb-0")}>
            Le nom de domaine est conforme, mais cette adresse est partagée entre plusieurs
            personnes. Un compte ProConnect est individuel et requiert une adresse nominative. Créez
            votre adresse de messagerie avec votre nom de domaine (prenom.nom@nomdemairie.fr).
          </p>
          <CheckActions>
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
          </CheckActions>
        </>
      );
    case "generic":
      return (
        <>
          <CheckStatus
            rows={[
              {
                label: "Nom de domaine",
                badge: (
                  <CheckBadge severity="error">
                    {check.genericDomain ? "Générique" : "Non reconnu"}
                  </CheckBadge>
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
          <CheckActions>
            <Link href={DOMAINES_URL} className={fr.cx("fr-btn")}>
              Obtenir un nom de domaine
            </Link>
          </CheckActions>
        </>
      );
  }
}
