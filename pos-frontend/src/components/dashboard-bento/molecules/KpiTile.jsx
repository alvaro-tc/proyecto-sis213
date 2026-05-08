import * as React from "react";
import { cn } from "../../../lib/utils";
import GlassCard from "../atoms/GlassCard";
import TrendBadge from "../atoms/TrendBadge";

/**
 * KpiTile — molécula. Una celda Bento con icono, título, valor y tendencia.
 * Soporta `loading` para Skeleton-state y `span` para colspan/rowspan en grid.
 */
const KpiTile = ({
  title,
  value,
  hint,
  icon: Icon,
  trend,
  loading = false,
  tone = "card",
  className,
  span = "",
  onClick,
  "aria-label": ariaLabel,
}) => {
  const Tag = onClick ? "button" : "div";

  return (
    <GlassCard
      as={Tag}
      tone={tone}
      onClick={onClick}
      aria-label={ariaLabel || title}
      className={cn(
        "p-5 text-left flex flex-col justify-between gap-4 min-h-[140px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2 focus-visible:ring-offset-theme-base",
        onClick && "cursor-pointer hover:-translate-y-[1px] transition-transform",
        span,
        className
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <span
              aria-hidden="true"
              className={cn(
                "h-9 w-9 rounded-xl grid place-items-center",
                tone === "brand" ? "bg-white/15 text-white" : "bg-theme-brand/10 text-theme-brand"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
          )}
          <p
            className={cn(
              "text-xs uppercase tracking-widest font-semibold",
              tone === "brand" ? "text-white/80" : "text-theme-muted"
            )}
          >
            {title}
          </p>
        </div>
        {trend !== undefined && <TrendBadge value={trend} />}
      </header>

      <div>
        {loading ? (
          <div className="h-9 w-2/3 rounded-md bg-theme-elevated/60 animate-pulse" />
        ) : (
          <p
            className={cn(
              "text-3xl md:text-4xl font-bold tracking-tight tabular-nums",
              tone === "brand" && "text-white"
            )}
          >
            {value}
          </p>
        )}
        {hint && (
          <p
            className={cn(
              "text-xs mt-1",
              tone === "brand" ? "text-white/70" : "text-theme-muted"
            )}
          >
            {hint}
          </p>
        )}
      </div>
    </GlassCard>
  );
};

export default React.memo(KpiTile);
