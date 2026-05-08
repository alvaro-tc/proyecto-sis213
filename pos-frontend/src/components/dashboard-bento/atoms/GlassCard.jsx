import * as React from "react";
import { cn } from "../../../lib/utils";

/**
 * GlassCard — atomo. Tarjeta con glassmorphism sutil sobre los tokens del tema.
 * Uso de bg con alpha + backdrop-blur. Bordes 2xl + sombra suave.
 */
const GlassCard = React.forwardRef(
  ({ className, as: Tag = "div", tone = "card", ...props }, ref) => {
    const tones = {
      card:
        "bg-theme-card/70 supports-[backdrop-filter]:bg-theme-card/55 backdrop-blur-xl border-theme-border/70",
      surface:
        "bg-theme-surface/70 supports-[backdrop-filter]:bg-theme-surface/55 backdrop-blur-xl border-theme-border/60",
      brand:
        "bg-gradient-to-br from-theme-brand/90 to-theme-accent/80 backdrop-blur-xl border-white/10 text-theme-brand-fg",
    };
    return (
      <Tag
        ref={ref}
        className={cn(
          "relative rounded-2xl border shadow-[0_4px_24px_-12px_rgba(0,0,0,0.25)]",
          "transition-shadow hover:shadow-[0_10px_32px_-12px_rgba(0,0,0,0.35)]",
          tones[tone],
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export default GlassCard;
