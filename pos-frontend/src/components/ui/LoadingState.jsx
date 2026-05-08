import React from "react";

const LoadingState = ({ label = "Cargando…", className = "" }) => (
  <div className={`flex items-center justify-center gap-3 py-8 text-theme-muted ${className}`}>
    <span className="inline-block w-4 h-4 rounded-full border-2 border-theme-muted border-t-[#f6b100] animate-spin" />
    <span className="text-sm">{label}</span>
  </div>
);

export default LoadingState;
