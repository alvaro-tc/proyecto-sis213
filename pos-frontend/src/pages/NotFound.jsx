import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCoffee } from "react-icons/fa";
import { Button } from "../components/ui";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-theme-base flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <FaCoffee className="text-theme-accent text-6xl mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-theme-text">404</h1>
        <p className="mt-3 text-theme-muted">
          La página que buscas no existe o fue movida.
        </p>
        <Button className="mt-6" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
