import React from "react";

const EmptyState = ({ icon: Icon, title, description, action, className = "" }) => (
  <div className={`flex flex-col items-center justify-center text-center py-10 px-4 ${className}`}>
    {Icon && <Icon className="text-4xl text-theme-muted mb-3" />}
    {title && <h3 className="text-theme-text font-semibold mb-1">{title}</h3>}
    {description && (
      <p className="text-theme-muted text-sm max-w-sm">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
