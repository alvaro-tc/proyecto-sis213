import React from "react";
import { FaSearch, FaUserCircle, FaBell, FaCoffee } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { HiSun, HiMoon } from "react-icons/hi";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth");
    },
  });

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-theme-surface border-b border-theme-border">
      {/* LOGO */}
      <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
        <FaCoffee className="text-[#f6b100] text-3xl" />
        <h1 className="text-lg font-semibold text-theme-text tracking-wide">
          Cafeteria 5
        </h1>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-4 bg-theme-base rounded-[15px] px-5 py-2 w-[500px] border border-theme-border">
        <FaSearch className="text-theme-muted" />
        <input
          type="text"
          placeholder="Buscar"
          className="bg-transparent outline-none text-theme-text placeholder:text-theme-muted flex-1"
        />
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          className="bg-theme-base rounded-[15px] p-3 cursor-pointer hover:bg-theme-elevated transition-colors border border-theme-border"
        >
          {isDark ? (
            <HiSun className="text-[#f6b100] text-2xl" />
          ) : (
            <HiMoon className="text-theme-muted text-2xl" />
          )}
        </button>

        {userData.role === "Admin" && (
          <div
            onClick={() => navigate("/dashboard")}
            className="bg-theme-base rounded-[15px] p-3 cursor-pointer hover:bg-theme-elevated transition-colors border border-theme-border"
          >
            <MdDashboard className="text-theme-text text-2xl" />
          </div>
        )}

        <div className="bg-theme-base rounded-[15px] p-3 cursor-pointer hover:bg-theme-elevated transition-colors border border-theme-border">
          <FaBell className="text-theme-text text-2xl" />
        </div>

        <div className="flex items-center gap-3 cursor-pointer">
          <FaUserCircle className="text-theme-muted text-4xl" />
          <div className="flex flex-col items-start">
            <h1 className="text-md text-theme-text font-semibold tracking-wide">
              {userData.name || "USUARIO DE PRUEBA"}
            </h1>
            <p className="text-xs text-theme-muted font-medium">
              {userData.role || "Rol"}
            </p>
          </div>
          <IoLogOut
            onClick={() => logoutMutation.mutate()}
            className="text-theme-muted hover:text-red-500 transition-colors ml-2 cursor-pointer"
            size={38}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
