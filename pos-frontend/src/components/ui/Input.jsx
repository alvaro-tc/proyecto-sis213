import React, { forwardRef } from "react";

const Input = forwardRef(({ label, id, error, className = "", ...rest }, ref) => {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-theme-muted mb-2 text-sm font-medium">
          {label}
        </label>
      )}
      <div className={`flex items-center rounded-lg px-4 py-3 bg-theme-base border ${error ? "border-red-500" : "border-theme-border"}`}>
        <input
          ref={ref}
          id={inputId}
          className={`bg-transparent flex-1 text-theme-text placeholder:text-theme-muted focus:outline-none ${className}`}
          {...rest}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
