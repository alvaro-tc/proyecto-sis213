import React from "react";

const VARIANTS = {
  primary:
    "bg-orange-950 text-stone-50 hover:bg-orange-900 shadow-sm hover:shadow-md",
  secondary:
    "border border-stone-300 bg-stone-50 text-stone-900 hover:border-stone-900 hover:bg-stone-100",
  dark: "bg-stone-50 text-stone-950 hover:bg-stone-200",
};

const SIZES = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-sm",
};

const LandingButton = ({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) => (
  <Tag
    className={`group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all active:scale-95 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...rest}
  >
    {children}
  </Tag>
);

export default LandingButton;
