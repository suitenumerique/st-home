import { StatItem } from "@/types";
import { fr } from "@codegouvfr/react-dsfr";
import { useRef, useState } from "react";
import { useStyles } from "tss-react";

interface StatsSliderProps {
  stats: StatItem[];
}

export default function StatsSlider({ stats }: StatsSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === stats.length - 4;

  // TODO: is this overkill? Could be replaced by a few lines in global.css
  const { css } = useStyles();

  const nextSlide = () => {
    if (!isLastSlide) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (!isFirstSlide) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div
      className={css({
        position: "relative",
        padding: "0 50px",
        [fr.breakpoints.down("sm")]: {
          padding: "0 30px",
        },
      })}
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          ref={sliderRef}
          style={{
            display: "flex",
            transition: "transform 0.3s ease-in-out",
            //transform: `translateX(-${currentSlide * 11.2}%)`,
            //width: `${stats.length * 25}%`,
            transform: `translateX(-${currentSlide * 256}px)`,
            width: `${stats.length * 256}px`,
            gap: "30px",
          }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                flex: "1",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "var(--text-title-blue-france)",
                    marginBottom: "1rem",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "var(--text-title-blue-france)",
                  }}
                >
                  {stat.title}
                </div>
                <p className={fr.cx("fr-text--sm", "fr-my-2w")}>
                  {stat.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={prevSlide}
        disabled={isFirstSlide}
        className={css({
          position: "absolute",
          left: "0px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "30px",
          height: "30px",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isFirstSlide ? "#e3e3fd" : "#000091",
          border: "none",
          borderRadius: "4px",
          color: "white",
          cursor: isFirstSlide ? "not-allowed" : "pointer",
          [fr.breakpoints.down("sm")]: {
            width: "20px",
            height: "20px",
          },
          ["&:hover"]: {
            backgroundColor: isFirstSlide
              ? "#e3e3fd"
              : "var(--background-action-high-blue-france-hover) !important",
          },
        })}
        aria-label="Précédent"
      >
        <i className={fr.cx("fr-icon-arrow-left-s-line")} aria-hidden="true" />
      </button>
      <button
        onClick={nextSlide}
        disabled={isLastSlide}
        className={css({
          position: "absolute",
          right: "0px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "30px",
          height: "30px",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isLastSlide ? "#e3e3fd" : "#000091",
          border: "none",
          borderRadius: "4px",
          color: "white",
          cursor: isLastSlide ? "not-allowed" : "pointer",
          [fr.breakpoints.down("sm")]: {
            width: "20px",
            height: "20px",
          },
          ["&:hover"]: {
            backgroundColor: isLastSlide
              ? "#e3e3fd"
              : "var(--background-action-high-blue-france-hover) !important",
          },
        })}
        aria-label="Suivant"
      >
        <i className={fr.cx("fr-icon-arrow-right-s-line")} aria-hidden="true" />
      </button>
    </div>
  );
}
