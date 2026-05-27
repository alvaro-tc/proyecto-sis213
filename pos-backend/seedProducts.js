const mongoose = require("mongoose");
require("dotenv").config();

// Imports models
const Category = require("./models/categoryModel");
const Insumo = require("./models/insumoModel");
const Dish = require("./models/dishModel");

async function seed() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully!");

    // 1. Clear existing products, categories, and insumos to start fresh and clean
    console.log("Cleaning existing dishes, categories, and insumos...");
    await Dish.deleteMany({});
    await Category.deleteMany({});
    await Insumo.deleteMany({});
    console.log("Cleaned!");

    // 2. Seed Categories
    console.log("Seeding Categories...");
    const categoriesData = [
      { name: "Café", bgColor: "#6F4E37", icon: "☕" },
      { name: "Té e Infusiones", bgColor: "#4F7942", icon: "🫖" },
      { name: "Repostería", bgColor: "#E8C39E", icon: "🍰" },
      { name: "Sándwiches y Salados", bgColor: "#C29B38", icon: "🥪" },
      { name: "Bebidas Frías", bgColor: "#4682B4", icon: "🥤" }
    ];
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`Successfully seeded ${createdCategories.length} categories.`);

    // Map categories by name for easy reference
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // 3. Seed Insumos (Inventory Items)
    console.log("Seeding Insumos (Inventory)...");
    const insumosData = [
      { nombre: "Café en grano", unidad: "kg", stock: 15, stockMinimo: 3, stockMaximo: 30, costoUnitario: 80, categoria: "Café", proveedor: "Café Yungas S.A." },
      { nombre: "Leche entera", unidad: "L", stock: 36, stockMinimo: 8, stockMaximo: 60, costoUnitario: 6.5, categoria: "Lácteos", proveedor: "Pil Andina" },
      { nombre: "Agua filtrada", unidad: "L", stock: 150, stockMinimo: 20, stockMaximo: 300, costoUnitario: 0.2, categoria: "Bebidas", proveedor: "Filtro Interno" },
      { nombre: "Té Negro en hojas", unidad: "g", stock: 2000, stockMinimo: 300, stockMaximo: 5000, costoUnitario: 0.15, categoria: "Té", proveedor: "Te Supremo" },
      { nombre: "Té Verde en hojas", unidad: "g", stock: 1500, stockMinimo: 300, stockMaximo: 5000, costoUnitario: 0.18, categoria: "Té", proveedor: "Te Supremo" },
      { nombre: "Pan Ciabatta", unidad: "und", stock: 50, stockMinimo: 10, stockMaximo: 80, costoUnitario: 1.8, categoria: "Panadería", proveedor: "Panadería Central" },
      { nombre: "Queso Mozzarella", unidad: "kg", stock: 8, stockMinimo: 2, stockMaximo: 15, costoUnitario: 48, categoria: "Frialdad", proveedor: "Lácteos Flor de Leche" },
      { nombre: "Jamón York", unidad: "kg", stock: 6, stockMinimo: 1.5, stockMaximo: 12, costoUnitario: 38, categoria: "Frialdad", proveedor: "Embutidos Sofía" },
      { nombre: "Harina de Trigo", unidad: "kg", stock: 20, stockMinimo: 5, stockMaximo: 40, costoUnitario: 7.2, categoria: "Repostería", proveedor: "Famosa" },
      { nombre: "Azúcar refinada", unidad: "kg", stock: 15, stockMinimo: 3, stockMaximo: 30, costoUnitario: 6, categoria: "Ingredientes", proveedor: "Guabirá" },
      { nombre: "Cacao en polvo", unidad: "kg", stock: 4, stockMinimo: 1, stockMaximo: 10, costoUnitario: 55, categoria: "Repostería", proveedor: "El Ceibo" },
      { nombre: "Jarabe de Caramelo", unidad: "ml", stock: 2000, stockMinimo: 500, stockMaximo: 5000, costoUnitario: 0.05, categoria: "Jarabes", proveedor: "Monin" }
    ];
    const createdInsumos = await Insumo.insertMany(insumosData);
    console.log(`Successfully seeded ${createdInsumos.length} insumos.`);

    // Map insumos by name for easy reference
    const insumoMap = {};
    createdInsumos.forEach(ins => {
      insumoMap[ins.nombre] = ins._id;
    });

    // 4. Seed Dishes (Products)
    console.log("Seeding Dishes (Products)...");
    const dishesData = [
      // --- CAFÉ ---
      {
        name: "Espresso Sencillo",
        price: 10.00,
        category: categoryMap["Café"],
        type: "Bebida caliente",
        insumosRequeridos: [
          { insumo: insumoMap["Café en grano"], cantidad: 0.009 }, // 9 grams
          { insumo: insumoMap["Agua filtrada"], cantidad: 0.03 } // 30 ml
        ]
      },
      {
        name: "Espresso Doble",
        price: 14.00,
        category: categoryMap["Café"],
        type: "Bebida caliente",
        insumosRequeridos: [
          { insumo: insumoMap["Café en grano"], cantidad: 0.018 }, // 18 grams
          { insumo: insumoMap["Agua filtrada"], cantidad: 0.06 } // 60 ml
        ]
      },
      {
        name: "Café Americano",
        price: 11.00,
        category: categoryMap["Café"],
        type: "Bebida caliente",
        insumosRequeridos: [
          { insumo: insumoMap["Café en grano"], cantidad: 0.018 },
          { insumo: insumoMap["Agua filtrada"], cantidad: 0.20 } // 200 ml
        ]
      },
      {
        name: "Café Latte Cappuccino",
        price: 15.00,
        category: categoryMap["Café"],
        type: "Bebida caliente",
        insumosRequeridos: [
          { insumo: insumoMap["Café en grano"], cantidad: 0.018 },
          { insumo: insumoMap["Leche entera"], cantidad: 0.22 }, // 220 ml
          { insumo: insumoMap["Agua filtrada"], cantidad: 0.03 }
        ]
      },
      {
        name: "Café Mocaccino",
        price: 17.00,
        category: categoryMap["Café"],
        type: "Bebida caliente",
        insumosRequeridos: [
          { insumo: insumoMap["Café en grano"], cantidad: 0.018 },
          { insumo: insumoMap["Leche entera"], cantidad: 0.20 },
          { insumo: insumoMap["Cacao en polvo"], cantidad: 0.015 }, // 15 grams
          { insumo: insumoMap["Agua filtrada"], cantidad: 0.03 }
        ]
      },
      // --- TÉ E INFUSIONES ---
      {
        name: "Té Negro Clásico",
        price: 9.00,
        category: categoryMap["Té e Infusiones"],
        type: "Bebida caliente",
        insumosRequeridos: [
          { insumo: insumoMap["Té Negro en hojas"], cantidad: 3 }, // 3 grams
          { insumo: insumoMap["Agua filtrada"], cantidad: 0.25 }
        ]
      },
      {
        name: "Té Verde Premium",
        price: 10.00,
        category: categoryMap["Té e Infusiones"],
        type: "Bebida caliente",
        insumosRequeridos: [
          { insumo: insumoMap["Té Verde en hojas"], cantidad: 3 },
          { insumo: insumoMap["Agua filtrada"], cantidad: 0.25 }
        ]
      },
      {
        name: "Infusión de Manzanilla y Miel",
        price: 9.00,
        category: categoryMap["Té e Infusiones"],
        type: "Bebida caliente",
        insumosRequeridos: [
          { insumo: insumoMap["Agua filtrada"], cantidad: 0.25 }
        ]
      },
      // --- REPOSTERÍA ---
      {
        name: "Croissant de Mantequilla",
        price: 12.00,
        category: categoryMap["Repostería"],
        type: "Comida",
        insumosRequeridos: [
          { insumo: insumoMap["Harina de Trigo"], cantidad: 0.08 }
        ]
      },
      {
        name: "Muffin Relleno de Chocolate",
        price: 11.00,
        category: categoryMap["Repostería"],
        type: "Comida",
        insumosRequeridos: [
          { insumo: insumoMap["Harina de Trigo"], cantidad: 0.06 },
          { insumo: insumoMap["Cacao en polvo"], cantidad: 0.012 },
          { insumo: insumoMap["Azúcar refinada"], cantidad: 0.02 }
        ]
      },
      {
        name: "Porción de Torta Tres Leches",
        price: 16.00,
        category: categoryMap["Repostería"],
        type: "Comida",
        insumosRequeridos: [
          { insumo: insumoMap["Leche entera"], cantidad: 0.10 },
          { insumo: insumoMap["Harina de Trigo"], cantidad: 0.05 },
          { insumo: insumoMap["Azúcar refinada"], cantidad: 0.03 }
        ]
      },
      // --- SÁNDWICHES Y SALADOS ---
      {
        name: "Sándwich Mixto Clásico",
        price: 16.00,
        category: categoryMap["Sándwiches y Salados"],
        type: "Comida",
        insumosRequeridos: [
          { insumo: insumoMap["Pan Ciabatta"], cantidad: 1 },
          { insumo: insumoMap["Jamón York"], cantidad: 0.05 }, // 50g
          { insumo: insumoMap["Queso Mozzarella"], cantidad: 0.05 } // 50g
        ]
      },
      {
        name: "Sándwich Caprese Italiano",
        price: 18.00,
        category: categoryMap["Sándwiches y Salados"],
        type: "Comida",
        insumosRequeridos: [
          { insumo: insumoMap["Pan Ciabatta"], cantidad: 1 },
          { insumo: insumoMap["Queso Mozzarella"], cantidad: 0.08 } // 80g
        ]
      },
      // --- BEBIDAS FRÍAS ---
      {
        name: "Iced Latte de Caramelo",
        price: 17.00,
        category: categoryMap["Bebidas Frías"],
        type: "Bebida fría",
        insumosRequeridos: [
          { insumo: insumoMap["Café en grano"], cantidad: 0.018 },
          { insumo: insumoMap["Leche entera"], cantidad: 0.20 },
          { insumo: insumoMap["Jarabe de Caramelo"], cantidad: 20 }, // 20 ml
          { insumo: insumoMap["Agua filtrada"], cantidad: 0.03 }
        ]
      },
      {
        name: "Frappé de Café y Cacao",
        price: 19.00,
        category: categoryMap["Bebidas Frías"],
        type: "Bebida fría",
        insumosRequeridos: [
          { insumo: insumoMap["Café en grano"], cantidad: 0.018 },
          { insumo: insumoMap["Leche entera"], cantidad: 0.15 },
          { insumo: insumoMap["Cacao en polvo"], cantidad: 0.01 },
          { insumo: insumoMap["Azúcar refinada"], cantidad: 0.02 },
          { insumo: insumoMap["Agua filtrada"], cantidad: 0.03 }
        ]
      },
      {
        name: "Jugo de Naranja Exprimido",
        price: 14.00,
        category: categoryMap["Bebidas Frías"],
        type: "Bebida fría",
        insumosRequeridos: []
      }
    ];

    const createdDishes = await Dish.insertMany(dishesData);
    console.log(`Successfully seeded ${createdDishes.length} dishes (products).`);
    console.log("Database successfully seeded with premium menu data! ☕🎉");

  } catch (error) {
    console.error("Error during seeding process:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

seed();
