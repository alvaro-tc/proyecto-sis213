import React, { forwardRef } from "react";

const IconButton = forwardRef(
  ({ icon: Icon, label, active = false, className = "", ...rest }, ref) => (
    <button
      ref={ref}
      title={label}
      aria-label={label}
      className={`bg-theme-base rounded-[15px] p-3 cursor-pointer hover:bg-theme-elevated transition-colors border border-theme-border disabled:opacity-50 disabled:cursor-not-allowed ${active ? "border-theme-accent" : ""} ${className}`}
      {...rest}
    >
      {Icon && <Icon className="text-2xl" />}
    </button>
  )
);

IconButton.displayName = "IconButton";
export default IconButton;
