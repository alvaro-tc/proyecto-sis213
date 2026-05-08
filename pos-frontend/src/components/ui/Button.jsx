import React from "react";

const VARIANTS = {
  primary: "bg-theme-accent text-gray-900 hover:bg-yellow-500",
  secondary: "bg-theme-base text-theme-text hover:bg-theme-elevated border border-theme-border",
  ghost: "bg-transparent text-theme-text hover:bg-theme-elevated",
  danger: "bg-red-500 text-white hover:bg-red-600",
  success: "bg-[#02ca3a] text-white hover:opacity-90",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
};

const Button = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon: Icon,
  children,
  className = "",
  ...rest
}) => (
  <button
    className={`rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    {...rest}
  >
    {Icon && <Icon className="text-lg" />}
    {children}
  </button>
);

export default Button;
