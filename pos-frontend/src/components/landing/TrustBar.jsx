import { motion } from "framer-motion";
import { LuLeaf, LuAward, LuMapPin, LuHeartHandshake } from "react-icons/lu";

const ITEMS = [
  { icon: LuLeaf, title: "Sostenibilidad", description: "Cultivo orgánico y empaques compostables." },
  { icon: LuAward, title: "Calidad SCA", description: "Granos puntuados por encima de 85." },
  { icon: LuMapPin, title: "Origen único", description: "Trazabilidad desde la finca hasta tu taza." },
  { icon: LuHeartHandshake, title: "Comercio justo", description: "Pago directo a productores aliados." },
];

const TrustBar = () => {
  return (
    <section
      id="origen"
      aria-labelledby="trust-title"
      className="border-y border-stone-200/70 bg-stone-100/40 py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.h2
          id="trust-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl text-3xl tracking-tight text-stone-900 sm:text-4xl font-semibold"
        >
          Cada taza nace de una promesa.
        </motion.h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                className="group rounded-3xl border border-stone-200 bg-stone-50 p-6 transition-all hover:-translate-y-1 hover:border-stone-300 hover:shadow-md"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-950/95 text-stone-50 transition-transform group-hover:scale-110">
                  <Icon size={20} strokeWidth={2} />
                </span>
                <h3 className="mt-5 text-xl text-stone-900 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
