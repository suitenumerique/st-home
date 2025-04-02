import { fr } from "@codegouvfr/react-dsfr";
import React, { ReactNode } from "react";

interface StepProps {
  number: number;
  title: string;
  children: ReactNode;
  isLast?: boolean;
}

interface VerticalStepperProps {
  children: ReactNode;
}

export function Step({ number, title, children, isLast }: StepProps) {
  const SIZE = "2.5rem";

  return (
    <div className={fr.cx("fr-pb-2w")}>
      <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
        {/* Number circle column */}
        <div
          className={fr.cx("fr-col-12", "fr-col-md-1")}
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* Circle wrapper to handle the line */}
          <div style={{ position: "relative" }}>
            {/* The circle */}
            <div
              style={{
                width: SIZE,
                height: SIZE,
                borderRadius: "50%",
                backgroundColor: fr.colors.decisions.background.actionHigh.blueFrance.active,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                fontWeight: "bold",
                position: "relative",
                zIndex: 1,
              }}
            >
              {number}
            </div>
            {/* Vertical line - only show if not last element */}
            {!isLast && (
              <div
                style={{
                  position: "absolute",
                  top: SIZE,
                  height: "calc(100% + 1rem)",
                  width: "2px",
                  backgroundColor: fr.colors.decisions.background.actionHigh.blueFrance.active,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className={fr.cx("fr-col-12", "fr-col-md-11")}>
          <h2 className={fr.cx("fr-h4", "fr-mb-1w")}>{title}</h2>
          <div className={fr.cx("fr-text--md")}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export function VerticalStepper({ children }: VerticalStepperProps) {
  const childrenWithProps = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        isLast: index === React.Children.count(children) - 1,
      } as StepProps);
    }
    return child;
  });

  return <div className={fr.cx("fr-py-2w")}>{childrenWithProps}</div>;
}
