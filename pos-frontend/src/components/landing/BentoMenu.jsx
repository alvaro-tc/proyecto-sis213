import { motion } from "framer-motion";
import { LuArrowUpRight } from "react-icons/lu";
import { LandingButton } from "../ui";

const CARDS = [
  {
    title: "Café de la casa",
    tag: "Energía pura",
    description:
      "Tostado local y preparado al momento. El empujón que necesitas para aguantar esa clase de dos horas.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80",
    alt: "Barista preparando café",
    span: "lg:col-span-7 lg:row-span-2 aspect-[4/5] lg:aspect-auto",
    tone: "dark",
  },
  {
    title: "Meriendas y snacks",
    tag: "Para el recreo",
    description: "Empanadas calientes, galletas con chips de chocolate y sándwiches clásicos para calmar el hambre.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
    alt: "Variedad de bocadillos rápidos",
    span: "lg:col-span-5 aspect-[4/3]",
    tone: "light",
  },
  {
    title: "Desayunos rápidos",
    tag: "Sin retrasos",
    description: "Jugos naturales, ensalada de frutas y tostados. Ideal para cuando llegas con el tiempo justo.",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80",
    alt: "Desayuno sencillo con jugo y pan",
    span: "lg:col-span-3 aspect-square",
    tone: "light",
  },
  {
    title: "Promos del mes",
    tag: "Ahorro",
    description: "Combos pensados para tu bolsillo. Pregunta por nuestra oferta especial de café + algo dulce.",
    image: "https://images.unsplash.com/photo-442550528053-c431ecb55509?auto=format&fit=crop&w=1200&q=80",
    alt: "Ofertas especiales en pizarra",
    span: "lg:col-span-2 aspect-square",
    tone: "dark",
  },
];

const BentoMenu = () => {
  return (
    <section id="menu" aria-labelledby="menu-title" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-orange-950">Nuestras opciones</p>
            <h2 id="menu-title" className="mt-3 text-4xl tracking-tight text-stone-900 sm:text-5xl font-semibold">
              Lo que necesitas para tu día.
            </h2>
          </div>
          <LandingButton as="a" href="#contacto" variant="secondary" size="md">
            Ver menú completo
            <LuArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </LandingButton>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {CARDS.map((card, idx) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
              className={`group relative overflow-hidden rounded-3xl ${card.span}`}
            >
              <img
                src={card.image}
                alt={card.alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className={`absolute inset-0 ${
                  card.tone === "dark"
                    ? "bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent"
                    : "bg-gradient-to-t from-stone-50/90 via-stone-50/10 to-transparent"
                }`}
              />
              <div
                className={`relative flex h-full flex-col justify-end p-6 lg:p-8 ${
                  card.tone === "dark" ? "text-stone-50" : "text-stone-900"
                }`}
              >
                <span
                  className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${
                    card.tone === "dark"
                      ? "bg-stone-50/15 text-stone-50 ring-1 ring-stone-50/20 backdrop-blur"
                      : "bg-stone-900/10 text-stone-900 ring-1 ring-stone-900/10 backdrop-blur"
                  }`}
                >
                  {card.tag}
                </span>
                <h3 className="mt-3 text-2xl tracking-tight sm:text-3xl font-semibold">{card.title}</h3>
                <p className={`mt-2 max-w-md text-sm leading-relaxed ${card.tone === "dark" ? "text-stone-200" : "text-stone-700"}`}>
                  {card.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoMenu;