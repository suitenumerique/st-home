import { findOrganizationsWithStructures } from "@/lib/db";
import { determineOnboardingCase, type Commune, type OnboardingProps } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";

interface PageProps extends OnboardingProps {
  commune: Commune;
  structureId: string | null;
  structureName: string | null;
  structureShortname: string | null;
}

export default function InscriptionGroupePilote(props: PageProps) {
  const { commune, structureName, structureShortname, structureId } = props;

  const [zipCode, setZipCode] = useState("");
  const zipCodeInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const displayStructureName = structureShortname || structureName;

  const currentPageLabel = `Inscription au groupe pilote`;

  const scrollToError = () => {
    const errorMessage = document.querySelector(".fr-alert--error .fr-alert__title")?.parentElement
      ?.parentElement;
    if (errorMessage) {
      errorMessage.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData(event.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value as string;
    });

    data.siret = commune.siret;
    if (structureId) {
      data.structureId = structureId;
    }

    try {
      const response = await fetch("/api/communes/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitStatus({ success: false, message: result.message || "Une erreur est survenue." });
        setTimeout(() => {
          scrollToError();
        }, 200);
      } else {
        setSubmitStatus({ success: true, message: result.message || "Inscription réussie !" });
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setSubmitStatus({ success: false, message: "Impossible de contacter le serveur." });
      setTimeout(() => {
        scrollToError();
      }, 200);
    }

    setIsSubmitting(false);
  };

  if (showSuccess) {
    return (
      <div className={fr.cx("fr-container") + " st-bienvenue-page"}>
        <NextSeo title="Inscription réussie" noindex={true} />
        <div className={fr.cx("fr-card--shadow", "fr-p-4w", "fr-mb-4w")}>
          <Alert
            severity="success"
            title="Inscription réussie !"
            description="Votre demande d'inscription au groupe pilote a bien été enregistrée. Nous vous recontacterons prochainement."
          />
          <div className={fr.cx("fr-mt-4w")}>
            <Button priority="primary" linkProps={{ href: `/bienvenue/${commune.siret}` }}>
              Retour à la page d&rsquo;éligibilité
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={fr.cx("fr-container") + " st-bienvenue-page"}>
      <NextSeo
        title={currentPageLabel}
        description="Inscription de {commune.name} au groupe pilote - {displayStructureName}"
      />
      <div>
        <Breadcrumb
          currentPageLabel={currentPageLabel}
          segments={[
            {
              label: "Présentation",
              linkProps: {
                href: "/",
              },
            },
            {
              label: `Éligibilité de ${commune.name} (${commune.type === "commune" ? commune.zipcode : "EPCI"})`,
              linkProps: {
                href: `/bienvenue/${commune.siret}`,
              },
            },
          ]}
        />
      </div>
      <div className={fr.cx("fr-card--shadow", "fr-p-4w", "fr-mb-4w")}>
        {submitStatus && !submitStatus.success && (
          <Alert
            className={fr.cx("fr-mb-4w")}
            severity="error"
            title="Erreur lors de l'inscription"
            description={submitStatus.message}
            closable
            onClose={() => setSubmitStatus(null)}
          />
        )}

        {!submitStatus && (
          <Alert
            className={fr.cx("fr-mb-4w")}
            severity="warning"
            title="Formulaire réservé à la collectivité."
            description={`Seule la collectivité concernée peut envoyer une demande. ${structureId ? `Celle-ci sera adressée à la structure de mutualisation.` : ""}`}
            closable={false}
          />
        )}

        <p
          className={fr.cx("fr-text--sm", "fr-mb-1w")}
          style={{ color: "var(--text-title-blue-france)" }}
        >
          {commune.name} ({commune.type === "commune" ? commune.zipcode : "EPCI"})
        </p>

        <h1
          className={fr.cx("fr-h2", "fr-mb-2w")}
          style={{ color: "var(--text-title-blue-france)" }}
        >
          Inscription au Groupe pilote {displayStructureName && ` - ${displayStructureName}`}
        </h1>

        {structureId ? (
          <p className={fr.cx("fr-text--lg", "fr-mb-5w")}>
            Vous êtes intéressé par les services de la Suite territoriale et vous souhaitez être
            accompagné par cette structure de mutualisation, merci de remplir ce formulaire pour
            rester informé et tester nos services.
          </p>
        ) : (
          <p className={fr.cx("fr-text--lg", "fr-mb-5w")}>
            Vous êtes intéressé par les services de la Suite territoriale, merci de remplir ce
            formulaire pour rester informé et tester nos services.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <h2 className={fr.cx("fr-h4", "fr-mb-4w")}>Vos coordonnées</h2>

          <div className={fr.cx("fr-mb-3w")}>
            <Input
              label="Votre nom et prénom"
              nativeInputProps={{
                type: "text",
                name: "name",
                required: true,

                autoComplete: "name",
              }}
              style={{
                width: "500px",
              }}
            />
          </div>
          <div className={fr.cx("fr-mb-3w")}>
            <Input
              label="Votre fonction dans la collectivité"
              nativeInputProps={{
                type: "text",
                name: "role",
                required: true,
                autoComplete: "organization-title",
              }}
              style={{
                width: "500px",
              }}
            />
          </div>
          <div className={fr.cx("fr-mb-3w")}>
            <Input
              label="Nom de la collectivité"
              nativeInputProps={{
                type: "text",
                name: "collectivite_name",
                required: true,
                defaultValue: commune.name,
                readOnly: true,
                autoComplete: "organization",
              }}
              style={{
                width: "500px",
              }}
            />
          </div>
          <div className={fr.cx("fr-mb-3w")}>
            <Input
              label="Email"
              nativeInputProps={{
                type: "email",
                name: "email",
                required: true,
                autoComplete: "email",
                defaultValue: commune.email_official || "",
              }}
              style={{
                width: "500px",
              }}
            />
          </div>

          <div className={fr.cx("fr-mb-6w")}>
            <Input
              label="Numéro de téléphone"
              nativeInputProps={{
                type: "tel",
                name: "phone",
                required: true,
                autoComplete: "tel",
                defaultValue: commune.phone || "",
              }}
              style={{
                width: "500px",
              }}
            />
          </div>

          <h2 className={fr.cx("fr-h4", "fr-mb-4w")}>Votre demande</h2>

          {structureId && (
            <RadioButtons
              legend="Êtes-vous déjà adhérent à cette structure de mutualisation ?"
              name="is_adherent"
              options={[
                {
                  label: "Oui",
                  nativeInputProps: {
                    value: "yes",
                    required: true,
                  },
                },
                {
                  label: "Non",
                  nativeInputProps: {
                    value: "no",
                    required: true,
                  },
                },
                {
                  label: "Je ne sais pas",
                  nativeInputProps: {
                    value: "unknown",
                    required: true,
                  },
                },
              ]}
            />
          )}

          <div className={fr.cx("fr-mt-6w", "fr-mb-4w")}>
            <Input
              label="Précisions (optionnel)"
              hintText="200 caractères maximum"
              textArea
              nativeTextAreaProps={{
                name: "precisions",
                maxLength: 200,
                rows: 4,
              }}
            />
            <p
              className={fr.cx("fr-mt-2w", "fr-text--sm")}
              style={{ color: "var(--text-default-info)" }}
            >
              <span
                className={fr.cx("fr-icon-info-fill", "fr-icon--sm", "fr-mr-1w")}
                aria-hidden="true"
              ></span>
              <span>
                N&rsquo;hésitez pas à préciser vos préférences (moyens et horaires) pour la prise de
                contact.
              </span>
            </p>
          </div>

          <h2 className={fr.cx("fr-h4", "fr-mb-4w")}>Code de sécurité</h2>

          <div className={fr.cx("fr-mb-6w")}>
            <Input
              label={
                commune.type === "commune"
                  ? "Renseignez le code postal de la collectivité"
                  : "Renseignez le département de l'EPCI"
              }
              hintText="Uniquement composé de chiffres"
              nativeInputProps={{
                ref: zipCodeInputRef,
                type: "text",
                name: "postal_code",
                required: true,
                pattern: commune.type === "commune" ? "[0-9]{5}" : "[0-9ABMD]{2,3}",
                maxLength: commune.type === "commune" ? 5 : 3,
                inputMode: "numeric",
                autoComplete: "postal-code",
                value: zipCode,
                size: 20,
                style: {
                  width: "auto !important",
                },
                onChange: (e) => setZipCode(e.target.value),
              }}
              style={{
                width: "500px",
              }}
            />
          </div>

          <h2 className={fr.cx("fr-h4", "fr-mb-4w")}>Politique de confidentialité</h2>

          <Checkbox
            className={fr.cx("fr-mb-2w")}
            options={[
              {
                label: (
                  <span>
                    J&rsquo;accepte la{" "}
                    <Link
                      href="/politique-de-confidentialite"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      politique de confidentialité des données
                    </Link>
                  </span>
                ),
                nativeInputProps: {
                  name: "cgu_accepted",
                  value: "yes",
                  required: true,
                },
              },
            ]}
            state="default"
          />

          <div
            className={fr.cx("fr-btns-group", "fr-btns-group--inline-lg", "fr-btns-group--left")}
          >
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours..." : "Valider l'inscription"}
            </Button>
            <Button priority="secondary" linkProps={{ href: `/bienvenue/${commune.siret}` }}>
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const { siret, structureId, isExistingMember } = context.query;

  if (!siret || typeof siret !== "string") {
    return { notFound: true };
  }

  const commune = await findOrganizationsWithStructures(siret);

  if (!commune) {
    return {
      redirect: {
        destination: `/bienvenue/${siret}`,
        permanent: false,
      },
    };
  }

  const communeData: Commune = JSON.parse(JSON.stringify(commune));

  let structureName: string | null = null;
  let structureShortname: string | null = null;
  const structureIdString = typeof structureId === "string" ? structureId : undefined;
  if (structureIdString && communeData.structures) {
    const foundStructure = communeData.structures.find((s) => s.id === structureIdString);
    if (foundStructure) {
      structureName = foundStructure.name;
      structureShortname = foundStructure.shortname;
    } else {
      console.warn(`Structure with ID ${structureIdString} not found for SIRET ${siret}`);
    }
  }

  const onboardingResult = determineOnboardingCase(communeData, {
    structureId: structureIdString,
    isExistingMember: isExistingMember === "true",
  });

  return {
    props: {
      commune: communeData,
      structureId: structureIdString || null,
      structureName: structureName || null,
      structureShortname: structureShortname,
      onboardingCase: onboardingResult.onboardingCase,
    },
  };
};
