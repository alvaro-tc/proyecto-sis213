import { motion } from "framer-motion";
import { LuClock, LuMapPin, LuPhone, LuNavigation } from "react-icons/lu";
import { LandingButton } from "../ui";

const SCHEDULE = [
  { day: "Lunes – Viernes", hours: "07:00 — 20:00" },
  { day: "Sábados", hours: "08:00 — 22:00" },
  { day: "Domingos", hours: "09:00 — 18:00" },
];

const Contact = () => {
  return (
    <section id="contacto" aria-labelledby="contact-title" className="bg-stone-100/40 py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-sm font-medium uppercase tracking-widest text-orange-950">Visítanos</p>
          <h2 id="contact-title" className="mt-3 text-4xl tracking-tight text-stone-900 sm:text-5xl font-semibold">
            Te esperamos con la cafetera lista.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-stone-600">
            Encuéntranos en el centro histórico, a dos cuadras de la plaza principal. Estacionamiento gratuito para clientes.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex items-start gap-4 rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-950 text-stone-50">
                <LuMapPin size={18} />
              </span>
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-stone-500">Dirección</p>
                <p className="mt-1 text-lg text-stone-900 font-semibold">Calle de los Aromas 245</p>
                <p className="text-sm text-stone-600">Centro histórico, Cochabamba</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-950 text-stone-50">
                <LuClock size={18} />
              </span>
              <div className="w-full">
                <p className="text-sm font-medium uppercase tracking-wider text-stone-500">Horarios</p>
                <ul className="mt-2 space-y-1.5">
                  {SCHEDULE.map((item) => (
                    <li key={item.day} className="flex items-center justify-between text-sm">
                      <span className="text-stone-700">{item.day}</span>
                      <span className="font-medium text-stone-900">{item.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-950 text-stone-50">
                <LuPhone size={18} />
              </span>
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-stone-500">Reservas</p>
                <p className="mt-1 text-lg text-stone-900 font-semibold">+591 4 444 5566</p>
                <p className="text-sm text-stone-600">hola@cafeteria5.com</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative h-full min-h-[480px] overflow-hidden rounded-3xl border border-stone-200 bg-stone-200">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 30%, rgba(120, 113, 108, 0.25), transparent 40%), radial-gradient(circle at 70% 70%, rgba(67, 20, 7, 0.18), transparent 45%), linear-gradient(135deg, #e7e5e4 0%, #d6d3d1 100%)",
              }}
              aria-hidden="true"
            />

            <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 400 400" fill="none" aria-hidden="true">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#a8a29e" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#grid)" />
              <path d="M 0 220 Q 100 180 200 210 T 400 200" stroke="#78716c" strokeWidth="2.5" fill="none" />
              <path d="M 200 0 Q 220 100 195 200 T 210 400" stroke="#78716c" strokeWidth="2.5" fill="none" />
            </svg>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-orange-950/30" />
                <div className="relative grid h-14 w-14 place-items-center rounded-full bg-orange-950 text-stone-50 shadow-xl ring-4 ring-stone-50">
                  <LuMapPin size={22} strokeWidth={2.4} />
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl bg-stone-50/95 p-4 shadow-lg backdrop-blur">
              <div>
                <p className="text-base text-stone-900 font-semibold">Cafeteria 5</p>
                <p className="text-xs text-stone-600">Calle de los Aromas 245</p>
              </div>
              <LandingButton
                as="a"
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                size="sm"
              >
                <LuNavigation size={13} />
                Cómo llegar
              </LandingButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
