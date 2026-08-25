import { type ServiceTestimonialsBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import { useState } from "react";

export default function ServiceTestimonials({
  block,
  adoptionCount,
}: {
  block: ServiceTestimonialsBlock;
  adoptionCount: number | null;
}) {
  const { testimonials, link } = block;
  const [current, setCurrent] = useState(0);

  const go = (step: number) =>
    setCurrent((i) => (i + step + testimonials.length) % testimonials.length);

  return (
    <section
      className={styles.section}
      style={{ backgroundColor: "var(--background-alt-blue-france)" }}
    >
      <div className={fr.cx("fr-container", "fr-py-6w")}>
        <h2 className={fr.cx("fr-sr-only")}>Ils utilisent le service</h2>

        {link && adoptionCount !== null && (
          <p className={fr.cx("fr-mb-2w")}>
            <Link href={link.href} className={fr.cx("fr-link")}>
              {link.text(adoptionCount)}
            </Link>
          </p>
        )}

        <div className={styles.testimonialStack} aria-live="polite">
          {testimonials.map((testimonial, index) => (
            <figure
              key={index}
              className={fr.cx("fr-m-0")}
              style={{ visibility: index === current ? "visible" : "hidden" }}
            >
              <blockquote className={fr.cx("fr-m-0", "fr-mb-1w")}>
                <p className={fr.cx("fr-text--lead", "fr-text--bold", "fr-mb-0")}>
                  {testimonial.quote}
                </p>
              </blockquote>
              <figcaption className={fr.cx("fr-text--sm", "fr-text--bold")}>
                {testimonial.author}
              </figcaption>
            </figure>
          ))}
        </div>

        {testimonials.length > 1 && (
          <div className={fr.cx("fr-mt-3w")} style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "flex",
                backgroundColor: "#fff",
                border: "1px solid var(--border-default-grey)",
                borderRadius: "4px",
              }}
            >
              <button
                type="button"
                onClick={() => go(-1)}
                title="Verbatim précédent"
                className={fr.cx(
                  "fr-btn",
                  "fr-btn--tertiary-no-outline",
                  "fr-icon-arrow-left-s-line",
                )}
              />
              <button
                type="button"
                onClick={() => go(1)}
                title="Verbatim suivant"
                className={fr.cx(
                  "fr-btn",
                  "fr-btn--tertiary-no-outline",
                  "fr-icon-arrow-right-s-line",
                )}
                style={{ borderLeft: "1px solid var(--border-default-grey)" }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
