import CartographieDeploiement from "@/components/map/features/deploiement/CartographieDeploiement";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
import styles from "../styles/cartographie-deploiement.module.css";

export default function CartoDeployIncubEmbedPage() {
  useEffect(() => {
    const footer = document.querySelector<HTMLElement>(".fr-footer");
    if (footer) {
      footer.style.display = "none";
    }

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
      <NextSeo noindex={true} nofollow={true} />
      <div className={styles.mapContainer}>
        <CartographieDeploiement isLSTMode={false} />
      </div>
    </>
  );
}
