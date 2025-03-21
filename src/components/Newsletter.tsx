import { Follow } from "@codegouvfr/react-dsfr/Follow";

export default function Newsletter() {
  return (
    <Follow
      newsletter={{
        buttonProps: {
          linkProps: {
            href: "https://grist.incubateur.anct.gouv.fr/o/anct/forms/ozPm8fgpBDtf1qm37onLi5/338",
          },
        },

        desc: "Une infolettre mensuelle pour suivre les avancées de la Suite territoriale et les évolutions de ses produits.",
      }}
      social={{
        buttons: [
          {
            linkProps: {
              href: "https://www.linkedin.com/showcase/anct-incubateur-des-territoires/posts/?feedView=all",
            },
            type: "linkedin",
          },
          {
            linkProps: {
              href: "https://tube.numerique.gouv.fr/c/la_suite_territoriale/videos",
            },
            type: "youtube",
          },
        ],
      }}
    />
  );
}
