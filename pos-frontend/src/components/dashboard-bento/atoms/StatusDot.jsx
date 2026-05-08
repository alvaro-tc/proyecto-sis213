import * as React from "react";
import { cn } from "../../../lib/utils";

const PALETTE = {
  pending:    "bg-amber-500",
  progress:   "bg-sky-500",
  ready:      "bg-emerald-500",
  completed:  "bg-emerald-600",
  cancelled:  "bg-rose-500",
};

/** Punto de estado con halo pulsante para 'live' feel. */
const StatusDot = ({ status = "progress", pulse = true, className }) => {
  const color = PALETTE[status] || PALETTE.progress;
  return (
    <span
      role="status"
      aria-label={`Estado: ${status}`}
      className={cn("relative inline-flex h-2.5 w-2.5", className)}
    >
      {pulse && (
        <span
          aria-hidden="true"
          className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping", color)}
        />
      )}
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", color)} />
    </span>
  );
};

export default StatusDot;
