import { fr } from "@codegouvfr/react-dsfr";

const Breadcrumb = ({ segments, currentPageLabel }) => {
  return (
    <nav role="navigation" className={fr.cx("fr-breadcrumb")} style={{ marginBottom: "1rem" }}>
      <div className={fr.cx("fr-collapse")}>
        <ol className={fr.cx("fr-breadcrumb__list")}>
          <>
            {segments.map(({ label, onClick }, i) => (
              <li key={i}>
                <span style={{ cursor: "pointer" }} className={fr.cx("fr-breadcrumb__link")} onClick={onClick}>
                  {label}
                </span>
              </li>
            ))}
            <li>
              <span className={fr.cx("fr-breadcrumb__link")} aria-current="page">
                {currentPageLabel}
              </span>
            </li>
          </>
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
