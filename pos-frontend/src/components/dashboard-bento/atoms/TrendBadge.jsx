import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "../../ui/shadcn/badge";

/** Badge de tendencia: positivo / negativo / neutro. */
const TrendBadge = ({ value, suffix = "%" }) => {
  if (value == null || isNaN(value)) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Minus className="h-3 w-3" aria-hidden="true" /> sin datos
      </Badge>
    );
  }
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <Badge variant={positive ? "success" : "danger"} className="gap-1">
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span className="sr-only">{positive ? "Subió" : "Bajó"}</span>
      {Math.abs(value).toFixed(1)}{suffix}
    </Badge>
  );
};

export default TrendBadge;
