import CartographieConformite from "@/components/map/CartographieConformite";
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
      <div className="map-container">
        <CartographieConformite />
      </div>
    </>
  );
}
