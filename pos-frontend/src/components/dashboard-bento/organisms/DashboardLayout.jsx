import * as React from "react";
import { cn } from "../../../lib/utils";

/**
 * DashboardLayout — organismo. Wrapper del dashboard con:
 *  - Header con saludo y meta (children prop `header`)
 *  - Sidebar opcional con glassmorphism (children prop `sidebar`)
 *  - Slot principal (`children`)
 *
 * Diseñado para integrarse dentro del tab "Inicio" sin pelear con el shell de Home.
 * Composición tipo Compound: <DashboardLayout><DashboardLayout.Header />…</DashboardLayout>
 */
const Header = ({ children, className }) => (
  <header className={cn("flex flex-wrap items-end justify-between gap-4 mb-5", className)}>
    {children}
  </header>
);

const Sidebar = ({ children, className }) => (
  <aside
    className={cn(
      "hidden xl:flex flex-col gap-4 w-72 shrink-0",
      "rounded-2xl p-4 border border-theme-border/60",
      "bg-theme-surface/60 supports-[backdrop-filter]:bg-theme-surface/40 backdrop-blur-xl",
      "shadow-[0_8px_32px_-16px_rgba(0,0,0,0.35)]",
      className
    )}
    aria-label="Panel lateral del dashboard"
  >
    {children}
  </aside>
);

const Body = ({ children, className }) => (
  <div className={cn("flex-1 min-w-0 flex flex-col gap-4", className)}>{children}</div>
);

const DashboardLayout = ({ children, className }) => (
  <section
    className={cn(
      "px-4 md:px-6 lg:px-8 py-5",
      "flex gap-6",
      className
    )}
    aria-label="Panel administrativo Cafeteria 5"
  >
    {children}
  </section>
);

DashboardLayout.Header = Header;
DashboardLayout.Sidebar = Sidebar;
DashboardLayout.Body = Body;

export default DashboardLayout;
