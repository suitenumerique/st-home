import CartographieDeploiementBis from "@/components/map/deploiement/CartographieDeploiementBis";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
import styles from "../styles/cartographie-deploiement.module.css";

export default function CartographieDeploiementBisPage() {
  // Hide the footer & header and prevent body overflow on this page
  useEffect(() => {
    const footer = document.querySelector<HTMLElement>(".fr-footer");
    if (footer) {
      footer.style.display = "none";
    }

    // Prevent body overflow
    document.body.style.overflow = "hidden";

    return () => {
      if (footer) {
        footer.style.display = "";
      }
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <NextSeo
        title="Cartographie de déploiement - Toutes les communes"
        description="Cartographie de déploiement - Toutes les communes"
      />
      <div className={styles.mapContainer}>
        <CartographieDeploiementBis />
      </div>
    </>
  );
}
