import { findOrganizationsWithStructures } from "@/lib/db";
import { determineOnboardingCase, type Commune, type OnboardingProps } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import Link from "next/link";

import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { FormEvent, useState, useEffect } from "react";

interface PageProps extends OnboardingProps {
  commune: Commune;
}

type Step = 1 | 2 | 3;

export default function Activation(props: PageProps) {
  const { commune } = props;

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    secret_code?: string;
    first_name?: string;
    last_name?: string;
    job_title?: string;
    email_prefix?: string;
    password?: string;
    confirm_password?: string;
  }>({});

  // Step 1 state
  const [secretCode, setSecretCode] = useState("");

  // Step 2 state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [emailPrefix, setEmailPrefix] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [prefixManuallyChanged, setPrefixManuallyChanged] = useState(false);
  const [prefixHasFocus, setPrefixHasFocus] = useState(false);

  const currentPageLabel = "Activation de votre compte";

  const stepTitles = [
    "Code de sécurité",
    "Création de votre compte",
    "Connexion ProConnect"
  ];

  const getCurrentStepTitle = () => stepTitles[currentStep - 1];
  const getNextStepTitle = () => currentStep < stepTitles.length ? stepTitles[currentStep] : null;

  // Slugify function to transform text into URL-friendly format
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
      .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Blacklisted prefixes for shared mailboxes
  const blacklistedPrefixes = [
    "contact", "mairie", "accueil", "secretariat", "info", "admin", "direction",
    "services", "technique", "urbanisme", "etat-civil", "comptabilite"
  ];

  const isBlacklistedPrefix = (prefix: string): boolean => {
    return blacklistedPrefixes.includes(prefix.toLowerCase());
  };

  const scrollToError = () => {
    const errorMessage = document.querySelector(".fr-alert--error .fr-alert__title")?.parentElement
      ?.parentElement;
    if (errorMessage) {
      errorMessage.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto-sync prefix based on name fields
  useEffect(() => {
    if (prefixManuallyChanged || prefixHasFocus) return;

    const firstNameTrimmed = firstName?.trim();
    const lastNameTrimmed = lastName?.trim();
    
    if (firstNameTrimmed || lastNameTrimmed) {
      let autoPrefix = '';
      if (firstNameTrimmed && lastNameTrimmed) {
        autoPrefix = `${slugify(firstNameTrimmed)}.${slugify(lastNameTrimmed)}`;
      } else if (firstNameTrimmed) {
        autoPrefix = slugify(firstNameTrimmed);
      } else if (lastNameTrimmed) {
        autoPrefix = slugify(lastNameTrimmed);
      }
      
      if (autoPrefix && autoPrefix !== emailPrefix) {
        setEmailPrefix(autoPrefix);
      }
    }
  }, [firstName, lastName, prefixManuallyChanged, prefixHasFocus, emailPrefix]);

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return minLength && hasUpper && hasLower && hasNumber;
  };

  const handleStep1Submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setFieldErrors({});

    // Client-side validation
    if (secretCode.length < 8) {
      setFieldErrors({ secret_code: "Le code doit contenir 8 caractères." });
      setIsSubmitting(false);
      return;
    }

    try {

      const response = await fetch("/api/communes/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: "validate_code",
          siret: commune.siret,
          secret_code: secretCode,
        }),
      });
      

      const result = await response.json();
      
      if (!response.ok) {
        if (result.message && result.message.includes("Code de sécurité invalide")) {
          setFieldErrors({ secret_code: result.message });
        } else {
          setSubmitStatus({ success: false, message: result.message || "Code invalide." });
          setTimeout(() => {
            scrollToError();
          }, 200);
        }
      } else {
        // Set user data from the returned data
        if (result.user?.first_name) {
          setFirstName(result.user.first_name);
        }
        if (result.user?.last_name) {
          setLastName(result.user.last_name);
        }
        if (result.user?.job_title) {
          setJobTitle(result.user.job_title);
        }
        // Set email domain from the returned data
        if (result.email_domain) {
          setEmailDomain(result.email_domain);
        }
        setFieldErrors({});
        setCurrentStep(2);
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

  const handleStep2Submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setFieldErrors({});

    // Client-side validation
    const errors: typeof fieldErrors = {};

    if (!firstName.trim()) {
      errors.first_name = "Le prénom est requis.";
    }

    if (!lastName.trim()) {
      errors.last_name = "Le nom est requis.";
    }

    if (!jobTitle.trim()) {
      errors.job_title = "La fonction est requise.";
    }

    if (!emailPrefix.trim()) {
      errors.email_prefix = "L'adresse email est requise.";
    } else if (!/^[a-z0-9.-]+$/.test(emailPrefix)) {
      errors.email_prefix = "L'adresse email doit contenir uniquement des lettres minuscules, chiffres, points et tirets.";
    } else if (isBlacklistedPrefix(emailPrefix)) {
      errors.email_prefix = "Cette adresse email correspond à une boîte partagée. Veuillez utiliser votre nom et prénom pour créer un compte personnel. Les boîtes partagées seront créées ultérieurement.";
    }

    if (!password) {
      errors.password = "Le mot de passe est requis.";
    } else if (!validatePassword(password)) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.";
    }

    if (!confirmPassword) {
      errors.confirm_password = "La confirmation du mot de passe est requise.";
    } else if (password !== confirmPassword) {
      errors.confirm_password = "Les mots de passe ne correspondent pas.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/communes/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: "create_account",
          siret: commune.siret,
          secret_code: secretCode,
          first_name: firstName,
          last_name: lastName,
          job_title: jobTitle,
          email_prefix: emailPrefix,
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Try to map server errors to specific fields
        if (result.message && result.message.includes("préfixe email")) {
          setFieldErrors({ email_prefix: result.message });
        } else if (result.message && result.message.includes("mot de passe")) {
          setFieldErrors({ password: result.message });
        } else if (result.message && result.message.includes("utilisateur avec cet email existe")) {
          setFieldErrors({ email_prefix: result.message });
        } else {
          setSubmitStatus({ success: false, message: result.message || "Erreur lors de la création du compte." });
          setTimeout(() => {
            scrollToError();
          }, 200);
        }
              } else {
          setFieldErrors({});
          setCurrentStep(3);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <p className={fr.cx("fr-text--md", "fr-mb-4w")}>
              
            </p>
            <form onSubmit={handleStep1Submit}>
              <div className={fr.cx("fr-mb-4w")}>
                <Input
                  label="Saisissez le code de sécurité à 8 caractères que vous avez reçu par courrier."
                  state={fieldErrors.secret_code ? "error" : "default"}
                  stateRelatedMessage={fieldErrors.secret_code}
                  nativeInputProps={{
                    type: "text",
                    name: "secret_code",
                    value: secretCode,
                    onChange: (e) => {
                      setSecretCode(e.target.value.toUpperCase());
                      if (fieldErrors.secret_code) {
                        setFieldErrors({ ...fieldErrors, secret_code: undefined });
                      }
                    },
                    required: true,
                    pattern: "[A-Z0-9]{8}",
                    maxLength: 8,
                    placeholder: "XXXXXXXX",
                    style: {
                      width: "200px",
                      fontFamily: "monospace",
                      fontSize: "1.2rem",
                      letterSpacing: "0.1rem",
                      textAlign: "center",
                    },
                  }}
                />
              </div>
              <div className={fr.cx("fr-btns-group", "fr-btns-group--inline-lg")}>
                <Button type="submit" disabled={isSubmitting || secretCode.length < 8}>
                  {isSubmitting ? "Vérification..." : "Vérifier le code"}
                </Button>
                <Button priority="secondary" linkProps={{ href: `/bienvenue/${commune.siret}` }}>
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        );

      case 2:
        return (
          <div>
            
            <p className={fr.cx("fr-text--md", "fr-mb-4w")}>
              Configurez votre compte personnel pour accéder à la Suite territoriale. En tant que premier inscrit, vous êtes administrateur et pourrez créer les comptes pour tous les membres de la collectivité. Vous pourrez désigner un autre administrateur si besoin.
            </p>

            <Alert
                severity="info"
                title=<>Nom de domaine de la collectivité</>
                description=<>
                Votre collectivité ne dispose pas d&rsquo;un nom de domaine <Link href="/conformite/referentiel" target="_blank">conforme</Link>.<br/><br/> La Suite territoriale vous met donc à disposition gracieusement <b>{emailDomain}</b>. 
                <br/><br/>Vous pourrez le modifier si vous obtenez ultérieurement un nouveau nom de domaine conforme.
                </>
                className={fr.cx("fr-mb-4w")}
                closable={false}
              />

            <form onSubmit={handleStep2Submit}>
              <div className={fr.cx("fr-mb-4w")}>
                <Input
                  label="Prénom"
                  state={fieldErrors.first_name ? "error" : "default"}
                  stateRelatedMessage={fieldErrors.first_name}
                  nativeInputProps={{
                    type: "text",
                    name: "first_name",
                    value: firstName,
                    onChange: (e) => {
                      setFirstName(e.target.value);
                      if (fieldErrors.first_name) {
                        setFieldErrors({ ...fieldErrors, first_name: undefined });
                      }
                    },
                    required: true,
                  }}
                  style={{
                    width: "400px",
                  }}
                />
              </div>
              <div className={fr.cx("fr-mb-4w")}>
                <Input
                  label="Nom"
                  state={fieldErrors.last_name ? "error" : "default"}
                  stateRelatedMessage={fieldErrors.last_name}
                  nativeInputProps={{
                    type: "text",
                    name: "last_name",
                    value: lastName,
                    onChange: (e) => {
                      setLastName(e.target.value);
                      if (fieldErrors.last_name) {
                        setFieldErrors({ ...fieldErrors, last_name: undefined });
                      }
                    },
                    required: true,
                  }}
                  style={{
                    width: "400px",
                  }}
                />
              </div>
              <div className={fr.cx("fr-mb-4w")}>
                <Input
                  label="Fonction"
                  state={fieldErrors.job_title ? "error" : "default"}
                  stateRelatedMessage={fieldErrors.job_title}
                  nativeInputProps={{
                    type: "text",
                    name: "job_title",
                    value: jobTitle,
                    onChange: (e) => {
                      setJobTitle(e.target.value);
                      if (fieldErrors.job_title) {
                        setFieldErrors({ ...fieldErrors, job_title: undefined });
                      }
                    },
                    required: true,
                  }}
                  style={{
                    width: "400px",
                  }}
                />
              </div>

              <div className={fr.cx("fr-mb-4w")}>
                <Input
                  label="Adresse email personnelle"
                  hintText="Elle se base sur votre prénom et nom."
                  state={fieldErrors.email_prefix ? "error" : "default"}
                  stateRelatedMessage={fieldErrors.email_prefix}
                  nativeInputProps={{
                    type: "text",
                    name: "email_prefix",
                    value: emailPrefix,
                    onChange: (e) => {
                      setEmailPrefix(e.target.value.toLowerCase());
                      setPrefixManuallyChanged(true);
                      if (fieldErrors.email_prefix) {
                        setFieldErrors({ ...fieldErrors, email_prefix: undefined });
                      }
                    },
                    onFocus: () => setPrefixHasFocus(true),
                    onBlur: () => setPrefixHasFocus(false),
                    required: true,
                    pattern: "[a-z0-9.-]+",
                    placeholder: "prenom.nom",
                  }}
                  addon={
                    <span style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      height: "100%",
                      padding: "0 8px",
                      lineHeight: "38px",
                    }}>
                      @{emailDomain}
                    </span>
                  }
                  style={{
                    width: "500px",
                  }}
                />
              </div>
              <div className={fr.cx("fr-mb-4w")}>
                <Input
                  label="Mot de passe"
                  hintText="Au moins 8 caractères, 1 majuscule, 1 minuscule et 1 chiffre"
                  state={fieldErrors.password ? "error" : "default"}
                  stateRelatedMessage={fieldErrors.password}
                  nativeInputProps={{
                    type: "password",
                    name: "password",
                    value: password,
                    onChange: (e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors({ ...fieldErrors, password: undefined });
                      }
                    },
                    required: true,
                    minLength: 8,
                  }}
                  style={{
                    width: "400px",
                  }}
                />
              </div>
              <div className={fr.cx("fr-mb-4w")}>
                <Input
                  label="Confirmation du mot de passe"
                  state={fieldErrors.confirm_password ? "error" : "default"}
                  stateRelatedMessage={fieldErrors.confirm_password}
                  nativeInputProps={{
                    type: "password",
                    name: "confirm_password",
                    value: confirmPassword,
                    onChange: (e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirm_password) {
                        setFieldErrors({ ...fieldErrors, confirm_password: undefined });
                      }
                    },
                    required: true,
                    minLength: 8,
                  }}
                  style={{
                    width: "400px",
                  }}
                />
              </div>
              <div className={fr.cx("fr-btns-group", "fr-btns-group--inline-lg")}>
                <Button type="submit" disabled={isSubmitting || !firstName || !lastName || !jobTitle || !password || !confirmPassword || !emailPrefix}>
                  {isSubmitting ? "Création du compte..." : "Créer le compte"}
                </Button>
                <Button priority="secondary" onClick={() => {
                  setCurrentStep(1);
                  setFieldErrors({});
                }}>
                  Retour
                </Button>
              </div>
            </form>
          </div>
        );

      case 3:
        const fullEmail = `${emailPrefix}@${emailDomain}`;
        return (
          <div>
            <Alert
              severity="success"
              title="Compte créé avec succès !"
              description={`Votre compte ${fullEmail} a été créé. Vous pouvez maintenant vous connecter avec ProConnect.`}
              className={fr.cx("fr-mb-4w")}
            />
            <p className={fr.cx("fr-text--md", "fr-mb-6w")}>
              ProConnect vous permet d&rsquo;accéder à la Suite territoriale mais aussi à d&rsquo;autres services numériques publics avec un seul compte.
            </p>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              gap: "1rem" 
            }}>
              <ProConnectButton 
                url="/api/auth/signin/proconnect"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={fr.cx("fr-container") + " st-bienvenue-page"}>
      <NextSeo title={currentPageLabel} noindex={true} />
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
            {
              label: `Inscription à la Suite territoriale`,
              linkProps: {
                href: `/bienvenue/${commune.siret}/inscription`,
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
            title="Erreur"
            description={submitStatus.message}
            closable
            onClose={() => setSubmitStatus(null)}
          />
        )}

        <p
          className={fr.cx("fr-text--sm", "fr-mb-1w")}
          style={{ color: "var(--text-title-blue-france)" }}
        >
          {commune.name} ({commune.type === "commune" ? commune.zipcode : "EPCI"})
        </p>

        <h1
          className={fr.cx("fr-h2", "fr-mb-4w")}
          style={{ color: "var(--text-title-blue-france)" }}
        >
          {currentPageLabel}
        </h1>

        {/* DSFR Stepper */}
        <div className={fr.cx("fr-mb-6w")}>
          <Stepper
            currentStep={currentStep}
            stepCount={3}
            title={getCurrentStepTitle()}
            nextTitle={getNextStepTitle()}
          />
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const { siret } = context.query;

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

  const onboardingResult = determineOnboardingCase(communeData, {});

  return {
    props: {
      commune: communeData,
      onboardingCase: onboardingResult.onboardingCase,
    },
  };
};
