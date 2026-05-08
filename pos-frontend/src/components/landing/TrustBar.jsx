import { motion } from "framer-motion";
import { LuLeaf, LuAward, LuMapPin, LuHeartHandshake } from "react-icons/lu";

const ITEMS = [
  { 
    icon: LuHeartHandshake, 
    title: "Empatía Estudiantil", 
    description: "Sabemos lo que es un examen final; por eso te atendemos con la mejor onda para recargar tus energías." 
  },
  { 
    icon: LuAward, 
    title: "Calidad que rinde", 
    description: "Café real para ideas reales. Te damos la cafeína necesaria para que tus neuronas no vayan a explotar." 
  },
  { 
    icon: LuLeaf, 
    title: "Consumo Consciente", 
    description: "Promovemos el uso de tazas reutilizables y procesos limpios dentro de nuestro campus." 
  },
  { 
    icon: LuMapPin, 
    title: "Punto de Encuentro", 
    description: "Más que una barra, somos el lugar donde nacen los grupos de estudio y las mejores amistades." 
  },
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
          Con calidad y cariño nosotros nos sostenemos a nuestros valores...
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
