import CustomAlert from "@/components/CustomAlert";
import {
  findAllServices,
  findOrganizationBySiren,
  findOrganizationsWithStructures,
} from "@/lib/db";
import type { Commune, Service } from "@/lib/onboarding";
import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { FormEvent, useState } from "react";

interface PageProps {
  commune: Commune & { epci_siret?: string };
  allServices: Service[];
}

export default function ContactForm(props: PageProps) {
  const { commune, allServices } = props;

  console.log(commune);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const opsnServices = ["Messages", "Fichiers", "Rendez-vous", "Projets"].map((name) =>
    allServices.find((s) => s.name === name),
  );
  const anctServices = allServices.filter((s) => !opsnServices.find((os) => os?.id === s.id));

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

    data.hasNominalEmail = formData.get("hasNominalEmail") === "true" ? "true" : "false";
    data.structureNotSuitable = formData.get("structureNotSuitable") === "true" ? "true" : "false";

    data.siret = commune.siret;

    const selectedServiceIds = formData.getAll("services") as string[];

    data.services = selectedServiceIds.join(",");

    console.log(data);

    try {
      //   const response = await fetch("/api/communes/signup", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(data),
      //   });

      //   const result = await response.json();

      //   if (!response.ok) {
      //     setSubmitStatus({ success: false, message: result.message || "Une erreur est survenue." });
      //     setTimeout(() => {
      //       scrollToError();
      //     }, 200);
      //   } else {
      //     setSubmitStatus({ success: true, message: result.message || "Inscription réussie !" });
      setShowSuccess(true);
      setUserEmail(data.email);
      // }
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
                  Selon le service choisi, la structure de mutualisation vous contactera dans les
                  plus brefs à l’adresse {userEmail}
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
              <div className="form-section">
                <label className="form-section-title">
                  <div>
                    <i className={fr.cx("fr-icon-arrow-right-line")} />
                  </div>
                  <h6 className={fr.cx("fr-mb-0")}>La structure de mutualisation</h6>
                </label>
                <div className="form-section-content">
                  <div className="id-card">
                    <p className={fr.cx("fr-mb-0", "fr-text--lg", "fr-text--bold")}>Demaclic</p>
                    <div>
                      <i className={fr.cx("fr-icon-phone-line", "fr-icon--sm")} />
                      <p className={fr.cx("fr-text--sm", "fr-mb-0")}>09 99 00 12 20</p>
                    </div>
                    <div>
                      <i className={fr.cx("fr-icon-mail-line", "fr-icon--sm")} />
                      <p className={fr.cx("fr-text--sm", "fr-mb-0")}>contact@demaclic.fr</p>
                    </div>
                    <div>
                      <i className={fr.cx("fr-icon-government-line", "fr-icon--sm")} />
                      <p className={fr.cx("fr-text--sm", "fr-mb-0")}>Syndicat mixte</p>
                    </div>
                  </div>
                </div>
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
          <Button
            priority="tertiary no outline"
            iconPosition="left"
            iconId="fr-icon-arrow-left-line"
            linkProps={{ href: `/bienvenue/${commune.epci_siret}` }}
            className="fr-mb-4w"
          >
            Retour
          </Button>
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
              <p className={fr.cx("fr-text--sm", "fr-mb-0")}>
                {commune.name} {commune.type === "commune" ? commune.zipcode : commune.insee_dep}
              </p>
              <h3 className={fr.cx("fr-h3", "fr-mb-0")}>Formulaire de contact</h3>
            </div>

            <div className="form-section">
              <label className="form-section-title">
                <div>
                  <i className={fr.cx("fr-icon-arrow-right-line")} />
                </div>
                <h6 className={fr.cx("fr-mb-0")}>La collectivité</h6>
              </label>
              <div className="form-section-content">
                <div className={fr.cx("fr-mb-2w") + " id-card"}>
                  <p className={fr.cx("fr-mb-0", "fr-text--lg", "fr-text--bold")}>{commune.name}</p>
                  <div>
                    <i className={fr.cx("fr-icon-phone-line", "fr-icon--sm")} />
                    <p className={fr.cx("fr-text--sm", "fr-mb-0")}>{commune.phone}</p>
                  </div>
                  <div>
                    <i className={fr.cx("fr-icon-mail-line", "fr-icon--sm")} />
                    <p className={fr.cx("fr-text--sm", "fr-mb-0")}>{commune.email_official}</p>
                  </div>
                  <p
                    className={fr.cx("fr-text--sm", "fr-mb-0")}
                    style={{ color: "var(--light-text-mention-grey, #666)" }}
                  >
                    <span style={{ fontWeight: "500" }}>SIRET</span> : {commune.siret}
                  </p>
                </div>
                <Link href="" className={fr.cx("fr-link", "fr-text--xs", "fr-mb-0")}>
                  Une information est erronée ? Modifiez-la sur service-public.gouv.fr
                </Link>
              </div>
            </div>

            <div className="form-section">
              <label className="form-section-title">
                <div>
                  <i className={fr.cx("fr-icon-arrow-right-line")} />
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
                <div className={fr.cx("fr-mb-3w")}>
                  <Input
                    label="Numéro de téléphone"
                    hintText="Optionnel"
                    nativeInputProps={{
                      type: "text",
                      name: "phone",
                      required: true,
                      autoComplete: "phone",
                      style: {
                        maxWidth: "240px",
                      },
                    }}
                  />
                </div>
                <div className={fr.cx("fr-mb-3w")}>
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
                    className={fr.cx("fr-mt-2w", "fr-text--xs")}
                    style={{ color: "var(--text-default-info)" }}
                  >
                    <span
                      className={fr.cx("fr-icon-info-fill", "fr-icon--sm", "fr-mr-1w")}
                      aria-hidden="true"
                    ></span>
                    <span>
                      Une adresse nominative avec le nom de domaine de la collectivité sera requise
                      pour l’identification ProConnect, exemple : prenom.nom@nomdecommune.fr.
                    </span>
                  </p>
                  <Checkbox
                    small
                    options={[
                      {
                        label: "Je n’ai pas d’adresse professionnelle nominative. ",
                        nativeInputProps: {
                          name: "hasNominalEmail",
                          value: "true",
                        },
                      },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="separator" />

            <div className="form-section">
              <label className="form-section-title">
                <div>
                  <i className={fr.cx("fr-icon-arrow-right-line")} />
                </div>
                <h6 className={fr.cx("fr-mb-0")}>Les services</h6>
              </label>
              <div className="form-section-content" style={{ paddingBottom: "1rem" }}>
                {commune?.structures && commune.structures.length > 1 && (
                  <Button
                    priority="secondary"
                    className={fr.cx("fr-mb-2w")}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      boxShadow: "inset 0 0 0 1px var(--light-border-default-grey, #DDD)",
                    }}
                    iconId="fr-icon-check-line"
                    iconPosition="left"
                    type="button"
                    onClick={() => {
                      const checkboxes =
                        document.querySelectorAll<HTMLInputElement>('input[name="services"]');
                      checkboxes.forEach((checkbox) => {
                        checkbox.checked = true;
                      });
                    }}
                  >
                    Tout sélectionner
                  </Button>
                )}
                {(commune?.structures || []).map((structure) => (
                  <div key={structure.id} className={fr.cx("fr-mb-4w")}>
                    <p className={fr.cx("fr-text--lg", "fr-text--bold", "fr-mb-1w")}>
                      {structure.shortname || structure.name}
                    </p>
                    <p className={fr.cx("fr-text--xs")}>
                      La structure vous contactera pour préciser les modalités d’adhésion selon
                      votre sélection. N’hésitez pas à parcourir leur offre de service.
                    </p>
                    <div className={fr.cx("fr-mb-4w")}>
                      {/* { commune?.structures && commune.structures.length > 1 ? (
                        <div>coucou</div>
                      ) : ( */}
                      <Checkbox
                        small
                        options={[
                          ...opsnServices.map((service) => ({
                            label: service?.name || "",
                            hintText: "Description du service ...",
                            nativeInputProps: {
                              name: "services",
                              value: service?.id || "",
                            },
                          })),
                        ]}
                      />
                      {/* )} */}
                    </div>
                  </div>
                ))}
                <div className={fr.cx("fr-mb-4w")}>
                  <Checkbox
                    small
                    options={[
                      {
                        label:
                          "Je suis intéressé par l’un de ces services,  mais la structure proposée ne me convient pas.",
                        nativeInputProps: {
                          name: "structureNotSuitable",
                          value: "true",
                        },
                      },
                    ]}
                  />
                </div>
                <div>
                  <p className={fr.cx("fr-text--lg", "fr-text--bold", "fr-mb-1w")}>ANCT</p>
                  <p className={fr.cx("fr-text--xs")}>
                    Ces services sont mis à votre disposition gracieusement. Précisez vos
                    préférences pour recevoir une documentation personnalisée.
                  </p>
                  <div>
                    <Checkbox
                      small
                      options={[
                        ...anctServices.map((service) => ({
                          label: service?.name || "",
                          hintText: "Description du service ...",
                          nativeInputProps: {
                            name: "services",
                            value: service?.id || "",
                          },
                        })),
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <label className="form-section-title">
                <div>
                  <i className={fr.cx("fr-icon-arrow-right-line")} />
                </div>
                <h6 className={fr.cx("fr-mb-0")}>La structure de mutualisation</h6>
              </label>
              <div className="form-section-content">
                <div className="id-card">
                  <p className={fr.cx("fr-mb-0", "fr-text--lg", "fr-text--bold")}>Demaclic</p>
                  <div>
                    <i className={fr.cx("fr-icon-phone-line", "fr-icon--sm")} />
                    <p className={fr.cx("fr-text--sm", "fr-mb-0")}>09 99 00 12 20</p>
                  </div>
                  <div>
                    <i className={fr.cx("fr-icon-mail-line", "fr-icon--sm")} />
                    <p className={fr.cx("fr-text--sm", "fr-mb-0")}>contact@demaclic.fr</p>
                  </div>
                  <div>
                    <i className={fr.cx("fr-icon-government-line", "fr-icon--sm")} />
                    <p className={fr.cx("fr-text--sm", "fr-mb-0")}>Syndicat mixte</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className={fr.cx("fr-mb-2w", "fr-text--lg", "fr-text--bold")}>Précisions</p>
              <p
                className={fr.cx("fr-text--xs", "fr-mb-1w")}
                style={{ color: "var(--light-text-mention-grey, #666)" }}
              >
                Vous pouvez par exemple préciser vos préférences (moyens et horaires) pour la prise
                de contact.
              </p>
              <Input
                label=""
                textArea
                nativeTextAreaProps={{
                  name: "precisions",
                  required: false,
                  style: {
                    minHeight: "72px",
                    minWidth: "100%",
                    maxWidth: "100%",
                  },
                }}
              />
            </div>

            <div className="separator" />

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

  const commune = (await findOrganizationsWithStructures(siret)) as Commune & {
    epci_siret?: string;
  };
  if (commune?.type === "commune" && commune?.epci_siren) {
    const epci = await findOrganizationBySiren(commune?.epci_siren);
    commune.epci_siret = epci?.siret;
  }

  if (!commune) {
    return {
      redirect: {
        destination: `/bienvenue/${siret}`,
        permanent: false,
      },
    };
  }

  // Convert the Drizzle result to the Commune type
  const communeData: Commune = JSON.parse(JSON.stringify(commune));

  const allServices = await findAllServices();

  // Determine the onboarding case with options
  return {
    props: {
      commune: communeData,
      allServices,
    },
  };
};
