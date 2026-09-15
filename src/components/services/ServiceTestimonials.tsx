import { type ServiceTestimonialsBlock } from "@/lib/services/types";
import styles from "@/styles/services.module.css";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "next/link";
import { useState } from "react";

// Air inside the coloured band, as in the mockup.
const SECTION_PADDING = 60;

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
    <section style={{ backgroundColor: "var(--background-alt-blue-france)" }}>
      <div
        className={fr.cx("fr-container")}
        style={{ paddingTop: SECTION_PADDING, paddingBottom: SECTION_PADDING }}
      >
        <h2 className={fr.cx("fr-sr-only")}>Ils utilisent le service</h2>

        {link && adoptionCount !== null && (
          <p className={fr.cx("fr-text--md", "fr-mb-2w")}>
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
                <p className={fr.cx("fr-h4", "fr-mb-0")}>{testimonial.quote}</p>
              </blockquote>
              <figcaption className={fr.cx("fr-text--sm", "fr-text--bold")}>
                {testimonial.author}
              </figcaption>

              {testimonial.link && (
                <p className={fr.cx("fr-text--sm", "fr-mt-1w", "fr-mb-0")}>
                  <Link
                    href={testimonial.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={fr.cx("fr-link", "fr-link--sm")}
                    // Hidden quotes keep their size but must stay out of the tab
                    // order, which `visibility: hidden` alone does not do here.
                    tabIndex={index === current ? undefined : -1}
                  >
                    {testimonial.link.text}
                  </Link>
                </p>
              )}
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
