import * as React from "react";
import { cn } from "../../../lib/utils";

/**
 * BentoGrid — contenedor responsive 12 cols con auto-rows.
 * Las celdas (KpiTile/etc) controlan span con `className="col-span-X row-span-Y"`.
 */
const BentoGrid = ({ className, children }) => (
  <div
    className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 auto-rows-[minmax(140px,auto)] gap-4",
      className
    )}
  >
    {children}
  </div>
);

export default BentoGrid;
