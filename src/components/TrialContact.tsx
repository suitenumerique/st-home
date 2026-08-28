import { Button } from "@codegouvfr/react-dsfr/Button";

// Default wording of the heading. Narrow no-break spaces before "?" and "!",
// as French typography wants and as the artwork had.
const DEFAULT_HEADING = { lead: "Intéressé\u202f?", action: "Testez\u202f!" };

// The two marks that framed the vectorised artwork, kept as they were: the
// teal one at the top left of the wording, the yellow one at its bottom right.
const MARKS = {
  start: {
    viewBox: "0 10 40 40",
    color: "#018F83",
    d: "M23.8051 28.2606C21.1068 28.8515 19.0084 30.9739 18.4481 33.6787L16.2012 44.5252C15.6242 47.3106 13.1706 49.3081 10.326 49.3081L4 49.3081C1.73461 49.3081 -0.0786818 47.4286 0.00257528 45.1646L0.53673 30.2823C0.53673 20.9316 8.6141 11.3987 17.6791 10.7944L35.4732 10.0042C37.7497 9.90313 39.6506 11.7215 39.6506 14.0003L39.6506 19.9623C39.6506 22.7815 37.688 25.2204 34.9342 25.8235L23.8051 28.2606Z",
  },
  end: {
    viewBox: "540 80 40 40",
    color: "#FBC63A",
    d: "M556.195 100.739C558.893 100.148 560.992 98.0261 561.552 95.3213L563.799 84.4748C564.376 81.6894 566.829 79.6919 569.674 79.6919L576 79.6919C578.265 79.6919 580.079 81.5714 579.997 83.8354L579.463 98.7177C579.463 108.068 571.386 117.601 562.321 118.206L544.527 118.996C542.25 119.097 540.349 117.278 540.349 115L540.349 109.038C540.349 106.219 542.312 103.78 545.066 103.177L556.195 100.739Z",
  },
};

function Mark({ mark, className }: { mark: (typeof MARKS)["start"]; className: string }) {
  return (
    <svg
      className={className}
      viewBox={mark.viewBox}
      fill={mark.color}
      aria-hidden="true"
      focusable="false"
    >
      <path d={mark.d} />
    </svg>
  );
}

export default function TrialContact({
  signupUrl,
  priority,
  primaryAction,
  heading,
}: {
  signupUrl?: string;
  priority?: "primary" | "secondary";
  /** Extra call to action, displayed before "Nous contacter". */
  primaryAction?: { text: string; href: string };
  /** Wording of the heading. Defaults to "Intéressé ? Testez !". */
  heading?: { lead: string; action: string };
}) {
  const { lead, action } = heading ?? DEFAULT_HEADING;

  return (
    <div className="trial-contact">
      <p className="trial-contact__heading">
        <Mark mark={MARKS.start} className="trial-contact__mark trial-contact__mark--start" />
        <span>
          {lead} <strong>{action}</strong>
        </span>
        <Mark mark={MARKS.end} className="trial-contact__mark trial-contact__mark--end" />
      </p>
      <div className="buttons">
        {primaryAction && (
          <Button priority="primary" linkProps={{ href: primaryAction.href }}>
            {primaryAction.text}
          </Button>
        )}
        {signupUrl ? (
          <Button priority={priority || "secondary"} linkProps={{ href: signupUrl }}>
            Nous contacter
          </Button>
        ) : (
          <Button
            priority={priority || "secondary"}
            iconPosition="left"
            iconId="fr-icon-mail-fill"
            linkProps={{ href: "mailto:contact@suite.anct.gouv.fr" }}
          >
            Nous contacter
          </Button>
        )}
      </div>
    </div>
  );
}
