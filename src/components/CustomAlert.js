export default function CustomAlert({ severity, title, description, children, className }) {
  return (
    <div className={`custom-alert ${severity} ${className}`}>
      <div className="custom-alert-icon">
        {severity === "info" && <i className="fr-icon-info-fill" />}
        {severity === "success" && <i className="fr-icon-success-fill" />}
        {severity === "error" && <i className="fr-icon-error-fill" />}
        {severity === "warning" && <i className="fr-icon-warning-fill" />}
      </div>
      <div className="custom-alert-content">
        <h3 className="custom-alert-title">{title}</h3>
        <p className="custom-alert-description">{description}</p>
        {children}
      </div>
    </div>
  );
}
