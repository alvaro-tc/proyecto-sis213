import { useState } from "react";
import { motion } from "framer-motion";
import { LuCoffee, LuInstagram, LuFacebook, LuTwitter, LuSend } from "react-icons/lu";

const QUICK_LINKS = [
  { href: "#menu", label: "Menú" },
  { href: "#origen", label: "Nuestro origen" },
  { href: "#contacto", label: "Contacto" },
  { href: "#", label: "Trabaja con nosotros" },
];

const SOCIALS = [
  { href: "#", label: "Instagram", icon: LuInstagram },
  { href: "#", label: "Facebook", icon: LuFacebook },
  { href: "#", label: "Twitter", icon: LuTwitter },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <footer className="bg-stone-950 text-stone-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
      >
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <a href="#" className="inline-flex items-center gap-2 text-2xl text-stone-50 font-semibold">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-stone-50 text-stone-950">
                <LuCoffee size={20} strokeWidth={2.2} />
              </span>
              Cafeteria 5
            </a>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-stone-400">
              Suscríbete a nuestro boletín y recibe las novedades del tueste de cada mes, recetas y descuentos exclusivos.
            </p>

            <form onSubmit={onSubmit} className="mt-6 max-w-md" noValidate>
              <label htmlFor="newsletter-email" className="sr-only">Correo electrónico</label>
              <div className="flex items-center gap-2 rounded-full border border-stone-800 bg-stone-900 p-1.5 focus-within:border-stone-600">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="flex-1 bg-transparent px-4 py-2 text-sm text-stone-50 placeholder:text-stone-500 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Suscribirse"
                  className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 px-4 py-2 text-sm font-medium text-stone-950 transition-all hover:bg-stone-200 active:scale-95"
                >
                  <LuSend size={14} />
                  {sent ? "¡Listo!" : "Suscribir"}
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-7 lg:grid-cols-3">
            <div>
              <h3 className="text-base text-stone-50 font-semibold">Navegación</h3>
              <ul className="mt-4 space-y-3">
                {QUICK_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-stone-400 transition-colors hover:text-stone-50">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-base text-stone-50 font-semibold">Contacto</h3>
              <ul className="mt-4 space-y-3 text-sm text-stone-400">
                <li>Calle de los Aromas 245</li>
                <li>Cochabamba, Bolivia</li>
                <li>+591 4 444 5566</li>
                <li>hola@cafeteria5.com</li>
              </ul>
            </div>

            <div className="col-span-2 lg:col-span-1">
              <h3 className="text-base text-stone-50 font-semibold">Síguenos</h3>
              <ul className="mt-4 flex gap-3">
                {SOCIALS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        aria-label={s.label}
                        className="grid h-10 w-10 place-items-center rounded-full border border-stone-800 bg-stone-900 text-stone-300 transition-all hover:-translate-y-0.5 hover:border-stone-600 hover:text-stone-50"
                      >
                        <Icon size={16} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-stone-800 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} Cafeteria 5. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-stone-500">
            <a href="#" className="hover:text-stone-300">Privacidad</a>
            <a href="#" className="hover:text-stone-300">Términos</a>
            <a href="#" className="hover:text-stone-300">Cookies</a>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
