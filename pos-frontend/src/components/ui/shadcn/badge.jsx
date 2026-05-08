import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent/40",
  {
    variants: {
      variant: {
        default:  "border-transparent bg-theme-brand text-theme-brand-fg",
        secondary:"border-transparent bg-theme-elevated text-theme-text",
        outline:  "text-theme-text border-theme-border",
        success:  "border-transparent bg-emerald-500/15 text-emerald-500",
        warning:  "border-transparent bg-amber-500/15 text-amber-500",
        danger:   "border-transparent bg-rose-500/15 text-rose-500",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const Badge = ({ className, variant, ...props }) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);

export { Badge, badgeVariants };
