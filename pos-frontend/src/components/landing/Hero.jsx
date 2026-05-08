import { motion } from "framer-motion";
import { LuArrowRight, LuSparkles } from "react-icons/lu";
import { LandingButton } from "../ui";

const Hero = ({ onCta }) => {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124, 45, 18, 0.15), transparent 70%)",
      }}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-16 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-32 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="lg:col-span-7"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50/70 px-4 py-1.5 text-xs font-medium text-stone-700 backdrop-blur">
            <LuSparkles size={14} className="text-orange-950" />
            Cafeteria UCB
          </span>

          <h1
            id="hero-title"
            className="mt-6 text-5xl leading-[1.05] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl font-semibold"
          >
            Cafetería que{" "}
            <span className="bg-gradient-to-br from-orange-950 via-stone-800 to-stone-500 bg-clip-text text-transparent">
              cumple con tus expectativas
            </span>
            .
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
            Somos una cafeteria que cumple con una atencion cálida con el cliente, comprendiendo las necesidades del estudiante...
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <LandingButton as="a" href="#menu" variant="primary" size="lg">
              Explorar menú
              <LuArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </LandingButton>
            <LandingButton type="button" onClick={onCta} variant="secondary" size="lg">
              Entrar al POS
            </LandingButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="relative lg:col-span-5"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-stone-200 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80"
              alt="Taza de café especial servida sobre madera"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute -bottom-6 -left-6 hidden rounded-3xl bg-stone-50/95 p-5 shadow-lg ring-1 ring-stone-200 backdrop-blur sm:block"
          >
            <p className="text-xs uppercase tracking-widest text-stone-500">Especial del mes</p>
            <p className="mt-1 text-xl text-stone-900 font-semibold">Producto · Producto</p>
            <p className="mt-1 text-sm text-stone-600">Descripción del producto</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
