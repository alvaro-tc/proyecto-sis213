import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuCoffee, LuMenu, LuX } from "react-icons/lu";
import { LandingButton } from "../ui";

const NAV_LINKS = [
  { href: "#menu", label: "Menú" },
  { href: "#origen", label: "Origen" },
  { href: "#contacto", label: "Contacto" },
];

const Navbar = ({ onCta }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCta = () => {
    if (onCta) return onCta();
    navigate("/auth");
  };

  return (
    <nav
      aria-label="Navegación principal"
      className={`sticky top-0 z-50 w-full backdrop-blur-md transition-colors duration-300 ${
        scrolled ? "bg-stone-50/80 border-b border-stone-200/60" : "bg-stone-50/40"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#" className="flex items-center gap-2 text-stone-900 text-xl tracking-tight font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-orange-950 text-stone-50">
            <LuCoffee size={18} strokeWidth={2.2} />
          </span>
          Cafeteria 5
        </a>

        <ul className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-sm font-medium text-stone-700 transition-colors hover:text-orange-950">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <LandingButton type="button" onClick={handleCta} variant="primary" size="md">
            Entrar al POS
          </LandingButton>
        </div>

        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-stone-900 md:hidden"
        >
          {open ? <LuX size={20} /> : <LuMenu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-stone-200/60 bg-stone-50/95 backdrop-blur-md"
          >
            <ul className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-base font-medium text-stone-800 hover:bg-stone-100"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="mt-2">
                <LandingButton
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    handleCta();
                  }}
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Entrar al POS
                </LandingButton>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
