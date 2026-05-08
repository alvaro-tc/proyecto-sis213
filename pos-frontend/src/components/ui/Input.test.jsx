import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Input from "./Input";

describe("Input", () => {
  it("muestra el label", () => {
    render(<Input label="Correo" name="email" />);
    expect(screen.getByLabelText("Correo")).toBeInTheDocument();
  });

  it("muestra el mensaje de error", () => {
    render(<Input label="Email" name="email" error="Correo inválido" />);
    expect(screen.getByText("Correo inválido")).toBeInTheDocument();
  });
});
