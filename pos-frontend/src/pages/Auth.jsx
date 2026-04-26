import React, { useEffect, useState } from "react";
import restaurant from "../assets/images/restaurant-img.jpg"
import { FaCoffee } from "react-icons/fa";
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";

const Auth = () => {

  useEffect(() => {
    document.title = "POS | Autenticación"
  }, [])

  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Section */}
      <div className="w-1/2 relative flex items-center justify-center bg-cover">
        {/* BG Image */}
        <img className="w-full h-full object-cover" src={restaurant} alt="Imagen del Restaurante" />

        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-80"></div>

        {/* Quote at bottom */}
        <blockquote className="absolute bottom-10 px-8 mb-10 text-2xl italic text-white">
          "Sirve a los clientes la mejor comida con un servicio rápido y amigable
          en un ambiente acogedor, y no dejarán de volver."
          <br />
          <span className="block mt-4 text-yellow-400">- Fundador de Cafeteria 5</span>
        </blockquote>
      </div>

      {/* Right Section */}
      <div className="w-1/2 min-h-screen bg-theme-surface p-10">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center h-14 w-14 border-2 rounded-full p-1 text-theme-text">
            <FaCoffee className="text-3xl" />
          </div>
          <h1 className="text-lg font-semibold text-theme-text tracking-wide">Cafeteria 5</h1>
        </div>

        <h2 className="text-4xl text-center mt-10 font-semibold text-yellow-400 mb-10">
          {isRegister ? "Registro de Empleado" : "Inicio de Sesión"}
        </h2>

        {/* Components */}  
        {isRegister ? <Register setIsRegister={setIsRegister} /> : <Login />}


        <div className="flex justify-center mt-6">
          <p className="text-sm text-theme-muted">
            {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}
            <a onClick={() => setIsRegister(!isRegister)} className="text-yellow-400 font-semibold hover:underline ml-1" href="#">
              {isRegister ? "Iniciar sesión" : "Regístrate"}
            </a>
          </p>
        </div>


      </div>
    </div>
  );
};

export default Auth;
