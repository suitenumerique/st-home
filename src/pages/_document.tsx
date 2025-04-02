import { DocumentProps, Head, Html, Main, NextScript } from "next/document";
import { augmentDocumentWithEmotionCache, dsfrDocumentApi } from "./_app";

const { getColorSchemeHtmlAttributes, augmentDocumentForDsfr } = dsfrDocumentApi;

export default function Document(props: DocumentProps) {
  return (
    <Html {...getColorSchemeHtmlAttributes(props)} lang="fr">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
augmentDocumentForDsfr(Document);

augmentDocumentWithEmotionCache(Document);
