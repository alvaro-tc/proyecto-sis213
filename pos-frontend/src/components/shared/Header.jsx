import React from "react";
import { FaUserCircle, FaCoffee } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { HiSun, HiMoon } from "react-icons/hi";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { IconButton } from "../ui";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../i18n";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { i18n, t } = useTranslation();

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth");
    },
  });

  const isAdmin = userData.role?.toLowerCase() === "admin";

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-theme-surface border-b border-theme-border">
      <button
        onClick={() => navigate("/home")}
        className="flex items-center gap-2 cursor-pointer"
        aria-label="Ir al inicio"
      >
        <FaCoffee className="text-theme-accent text-3xl" />
        <h1 className="text-lg font-semibold text-theme-text tracking-wide">
          Cafeteria 5
        </h1>
      </button>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setLanguage(i18n.language === "es" ? "en" : "es")}
          title="Cambiar idioma"
          aria-label="Cambiar idioma"
          className="bg-theme-base rounded-[15px] px-3 py-2 text-sm font-semibold uppercase border border-theme-border text-theme-text hover:bg-theme-elevated transition-colors"
        >
          {i18n.language === "es" ? "EN" : "ES"}
        </button>

        <IconButton
          onClick={toggleTheme}
          icon={isDark ? HiSun : HiMoon}
          label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          className={isDark ? "text-theme-accent" : "text-theme-muted"}
        />

        {isAdmin && (
          <IconButton
            onClick={() => navigate("/home?tab=metricas")}
            icon={MdDashboard}
            label="Panel de administración"
            className="text-theme-text"
          />
        )}

        <div className="flex items-center gap-3">
          <FaUserCircle className="text-theme-muted text-4xl" />
          <div className="flex flex-col items-start">
            <h1 className="text-md text-theme-text font-semibold tracking-wide">
              {userData.name || t("app.guest")}
            </h1>
            <p className="text-xs text-theme-muted font-medium capitalize">
              {userData.role || "—"}
            </p>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            title={t("auth.logout")}
            aria-label={t("auth.logout")}
            disabled={logoutMutation.isPending}
            className="text-theme-muted hover:text-red-500 transition-colors ml-2 cursor-pointer disabled:opacity-50"
          >
            <IoLogOut size={38} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
