# Sistema POS para Cafetería - Grupo 5 ☕

Este es el proyecto final del **Grupo 5** para la materia de **Ingeniería de Software** de la **Universidad Católica Boliviana (UCB)**. 

Se trata de un sistema de Punto de Venta (POS - Point of Sale) diseñado específicamente para la gestión de una **cafetería**. El proyecto está dividido en dos partes principales: un backend desarrollado con Node.js y Express, y un frontend moderno desarrollado con React y Vite.

---


## Configuración e Instalación del Backend

El backend es una API RESTful construida con **Node.js, Express y Mongoose**.

1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd pos-backend
   ```

2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Configura las variables de entorno. Crea un archivo `.env` en la raíz de `pos-backend` basado en tus configuraciones locales (puerto, URI de MongoDB, secreto de JWT, etc.).

4. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```


---

## Configuración e Instalación del Frontend

El frontend es una aplicación web interactiva desarrollada con **React, Vite, Tailwind CSS, Redux Toolkit y React Query**.

1. Abre una nueva terminal y navega a la carpeta del frontend:
   ```bash
   cd pos-frontend
   ```

2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre tu navegador y accede a la URL local que muestra la consola (generalmente `http://localhost:5173`).

---

## Tecnologías Utilizadas

### Backend (`pos-backend`):
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & bcrypt para autenticación
- Zod para validación de datos

### Frontend (`pos-frontend`):
- React 18 & Vite
- Tailwind CSS & Radix UI para los componentes visuales
- Redux Toolkit & React Query para el manejo del estado y peticiones
- React Router DOM para la navegación
- Framer Motion para animaciones

---

**© 2026 Universidad Católica Boliviana** - Proyecto de Ingeniería de Software (Grupo 5)
