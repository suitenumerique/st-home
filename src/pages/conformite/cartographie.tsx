import { NextSeo } from "next-seo";
import { useEffect } from "react";
export default function CartographiePage() {
  // Hide the footer on this page
  useEffect(() => {
    const footer = document.querySelector<HTMLElement>(".fr-footer");
    if (footer) {
      footer.style.display = "none";
    }
    return () => {
      if (footer) {
        footer.style.display = "";
      }
    };
  }, []);

  return (
    <>
      <NextSeo
        title="Cartographie de conformité"
        description="Cartographie de conformité des collectivités"
      />
      <div
        style={{
          position: "fixed",
          top: 120,
          left: 0,
          right: 0,
          bottom: 0,
          height: "100%",
        }}
      >
        <iframe
          src="https://grist.incubateur.anct.gouv.fr/o/anct/gVoLeTsdJL8q/Suite-territoriale-Deploiement?embed=true"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          title="Cartographie du déploiement"
          allow="fullscreen"
        />
      </div>
    </>
  );
}
