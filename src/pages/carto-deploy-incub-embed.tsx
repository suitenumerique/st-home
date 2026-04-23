import CartographieDeploiement from "@/components/map/features/deploiement/CartographieDeploiement";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
import styles from "../styles/cartographie-deploiement.module.css";

export default function CartoDeployIncubEmbedPage() {
  useEffect(() => {
    const footer = document.querySelector<HTMLElement>(".fr-footer");
    const header = document.querySelector<HTMLElement>(".fr-header");
    if (footer) footer.style.display = "none";
    if (header) header.style.display = "none";
    document.body.style.overflow = "hidden";
  }, []);

  return (
    <>
      <NextSeo noindex={true} nofollow={true} />
      <div className={styles.mapContainerEmbed}>
        <CartographieDeploiement isLSTMode={false} />
      </div>
    </>
  );
}
