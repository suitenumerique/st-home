import CustomAlert from "@/components/CustomAlert";
import {
  findAllServices,
  findOperatorById,
  findOrganizationsWithOperators,
  findServicesByOperatorIds,
} from "@/lib/db";
import type { Commune, Service } from "@/lib/schema";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { FormEvent, useState } from "react";

interface PageProps {
  commune: Commune;
  opsnServices: Service[];
  anctServices: Service[];
  operatorName: string | null;
  operatorId: string | null;
  selectedServices: Service[];
}

export default function ContactForm(props: PageProps) {
  const { commune, opsnServices, anctServices, operatorName, operatorId, selectedServices } = props;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  let currentPageBreadcrumbs = [
    {
      label: "Présentation",
      linkProps: {
        href: "/",
      },
    },
    {
      label: "Présence numérique des collectivités",
      linkProps: {
        href: "/conformite/referentiel",
      },
    },
  ];

  if (commune?.type === "commune") {
    currentPageBreadcrumbs = [
      ...currentPageBreadcrumbs,
      ...[
        {
          label: `${commune.epci_name} · ${commune.insee_dep}`,
          linkProps: {
            href: `/bienvenue/${commune.epci_siret}`,
          },
        },
        {
          label: `${commune.name} · ${commune.zipcode}`,
          linkProps: {
            href: `/bienvenue/${commune.siret}`,
          },
        },
      ],
    ];
  }

  if (commune?.type === "epci") {
    currentPageBreadcrumbs = [
      ...currentPageBreadcrumbs,
      {
        label: `${commune.name} · ${commune.insee_dep}`,
        linkProps: {
          href: `/bienvenue/${commune.siret}`,
        },
      },
    ];
  }

  const currentPageLabel = "Formulaire de contact";

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

    data.structureNotSuitable = formData.get("structureNotSuitable") === "true" ? "true" : "false";
    data.siret = commune.siret;

    const selectedServiceIds = formData.getAll("services") as string[];
    data.services = selectedServiceIds.join(",");

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
        setUserEmail(data.email);
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
      <div
        style={{
          background: "linear-gradient(2deg, #EFEFFF 14.57%, #FCFCFF 83.36%)",
          backgroundRepeat: "no-repeat",
          paddingTop: "1px",
        }}
      >
        <section className={fr.cx("fr-container") + " st-contact-page"}>
          <NextSeo title="Inscription réussie" noindex={true} />
          <div>
            <Breadcrumb currentPageLabel={currentPageLabel} segments={currentPageBreadcrumbs} />
          </div>

          <div className="page-wrapper">
            <div className="confirmation-wrapper">
              <Button
                priority="tertiary no outline"
                iconPosition="right"
                iconId="fr-icon-close-line"
                linkProps={{ href: `/bienvenue/${commune.siret}` }}
                style={{ position: "absolute", top: "20px", right: "20px" }}
              >
                Fermer
              </Button>
              <div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img src="/images/plane.svg" alt="Inscription réussie" width={140} height={140} />
                </div>
                <h3
                  className={fr.cx("fr-h3", "fr-mb-2w")}
                  style={{ textAlign: "center", color: "var(--text-title-blue-france)" }}
                >
                  Demande confirmée
                </h3>
                <p className={fr.cx("fr-text--lg", "fr-mb-2w")} style={{ textAlign: "center" }}>
                  Vous serez recontacté dans les plus brefs délais à l’adresse {userEmail}
                </p>
                <p
                  className={fr.cx("fr-text--xs", "fr-mb-0")}
                  style={{ textAlign: "center", color: "var(--light-text-mention-grey)" }}
                >
                  En cas de problème ou de questions, merci de contacter
                  <br />
                  <Link href="mailto:contact@suite.anct.gouv.fr">contact@suite.anct.gouv.fr</Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(2deg, #EFEFFF 14.57%, #FCFCFF 83.36%)",
        backgroundRepeat: "no-repeat",
        paddingTop: "1px",
      }}
    >
      <section className={fr.cx("fr-container") + " st-contact-page"}>
        <NextSeo
          title={currentPageLabel}
          description="Test d'éligibilité à la Suite territoriale"
        />
        <div>
          <Breadcrumb currentPageLabel={currentPageLabel} segments={currentPageBreadcrumbs} />
        </div>

        <div className="page-wrapper">
          {submitStatus && !submitStatus.success && (
            <Alert
              className={fr.cx("fr-mb-4w")}
              severity="error"
              title="Erreur lors de l’envoi"
              description={submitStatus.message}
              closable
              onClose={() => setSubmitStatus(null)}
            />
          )}
          <CustomAlert
            className={fr.cx("fr-mb-5w")}
            severity="info"
            title="Le formulaire est réservé à la collectivité."
            description="Il permet d’informer les organisations de votre intérêt et à vous recontacter. Il n’y a aucun engagement de votre part."
          >
            <p
              className={fr.cx("fr-text--xs", "fr-mb-0", "fr-mt-1w")}
              style={{ color: "var(--text-default-grey)" }}
            >
              Les champs obligatoires sont marqués d’un astérisque *
            </p>
          </CustomAlert>

          <form className="form-wrapper" onSubmit={handleSubmit}>
            <div>
              <Button
                priority="tertiary no outline"
                iconPosition="left"
                iconId="fr-icon-arrow-left-line"
                linkProps={{ href: `/bienvenue/${commune.siret}` }}
                size="small"
                className="fr-mb-1w"
              >
                Retour
              </Button>
              <h3 className={fr.cx("fr-h3", "fr-mb-0")}>Formulaire de contact</h3>
            </div>

            <div className="form-section">
              <label className="form-section-title">
                <div>
                  <img src="/icons/cityhall.svg" alt="Collectivité" width={18} />
                </div>
                <h6 className={fr.cx("fr-mb-0")}>La collectivité</h6>
              </label>
              <div className="form-section-content">
                <div className={fr.cx("fr-mb-2w") + " id-card"}>
                  <p className={fr.cx("fr-mb-0", "fr-text--lg", "fr-text--bold")}>
                    {commune.name}
                    {commune.type === "commune" && commune.zipcode ? ` (${commune.zipcode})` : ""}
                  </p>
                  <div>
                    <i className={fr.cx("fr-icon-phone-line", "fr-icon--sm")} />
                    <p className={fr.cx("fr-text--sm", "fr-mb-0")}>{commune.phone || "Inconnu"}</p>
                  </div>
                  <div>
                    <i className={fr.cx("fr-icon-mail-line", "fr-icon--sm")} />
                    <p className={fr.cx("fr-text--sm", "fr-mb-0")}>
                      {commune.email_official || "Inconnu"}
                    </p>
                  </div>
                </div>
                <Link
                  href={commune.service_public_url || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={fr.cx("fr-link", "fr-text--xs", "fr-mb-0")}
                >
                  Une information est erronée ? Modifiez-la sur service-public.gouv.fr
                </Link>
              </div>
            </div>

            <div className="form-section">
              <label className="form-section-title">
                <div>
                  <img src="/icons/person.svg" alt="Vos coordonnées" width={13} />
                </div>
                <h6 className={fr.cx("fr-mb-0")}>Vos coordonnées</h6>
              </label>
              <div className="form-section-content">
                <div className={fr.cx("fr-mb-3w")}>
                  <Input
                    label="Nom *"
                    nativeInputProps={{
                      type: "text",
                      name: "name",
                      required: true,
                      autoComplete: "name",
                    }}
                  />
                </div>
                <div className={fr.cx("fr-mb-3w")}>
                  <Input
                    label="Prénom *"
                    nativeInputProps={{
                      type: "text",
                      name: "firstname",
                      required: true,
                      autoComplete: "firstname",
                    }}
                  />
                </div>
                <div className={fr.cx("fr-mb-3w")}>
                  <Input
                    label="Fonction dans votre collectivité *"
                    nativeInputProps={{
                      type: "text",
                      name: "role",
                      required: true,
                      autoComplete: "role",
                    }}
                  />
                </div>
                <div>
                  <Input
                    label="Email *"
                    nativeInputProps={{
                      type: "email",
                      name: "email",
                      required: true,
                      autoComplete: "email",
                    }}
                  />
                  <p
                    className={fr.cx("fr-mt-2w", "fr-text--xs", "fr-mb-0")}
                    style={{ color: "var(--text-default-info)" }}
                  >
                    <span
                      className={fr.cx("fr-icon-info-fill", "fr-icon--sm", "fr-mr-1w")}
                      aria-hidden="true"
                    ></span>
                    <span>
                      Si elle existe, veuillez utiliser une adresse nominative avec le nom de
                      domaine de votre collectivité (exemple : p.nom@commune.fr)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="form-section">
              <label className="form-section-title">
                <div>
                  <img src="/icons/services.svg" alt="Votre demande" width={13} />
                </div>
                <h6 className={fr.cx("fr-mb-0")}>Votre demande</h6>
              </label>
              <div className="form-section-content">
                {(commune.operators || []).filter((op) => op.isPerimetre).length > 0 && (
                  <div className={fr.cx("fr-mb-3w")}>
                    <p className={fr.cx("fr-text--lg", "fr-text--bold", "fr-mb-1w")}>
                      Structure de mutualisation
                    </p>
                    <p
                      className={fr.cx("fr-text--xs", "fr-mb-2w")}
                      style={{ color: "var(--light-text-mention-grey, #666)" }}
                    >
                      Si vous la sélectionnez, la structure vous contactera pour préciser les
                      modalités d'adhésion.
                    </p>
                    <Checkbox
                      small
                      options={(commune.operators || [])
                        .filter((op) => op.isPerimetre)
                        .map((op) => ({
                          label: (
                            <span>
                              Je souhaite que <strong>{op.name_with_article || op.name}</strong> me
                              recontacte.
                            </span>
                          ),
                          nativeInputProps: {
                            name: "operatorId",
                            value: op.id,
                            defaultChecked: op.id === operatorId,
                          },
                        }))}
                    />
                  </div>
                )}

                {selectedServices.length > 0 && (
                  <div className={fr.cx("fr-mb-3w")}>
                    <p className={fr.cx("fr-text--lg", "fr-text--bold", "fr-mb-1w")}>Services</p>
                    <Checkbox
                      small
                      options={selectedServices.map((s) => ({
                        label: s.name,
                        hintText: s.description || "",
                        nativeInputProps: {
                          name: "services",
                          value: String(s.id),
                          defaultChecked: true,
                        },
                      }))}
                    />
                  </div>
                )}

                <div>
                  <p className={fr.cx("fr-mb-2w", "fr-text--lg", "fr-text--bold")}>Précisions</p>
                  <p
                    className={fr.cx("fr-text--xs", "fr-mb-1w")}
                    style={{ color: "var(--light-text-mention-grey, #666)" }}
                  >
                    Vous pouvez par exemple préciser les services qui vous intéressent ainsi que vos
                    préférences (moyens et horaires) pour la prise de contact.
                  </p>
                  <Input
                    label=""
                    textArea
                    nativeTextAreaProps={{
                      name: "precisions",
                      required: false,
                      style: {
                        minHeight: "96px",
                        minWidth: "100%",
                        maxWidth: "100%",
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
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
            </div>

            <div>
              <Button
                type="submit"
                priority="primary"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Continuer"}
              </Button>
              <Button
                priority="tertiary no outline"
                linkProps={{ href: `/bienvenue/${commune.siret}` }}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  textDecoration: "underline",
                }}
              >
                Revenir plus tard
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { siret } = context.query;

  if (!siret || typeof siret !== "string") {
    return {
      redirect: {
        destination: `/bienvenue/${siret}`,
        permanent: false,
      },
    };
  }

  const commune = await findOrganizationsWithOperators(siret);

  if (!commune) {
    return {
      redirect: {
        destination: `/bienvenue/${siret}`,
        permanent: false,
      },
    };
  }

  const allServices = await findAllServices();

  // Resolve operator from query param
  const operatorIdParam =
    typeof context.query.operator === "string" ? context.query.operator : null;
  let operatorName: string | null = null;
  if (operatorIdParam) {
    const operator = await findOperatorById(operatorIdParam);
    if (operator) {
      operatorName = operator.name_with_article || operator.name;
    }
  }

  // Resolve selected services from query param (comma-separated IDs)
  const servicesParam = typeof context.query.services === "string" ? context.query.services : "";
  const serviceIds = new Set(
    servicesParam
      .split(",")
      .map(Number)
      .filter((id) => !isNaN(id) && id > 0),
  );
  const selectedServices = allServices.filter((s) => serviceIds.has(s.id));

  // Compute OPSN services from perimetre operators
  const perimetreOperators = (commune.operators || []).filter((op) => op.isPerimetre);
  const perimetreOperatorIds = perimetreOperators.map((op) => op.id);
  const operatorServicesResult = await findServicesByOperatorIds(perimetreOperatorIds);
  const opsnServiceIds = new Set(operatorServicesResult.map((r) => r.service.id));

  const opsnServices = allServices.filter((s) => opsnServiceIds.has(s.id));
  const anctServices = allServices.filter((s) => !opsnServiceIds.has(s.id));

  const communeData: Commune = JSON.parse(JSON.stringify(commune));

  return {
    props: {
      commune: communeData,
      opsnServices: JSON.parse(JSON.stringify(opsnServices)),
      anctServices: JSON.parse(JSON.stringify(anctServices)),
      operatorId: operatorIdParam,
      operatorName,
      selectedServices: JSON.parse(JSON.stringify(selectedServices)),
    },
  };
};
