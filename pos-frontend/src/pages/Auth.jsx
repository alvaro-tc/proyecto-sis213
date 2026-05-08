import React, { useEffect, useState } from "react";
import { FaCoffee } from "react-icons/fa";
import { LuSun, LuMoon, LuSparkles, LuArrowLeft } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";
import { useTheme } from "../context/ThemeContext";

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    document.title = "POS | Autenticación";
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-theme-base text-theme-text overflow-hidden">
      {/* Glow ambient (ambas direcciones) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 15% 0%, rgba(217, 119, 6, 0.18), transparent 70%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(180, 83, 9, 0.12), transparent 70%)",
        }}
      />

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-theme-card/70 px-3 py-1.5 text-xs font-medium text-theme-muted backdrop-blur transition-colors hover:text-theme-text hover:bg-theme-elevated"
        >
          <LuArrowLeft size={14} />
          <span className="hidden sm:inline">Volver al inicio</span>
          <span className="sm:hidden">Inicio</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-theme-border bg-theme-card/70 text-theme-text backdrop-blur transition-colors hover:bg-theme-elevated"
        >
          {isDark ? <LuSun size={16} /> : <LuMoon size={16} />}
        </button>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-stretch gap-6 px-5 pb-10 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-2 lg:gap-12 lg:px-10">
        {/* Hero / Brand panel */}
        <section className="hidden lg:flex flex-col justify-between rounded-3xl border border-theme-border bg-theme-card/60 p-10 backdrop-blur-sm">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-theme-base/60 px-3 py-1.5 text-xs font-medium text-theme-muted">
              <LuSparkles size={14} className="text-theme-accent" />
              Tueste artesanal · Cosecha 2026
            </span>

            <h1 className="mt-8 text-5xl font-semibold leading-[1.05] tracking-tight text-theme-text xl:text-6xl">
              Bienvenido a{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--color-brand), var(--color-accent))",
                }}
              >
                Cafeteria 5
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-theme-muted">
              Granos de origen único, tostados en casa y servidos con calma.
              Inicia sesión para gestionar pedidos, mesas y la magia detrás de
              cada taza.
            </p>
          </div>

          <blockquote className="mt-10 border-l-2 border-theme-accent pl-5">
            <p className="text-lg italic text-theme-text/90">
              “Sirve a tus clientes la mejor comida con un servicio rápido y
              amigable en un ambiente acogedor, y no dejarán de volver.”
            </p>
            <footer className="mt-3 text-sm font-medium text-theme-accent">
              — Fundador de Cafeteria 5
            </footer>
          </blockquote>
        </section>

        {/* Form panel */}
        <section className="flex w-full flex-col justify-center py-4 sm:py-8">
          <div className="mx-auto w-full max-w-md">
            {/* Brand mark (todas las pantallas) */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-theme-brand-fg shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-brand), var(--color-accent))",
                }}
              >
                <FaCoffee className="text-2xl" />
              </div>
              <h2 className="text-base font-semibold tracking-wide text-theme-text">
                {t("app.name")}
              </h2>
            </div>

            {/* Tabs login/register */}
            <div className="mx-auto mt-6 grid w-full max-w-xs grid-cols-2 rounded-full border border-theme-border bg-theme-surface p-1">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  !isRegister
                    ? "bg-theme-brand text-theme-brand-fg shadow-sm"
                    : "text-theme-muted hover:text-theme-text"
                }`}
              >
                {t("auth.login")}
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isRegister
                    ? "bg-theme-brand text-theme-brand-fg shadow-sm"
                    : "text-theme-muted hover:text-theme-text"
                }`}
              >
                {t("auth.register")}
              </button>
            </div>

            <h3 className="mt-8 text-center text-2xl font-semibold tracking-tight text-theme-text sm:text-3xl">
              {isRegister ? t("auth.registerTitle") : t("auth.loginTitle")}
            </h3>
            <p className="mt-2 text-center text-sm text-theme-muted">
              {isRegister
                ? "Crea tu cuenta para empezar a servir."
                : "Tu próxima taza te está esperando."}
            </p>

            {/* Card del formulario */}
            <div className="mt-8 rounded-2xl border border-theme-border bg-theme-card p-6 shadow-sm sm:p-8">
              {isRegister ? (
                <Register setIsRegister={setIsRegister} />
              ) : (
                <Login />
              )}
            </div>

            <p className="mt-6 text-center text-sm text-theme-muted">
              {isRegister ? t("auth.haveAccount") : t("auth.noAccount")}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="ml-1 font-semibold text-theme-accent hover:underline"
              >
                {isRegister ? t("auth.login") : t("auth.register")}
              </button>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Auth;
