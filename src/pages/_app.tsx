import "leaflet/dist/leaflet.css";
import "../styles/global.css";

import type { AppProps } from "next/app";
import { useEffect } from "react";

// import { SessionProvider } from "next-auth/react";
import Link from "next/link";

import { createNextDsfrIntegrationApi } from "@codegouvfr/react-dsfr/next-pagesdir";
import { createEmotionSsrAdvancedApproach } from "tss-react/next";

import { init } from "@socialgouv/matomo-next";
import { DefaultSeo } from "next-seo";

import { PageLayout } from "../layouts/page";

declare module "@codegouvfr/react-dsfr/next-pagesdir" {
  interface RegisterLink {
    Link: typeof Link;
  }
}

declare module "@codegouvfr/react-dsfr" {
  interface RegisterLink {
    Link: typeof Link;
  }
}

const { withDsfr, dsfrDocumentApi } = createNextDsfrIntegrationApi({
  defaultColorScheme: "light",
  Link,
  useLang: () => "fr",
  preloadFonts: ["Marianne-Regular", "Marianne-Medium", "Marianne-Bold"],
});

export { dsfrDocumentApi };

const { withAppEmotionCache, augmentDocumentWithEmotionCache } = createEmotionSsrAdvancedApproach({
  key: "css",
});

export { augmentDocumentWithEmotionCache };

function App({ Component, pageProps: { /*session,*/ ...pageProps } }: AppProps) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MATOMO_SITE_ID) return;
    init({
      url: process.env.NEXT_PUBLIC_MATOMO_URL ?? "",
      siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID ?? "",
    });
  }, []);

  // <SessionProvider session={session}>
  return (
    <>
      <DefaultSeo
        defaultTitle="La Suite territoriale"
        titleTemplate="%s - La Suite territoriale"
        description="Un socle commun d'outils numériques pour les collectivités"
        openGraph={{
          title: "La Suite territoriale",
          description: "Un socle commun d'outils numériques pour les collectivités",
          images: [
            {
              url: process.env.NEXT_PUBLIC_SITE_URL + "/images/suite-territoriale-hero.png",
              width: 1005,
              height: 368,
              alt: "La Suite territoriale",
            },
          ],
        }}
      />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <PageLayout>
          <Component {...pageProps} />
        </PageLayout>
      </div>
    </>
  );
}

// Apply both DSFR and emotion cache wrappers
export default withDsfr(withAppEmotionCache(App));
