import CartographieDeploiement from "@/components/map/CartographieDeploiement";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
import styles from "../styles/cartographie-deploiement.module.css";

export default function CartographieDeploiementPage() {
  // Hide the footer & header and prevent body overflow on this page
  useEffect(() => {
    const footer = document.querySelector<HTMLElement>(".fr-footer");
    const header = document.querySelector<HTMLElement>(".fr-header");
    if (footer) {
      footer.style.display = "none";
    }
    if (header) {
      header.style.display = "none";
    }

    // Prevent body overflow
    document.body.style.overflow = "hidden";

    return () => {
      if (footer) {
        footer.style.display = "";
      }
      if (header) {
        header.style.display = "";
      }
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <NextSeo
        title="Cartographie de déploiement"
        description="Cartographie de déploiement"
      />
      <div className={styles.mapContainer}>
        <CartographieDeploiement />
      </div>
    </>
  );
}
