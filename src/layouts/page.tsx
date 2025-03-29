import { ReactNode } from "react";

//import { signOut, useSession } from "next-auth/react";

import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const brandTop = (
  <>
    République
    <br />
    Française
  </>
);

const homeLinkPops = {
  href: "/",
  title: "La Suite territoriale - Accueil",
};

const bottomLinks = [
  {
    text: "Politique de confidentialité",
    linkProps: {
      href: "/politique-de-confidentialite",
    },
  },
  // {
  //   text: "Conditions générales d'utilisation",
  //   linkProps: {
  //     href: "/cgu",
  //   },
  // },
  // {
  //   text: "Statistiques",
  //   linkProps: {
  //     href: "/stats",
  //   },
  // },
  // {
  //   text: "Statuts des services",
  //   linkProps: {
  //     href: "https://status.suiteterritoriale.anct.gouv.fr/",
  //   },
  // },

  {
    text: "Contribuer sur GitHub",
    linkProps: {
      href: `${process.env.NEXT_PUBLIC_APP_REPOSITORY_URL}`,
    },
  },
];

type LayoutProps = {
  children: ReactNode;
};

export function PageLayout({ children }: LayoutProps) {
  const router = useRouter();
  // const { data: session } = useSession();
  const contentSecurityPolicy = process.env.CONTENT_SECURITY_POLICY;

  // const quickAccessItems = session && session.user
  //   ? [
  //       {
  //         iconId: "fr-icon-question-line" as const,
  //         linkProps: {
  //           href: "https://aide.suiteterritoriale.anct.gouv.fr/",
  //         },
  //         text: "Aide",
  //       },
  //       {
  //         buttonProps: {
  //           onClick: () => signOut({ callbackUrl: "/" }),
  //         },
  //         iconId: "fr-icon-logout-box-r-line" as const,
  //         text: `Déconnecter ${session.user.email}`,
  //       },
  //     ]
  //   : [
  //       {
  //         iconId: "fr-icon-question-line" as const,
  //         linkProps: {
  //           href: "https://aide.suiteterritoriale.anct.gouv.fr/",
  //         },
  //         text: "Aide",
  //       },
  //       {
  //         iconId: "fr-icon-account-line" as const,
  //         linkProps: {
  //           href: "/login",
  //         },
  //         text: "Se connecter",
  //       },
  //     ];

  return (
    <>
      <Head>
        {contentSecurityPolicy && (
          <meta
            httpEquiv="Content-Security-Policy"
            content={contentSecurityPolicy}
          />
        )}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SkipLinks
        links={[
          {
            anchor: "#content",
            label: "Contenu",
          },
          {
            anchor: "#fr-header",
            label: "Menu",
          },
          {
            anchor: "#fr-footer",
            label: "Pied de page",
          },
        ]}
      />
      <Header
        brandTop={brandTop}
        //serviceTitle="La Suite territoriale"
        //serviceTagline="Un socle commun d&rsquo;outils numériques pour les collectivités"
        homeLinkProps={homeLinkPops}
        // quickAccessItems={quickAccessItems}
        operatorLogo={{
          alt: "La Suite territoriale",
          imgUrl: "/images/logo-st.svg",
          orientation: "horizontal",
          linkProps: {
            href: "/",
            title: "La Suite territoriale",
          },
        }}
        navigation={[
          {
            text: "Présentation",
            linkProps: {
              href: "/",
            },
            isActive: router.asPath === "/",
          },
          {
            text: "Services numériques",
            linkProps: {
              href: "/services",
            },
            isActive: router.asPath.startsWith("/services"),
          },
          {
            text: "Conformité",
            isActive: router.asPath.startsWith("/conformite"),
            menuLinks: [
              {
                text: "Référentiel",
                linkProps: {
                  href: "/conformite/referentiel",
                },
              },
              {
                text: "Cartographie",
                linkProps: {
                  href: "/conformite/cartographie",
                },
              },
            ],
          },
          // {
          //   text: "Cartographie de conformité",
          //   linkProps: {
          //     href: "/cartographie",
          //   },
          //   isActive: router.asPath.startsWith("/cartographie"),
          // },
        ]}
      />
      <main role="main" id="content">
        {children}
      </main>
      <Footer
        brandTop={brandTop}
        accessibility="non compliant"
        contentDescription={
          <>
            La Suite territoriale est un service de{" "}
            <Link href="https://anct.gouv.fr/programmes-dispositifs/incubateur-des-territoires">
              l&rsquo;Incubateur des Territoires
            </Link>
            , une mission de{" "}
            <Link href="https://anct.gouv.fr/">
              l&rsquo;Agence Nationale de la Cohésion des Territoires
            </Link>
            .
            <br />
            Le{" "}
            <Link
              href={process.env.NEXT_PUBLIC_APP_REPOSITORY_URL || ""}
              target="_blank"
              rel="noopener noreferrer"
            >
              code source
            </Link>{" "}
            de ce site web est disponible en licence libre.
          </>
        }
        homeLinkProps={homeLinkPops}
        accessibilityLinkProps={{
          href: "/accessibilite",
        }}
        termsLinkProps={{
          href: "/mentions-legales",
        }}
        operatorLogo={{
          imgUrl: "/images/logo-incubateur.svg",
          alt: "Agence Nationale de la Cohésion des Territoires",
          orientation: "horizontal",
        }}
        bottomItems={[...bottomLinks]}
      />
    </>
  );
}
