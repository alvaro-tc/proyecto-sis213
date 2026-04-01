# MARCO REFERENCIAL DEL SISTEMA TPS

## Introducción

Los Sistemas de Información Organizacional cumplen un rol fundamental en la actualidad, permitiendo a las empresas gestionar sus operaciones de manera eficiente y centralizada. En este contexto, la evolución de los sistemas de Procesamiento de Transacciones (TPS, por sus siglas en inglés) ha sido clave para la automatización de procesos operativos rutinarios, garantizando la consistencia y seguridad de la información.

La necesidad de automatización de procesos se hace evidente ante el crecimiento de las transacciones diarias en cualquier organización moderna, donde el registro manual desencadena errores humanos, pérdida de tiempo y falta de trazabilidad. El uso de sistemas web organizacionales centraliza esta gestión, permitiendo el acceso concurrente desde diferentes ubicaciones y dispositivos de forma segura.

_Ejemplo de enfoque:_
Este proyecto consiste en el desarrollo de un Sistema de Información Organizacional Web basado en la evolución del enfoque TPS, enfocado en un sistema de Punto de Venta (POS) para una cafetería. Este permitirá gestionar el flujo de pedidos, usuarios, catálogo de productos, asignación de mesas, cobros y reportes mediante una plataforma tecnológica accesible y segura.

## Antecedentes

### Antecedentes del objeto de estudio

Actualmente, muchas cafeterías a nivel local llevan a cabo sus procesos de manera 100% manual. Esta práctica genera inconsistencia en los datos financieros, problemas de comunicación entre la caja y el área de preparación, y cuellos de botella en las horas de mayor afluencia.

_Ejemplos de problemas existentes:_

- Registro manual de comandas en libretas de papel, lo que provoca errores, pérdidas o ilegibilidad.
- Falta de control granular de usuarios (no se puede identificar qué cajero procesó o anuló una orden).
- Cobro basado en cálculo mental o calculadoras simples, generando descuadres de caja.
- Nula trazabilidad de las transacciones diarias (no hay base de datos histórica).

### Referencias técnicas de otros sistemas TPS

En el contexto local de La Paz, Bolivia, existe una notable carencia de sistemas TPS especializados y accesibles para el rubro de las cafeterías, o en su defecto, hay un desconocimiento generalizado sobre soluciones de _software_ a medida. Por lo tanto, como Ingeniero de Requerimientos y Datos, el análisis de referencia se basa en el modelo transaccional "tradicional" o empírico que emplean actualmente la mayoría de las cafeterías en la ciudad sin un sistema digital centralizado:

1. **Sistema analógico de comandas y caja básica**
   - **Tipo de sistema:** TPS manual y físico.
   - **Funcionalidades principales:** El mesero anota el pedido y el número de mesa en una libreta de papel (comanda), el cual se entrega físicamente a la barra de preparación. El cobro se realiza calculando mentalmente o con una calculadora de escritorio, guardando el dinero en una caja registradora simple o gaveta de efectivo.
   - **Diferencia con el sistema propuesto:** Este método empírico carece de cualquier tipo de integridad de datos. Nuestro sistema de _software_ digitalizará la entrada de la orden y la asignación de mesas en tiempo real, eliminando errores de cálculo, previniendo la pérdida de comandas de papel y asegurando que cada producto despachado quede registrado inmutablemente en la base de datos para un arqueo de caja exacto.

2. **Registro diferido en hojas de cálculo (Excel)**
   - **Tipo de sistema:** TPS semiautomatizado y no concurrente.
   - **Funcionalidades principales:** Al final de la jornada, el administrador recolecta los apuntes manuales e intenta cuadrar los ingresos del día transcribiéndolos a una hoja de cálculo.
   - **Diferencia con el sistema propuesto:** Una hoja de cálculo no es una base de datos transaccional ni opera en tiempo real. El sistema web propuesto validará cada transacción en el momento exacto del cobro de la mesa, guardando relaciones seguras y automáticas entre el cajero en turno, los productos vendidos y la fecha exacta de emisión.

## Descripción del objeto de estudio

El proyecto se enmarca dentro de una cafetería que requiere controlar el flujo diario de sus operaciones de venta rápida. Los procesos organizacionales principales incluyen la toma de órdenes por mesa, el cobro exacto y la auditoría de ventas.

- **Actores del sistema:** Administradores y Cajeros (Operadores POS).
- **Flujo general del negocio:** Un cajero registra una orden en la interfaz asignándola a una mesa, cobra al cliente, y el sistema consolida la transacción inmutablemente en la base de datos.

## Identificación del Problema

La cafetería presenta dificultades en la gestión rápida de pedidos, control de usuarios operacionales, registro de pagos y generación de reportes financieros debido a la ausencia de un motor de base de datos automatizado y centralizado. Esto incrementa los tiempos de espera del cliente, dificulta los arqueos de caja al final del turno y aumenta exponencialmente los márgenes de error operativo por sumas manuales.

## Formulación del Problema

¿Cómo desarrollar un Sistema de Información Organizacional Web (POS) basado en el enfoque TPS para una cafetería, que permita gestionar pedidos, mesas, usuarios, transacciones y reportes de manera eficiente y criptográficamente segura?

## Objetivos

### Objetivo General

Desarrollar un Sistema Web de Punto de Venta (POS) para cafeterías, basado en la arquitectura MERN (MongoDB, Express.js, React.js, Node.js), que permita optimizar la gestión integral de pedidos, la administración visual de mesas y la facturación automatizada, reduciendo los errores operativos y mejorando la experiencia del cliente en establecimientos gastronómicos medianos de la ciudad de La Paz.

### Objetivos Específicos

- Implementar un módulo de gestión de pedidos en tiempo real que permita a los meseros registrar, modificar y hacer seguimiento del estado de las órdenes (en preparación, servido, pagado) mediante una interfaz táctil dinámica construida con React.js.

- Diseñar e integrar un sistema de control de acceso basado en roles (RBAC) con autenticación segura mediante JSON Web Tokens (JWT), diferenciando los permisos y vistas del Administrador, el Cajero y el Mesero.

- Desarrollar un módulo de administración visual de mesas y reservas que presente un panel de estados en tiempo real, permitiendo a los operadores conocer la disponibilidad y el estado de cada mesa del establecimiento.

- Construir las APIs RESTful del _backend_ con Node.js y Express.js, conectadas a una base de datos MongoDB, para soportar todas las operaciones CRUD de los módulos de productos, órdenes, mesas y usuarios.

- Implementar un módulo de facturación y generación de recibos que automatice el cálculo del cobro total y produzca comprobantes detallados en formato PDF, integrando métodos de pago simulados mediante una pasarela estándar.

- Desplegar el sistema en infraestructura _cloud_ (AWS o DigitalOcean) utilizando contenedores Docker para garantizar la portabilidad, disponibilidad y escalabilidad del entorno productivo.

## Justificación

### Justificación Técnica

Desde el rol de ingeniería de requerimientos y datos, la implementación de este sistema en una cafetería que opera de forma 100% manual (con libretas de papel y sin ningún tipo de _software_) se justifica por la necesidad urgente de establecer un núcleo de persistencia de datos robusto y seguro. Se diseñará una base de datos estructurada (adoptando el paradigma de la pila MERN, como MongoDB) que reemplace la vulnerabilidad de los cuadernos físicos. Esto garantiza la integridad referencial de la información, conectando de forma exacta el catálogo de productos con el carrito de ventas, el número de mesa y el usuario que procesa el cobro. El _backend_ (Node.js/Express) manejará de forma atómica cada transacción, mientras que la seguridad se blindará mediante encriptación de contraseñas y autenticación por _tokens_ (JWT), asegurando la protección de los datos financieros ante cualquier interrupción o alta concurrencia.

### Justificación Organizacional

Actualmente, el uso exclusivo de comandas escritas a mano y la comunicación verbal generan un caos organizativo constante: los meseros equivocan las mesas, los pedidos se pierden o resultan ilegibles para el área de preparación, y no hay control sobre quién realiza qué cobro. La implementación de este TPS estandarizará el flujo operativo. A nivel de requerimientos, el sistema forzará jerarquías claras de acceso (Administrador y Cajero) y digitalizará la selección de productos y la asignación específica de las mesas. Esto elimina de raíz la asimetría de información, asegurando que el estado de cada orden, desde que se toma el pedido en la mesa hasta que se imprime el ticket final, sea transparente y rastreable en tiempo real para todo el personal autorizado.

### Justificación Económica

La dependencia del cálculo mental y de anotaciones manuales para cobrar a los clientes y realizar el arqueo de caja es altamente susceptible al error humano. Estas fallas diarias se traducen en cobros incompletos, descuadres de caja y una pérdida monetaria silenciosa y constante para la cafetería. Al transicionar a un motor transaccional de Punto de Venta (POS) centralizado —que calcula automáticamente los subtotales, impuestos y totales finales antes de generar la factura— se erradican las fugas de capital por malas sumas. Además, la centralización de los datos permitirá a la gerencia consultar reportes históricos exactos (como los productos más vendidos), facilitando una toma de decisiones inteligente y la optimización del presupuesto para la compra de insumos.

## Límites y Alcances

### Límites

El sistema:

- Será exclusivamente web (no incluirá aplicaciones móviles nativas).
- Usará una base de datos NoSQL orientada a documentos enfocada en transacciones rápidas.
- Tendrá un sistema cerrado de autenticación de usuarios locales (no integrará inicios de sesión sociales).
- No incluirá integración directa a pasarelas de pago bancarias físicas en su primera versión (los pagos se registrarán de forma lógica).

### Alcances

El sistema permitirá:

- Gestionar el catálogo interactivo de la cafetería (categorías, productos, precios).
- Gestionar usuarios, asignar roles y administrar permisos granulares mediante _middlewares_.
- Registrar transacciones en el POS vinculando carritos de compra a mesas específicas.
- Generar reportes tabulares y calcular cortes de caja.

## Metodología del Proyecto

### Tipo de estudio

Por su naturaleza, la investigación será de tipo **Aplicado** (orientado a la solución de un problema concreto identificado en cafeterías de La Paz), **Tecnológico** (mediante el diseño e implementación de una plataforma _software_) y **Descriptivo** (para modelar el escenario y el comportamiento actual de los procesos manuales del negocio).

El enfoque es **mixto**: cuantitativo en la medición del esfuerzo mediante la técnica de Puntos de Función COSMIC y la estimación presupuestaria; y cualitativo en el levantamiento de requerimientos con los actores del negocio a través de entrevistas y observación directa.

### Metodología de desarrollo

Se aplicará la metodología ágil **_Scrum_**, que se adapta idealmente al desarrollo de _software_ iterativo e incremental:

- **_Sprints_** (Iteraciones): Ciclos de trabajo de 2 semanas de duración.
- **_Product Backlog_** (Pila de producto): Lista priorizada de todos los requerimientos y módulos del sistema.
- **_Sprint Backlog_** (Pila del ciclo): Tareas seleccionadas para ser desarrolladas en el _Sprint_ actual.
- **Entregables:** Incrementos funcionales al final de cada iteración, demostrando valor medible.

### Técnicas

- **Entrevistas:** Al personal clave de la cafetería para levantar requerimientos operativos y de negocio.
- **Observación directa:** De los procesos manuales actuales en el sitio (toma de comandas, cobro, asignación de mesas).
- **Modelado de Datos:** Estructuración de colecciones JSON y flujos de API REST.
- **Modelado UML:** Para representar gráficamente el diseño de la solución (casos de uso, diagramas de clase, secuencia y despliegue).
- **Puntos de Función COSMIC:** Para la medición objetiva del tamaño funcional del _software_ y su estimación de costos.

## Análisis preliminar del sistema TPS

Como Ingeniero de Requerimientos y Datos, el análisis preliminar dictamina que la transición de una cafetería puramente manual a un entorno digital requiere modelar transacciones rápidas y precisas, integrando la gestión física del local (mesas). Se han especificado los siguientes requerimientos de persistencia y flujo:

- **Detalle de Usuarios (Actores y Control de Acceso):**
  - **Administrador:** Actor con privilegios absolutos (_Full CRUD_). Su rol a nivel de datos implica alimentar las entidades maestras del sistema: gestión del catálogo de ítems de la cafetería (nombres, precios, imágenes, categorías como 'Cafés', 'Postres'), control de inventario base y la creación o inhabilitación de cuentas para el personal operativo.
  - **Cajero / Operador POS:** Actor confinado a la interfaz de Punto de Venta. Su interacción con la base de datos es de lectura sobre el menú y de escritura intensiva sobre las colecciones/tablas de ventas, sin permisos para alterar precios históricos o borrar registros contables.
- **Detalle de Transacciones (El Flujo de la Orden y Mesas):**
  - **Transacción POS y Asignación:** Reemplazando por completo la libreta de papel, el nuevo flujo demanda que el cajero construya la orden mediante un panel interactivo con categorías. El modelo de datos requerirá que, antes de proceder al cobro, la colección del carrito de compras (compuesta por los ítems seleccionados y sus cantidades) sea vinculada obligatoriamente al nombre del cliente y al **número de mesa**.
  - **Facturación y Cierre:** Una vez que se confirma el método de pago, el _backend_ debe procesar matemáticamente el subtotal, aplicar los impuestos correspondientes y sellar la transacción con la fecha exacta. El registro resultante en la base de datos se vuelve inmutable y dispara en el _frontend_ la opción de generar e imprimir la factura o ticket (_Bill/Receipt_), dando por finalizado el servicio para esa mesa.

## Propuesta de solución

- **Sistema:** Sistema de Punto de Venta (POS) Web enfocado en TPS.
- **Arquitectura:** Patrón Cliente — Servidor con separación de responsabilidades API REST y arquitectura de tres capas (presentación, lógica de negocio y datos) siguiendo el patrón MVC (Modelo-Vista-Controlador).

**Tecnologías seleccionadas (Pila MERN):**

| Capa                     | Tecnología              | Justificación                                                                                                          |
| :----------------------- | :---------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **Frontend**             | React.js 18             | Biblioteca declarativa con re-renderizado eficiente (Virtual DOM), ideal para interfaces POS reactivas en tiempo real. |
| **Estilos**              | Tailwind CSS            | Framework _utility-first_ que agiliza el diseño de interfaces responsivas y táctiles.                                  |
| **Estado global**        | Redux Toolkit           | Manejo centralizado del estado (carrito de pedidos, sesión de usuario, estado de mesas).                               |
| **_Backend_**            | Node.js + Express.js    | Entorno no bloqueante basado en eventos, eficiente para múltiples peticiones concurrentes.                             |
| **Base de datos**        | MongoDB + Mongoose      | Base de datos NoSQL documental, flexible para catálogos dinámicos y estructuras de órdenes variables.                  |
| **Autenticación**        | JWT                     | Autenticación _stateless_ y segura, compatible con arquitecturas RESTful y control de roles por _middleware_.          |
| **Facturación**          | PDFKit / jsPDF          | Generación programática de recibos y facturas en PDF desde el servidor Node.js.                                        |
| **Contenedores**         | Docker + Docker Compose | Estandarización del entorno de ejecución entre máquinas del equipo.                                                    |
| **Despliegue**           | AWS EC2 / DigitalOcean  | Infraestructura _cloud_ confiable con alta disponibilidad y escalado bajo demanda.                                     |
| **Control de versiones** | Git + GitHub            | Gestión del código fuente con ramas por _feature_, facilitando el trabajo paralelo del equipo.                         |

A continuación se presenta el diagrama de la arquitectura propuesta:

\begin{diagrama}[H]
\centering
\includegraphics[width=0.85\linewidth]{assets/diagrama/arquitectura_mern.png}
\caption{Diagrama de Arquitectura MERN de tres capas del Sistema POS}
\label{diag:arquitectura_mern}
\end{diagrama}

## Cronograma

El proyecto tiene una duración total de **4 meses (16 semanas)**, organizado en 8 _Sprints_ de 2 semanas cada uno bajo el marco Scrum.

|    Sprint    | Semanas | Fase                     | Actividades principales                                                                                                                                           | Entregable                                                 |
| :----------: | :-----: | :----------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------- |
| **Sprint 0** |   1–2   | Inicio y Diseño          | Levantamiento de requerimientos, diseño de _wireframes_ UI/UX, modelado de base de datos, configuración del repositorio GitHub y entorno Docker.                  | _Product Backlog_, diseño de BD, _wireframes_ aprobados.   |
| **Sprint 1** |   3–4   | _Backend_ – Fundamentos  | Configuración de Express.js, conexión MongoDB con Mongoose, modelos de datos (User, Product, Table, Order), sistema de autenticación JWT y _middleware_ de roles. | API de autenticación funcional (registro, _login_, roles). |
| **Sprint 2** |   5–6   | _Backend_ – Módulos Core | APIs RESTful para gestión de productos del menú (CRUD), gestión de mesas (CRUD + estados) y gestión de órdenes (crear, actualizar estado).                        | _Endpoints_ de Products, Tables y Orders documentados.     |
| **Sprint 3** |   7–8   | _Frontend_ – Base y Auth | Configuración de React.js + Redux Toolkit + React Router, pantallas de _Login_, _layout_ principal y conexión con el API de autenticación.                        | _Frontend_ base funcional con _login_ y roles.             |
| **Sprint 4** |  9–10   | _Frontend_ – POS         | Módulo POS táctil: selección de categorías, productos, cantidad y adición al carrito de órdenes; envío de pedidos al _backend_.                                   | Interfaz POS funcional conectada al _backend_.             |
| **Sprint 5** |  11–12  | Mesas y Dashboard        | Panel visual de estados de mesas, módulo de administración de menú (alta/baja de productos), vista de órdenes activas para cocina.                                | Gestión de mesas e interfaz de cocina operativa.           |
| **Sprint 6** |  13–14  | Facturación y Pagos      | Módulo de generación de facturas en PDF, cálculo automático de totales, integración de métodos de pago simulados, historial de ventas.                            | Facturación y cierre de órdenes completo.                  |
| **Sprint 7** |  15–16  | Cierre: QA y Despliegue  | Pruebas funcionales e integración (QA), corrección de _bugs_, despliegue en AWS/DigitalOcean con Docker, documentación técnica final y capacitación al usuario.   | Sistema desplegado en producción y manual de usuario.      |

---

# MARCO TEÓRICO DEL SISTEMA TPS

## Sistemas de Información Organizacional

### Definición

Un sistema de información organizacional es un conjunto de componentes interrelacionados que recolectan, procesan, almacenan y distribuyen información para apoyar la toma de decisiones, el control y la coordinación dentro de una entidad.

### Componentes y Tipos

Involucran equipo (_hardware_), programas (_software_), bases de datos, redes, procedimientos y recursos humanos. Existen diferentes tipos, como los Sistemas de Soporte a Decisiones (DSS), de Información Gerencial (MIS) y los Sistemas de Procesamiento de Transacciones (TPS).

## Sistema de Procesamiento de Transacciones (TPS)

El TPS es la columna vertebral de cualquier sistema organizacional que recolecta y procesa las transacciones generadas en el día a día.

- **Características principales:** Procesamiento rápido, alta confiabilidad, capacidad para manejar gran volumen de datos de forma estandarizada y estricta integridad en cada transacción (especialmente en Puntos de Venta).
- **Funciones:** Captura de datos de origen (carrito de compras), verificación matemática, procesamiento inmediato, actualización de bases de datos maestras y emisión de comprobantes/tickets.
- **Evolución hacia sistemas web:** Han pasado de terminales cerradas monolíticas a integrarse mediante la web, lo cual otorga ubicuidad y permite operaciones distribuidas.

## Arquitectura de sistemas web

- **Cliente (_Frontend_):** La interfaz que interactúa con el usuario final a través de un navegador web, responsable de la presentación de la información (Ej. Pantalla POS de React).
- **Servidor (_Backend_):** La computadora central o contenedor de la nube que procesa la lógica de negocios, gestionando la concurrencia y los cálculos matemáticos.
- **API (_Application Programming Interface_):** El puente de comunicación documentado entre el Cliente y el Servidor (vía JSON).
- **Base de datos:** Repositorio central donde reposa la persistencia de las entidades.

## Seguridad en sistemas de información

Como modelador y encargado de la seguridad arquitectónica, se establece que un sistema de ventas (POS) debe proteger de forma absoluta sus _endpoints_ (rutas de API) y la persistencia de datos.

- **Autenticación mediante JWT:** Se descartan las sesiones tradicionales. El sistema implementa JSON Web Tokens (JWT). Tras validar credenciales (contraseñas previamente procesadas con funciones criptográficas unidireccionales de _hash_, como _bcrypt_), el _backend_ emite un token firmado. Este token viaja en las cabeceras HTTP de cada petición del cliente, garantizando que el usuario es quien dice ser sin consultar la base de datos reiteradamente.
- **Roles y Autorización:** El modelo de datos incluye una propiedad rígida de "Rol" (ej. Administrador, Cajero). La autorización se ejecuta mediante _Middlewares_ (bloques de código intermedios en el _backend_) que desencriptan el _payload_ del token y rechazan con un error 403 (Prohibido) cualquier intento de un Cajero de acceder a las rutas de eliminación de usuarios o reportes gerenciales.
- **Control de acceso:** Tanto a nivel de la interfaz (ocultando botones de configuración a cajeros) como a nivel de capa de datos, se aplican políticas estrictas para evitar inyecciones maliciosas o robo de sesiones, blindando el flujo desde que se presiona "Cobrar" hasta que la información reposa en el disco.

## Base de datos

El diseño de la persistencia de datos constituye el corazón del sistema, siendo responsabilidad directa de la ingeniería de datos modelar la información de la cafetería para que sea escalable, rápida y matemáticamente exacta. Basado en la arquitectura MERN (MongoDB, Express, React, Node.js), se adopta un enfoque orientado a documentos que optimiza la velocidad transaccional en el Punto de Venta:

- **Modelo Documental (NoSQL) y Referencias Lógicas:** Al utilizar MongoDB, la base de datos abandona las tablas rígidas en favor de colecciones de documentos JSON (BSON). Sin embargo, los principios lógicos de integridad se mantienen ineludibles mediante el uso de esquemas de validación estrictos (como _Mongoose_). Las colecciones maestras se identifican y separan claramente: `Usuarios` (Personal operativo), `Categorías` (Clasificación del menú), `Productos` (Ítems de venta), `Mesas` (Gestión del espacio físico) y `Facturas/Órdenes` (_Bills_ - Registro de la transacción). Se definen referencias explícitas (a través de _ObjectIds_) entre ellas para establecer la cardinalidad (ej. una Orden está vinculada unívocamente a un Cajero y asignada a una Mesa específica).
- **Desnormalización Controlada y Estructura del Carrito:** A diferencia de un modelo relacional tradicional, MongoDB aprovecha la desnormalización para mejorar el rendimiento de lectura. Por requerimientos de diseño de un POS, se realiza una desnormalización controlada en las `Órdenes`: al registrar una venta, no solo se guarda la referencia del producto, sino que se incrusta el arreglo completo del carrito (`cartItems`). El nombre de la bebida, sus modificadores (ej. tamaño, adiciones) y su **precio exacto en ese instante** se copian dentro del documento de la orden. Esto garantiza que la información histórica sea inmutable frente a futuros cambios de costos en el catálogo.
- **Transacciones Multi-documento y Aislamiento (ACID):** En el entorno TPS, una transacción es indivisible. Registrar una venta en la cafetería implica una cadena de eventos: calcular totales, insertar el documento de la factura, asociar el método de pago y actualizar el estado de disponibilidad de la `Mesa`. El motor de MongoDB se configura utilizando _Sesiones de Transacción_ para garantizar las propiedades ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad) a través de múltiples colecciones. Esto asegura que si ocurre un fallo de red o desconexión a la mitad del proceso de cobro, la base de datos ejecute un _Rollback_ (reversión completa), previniendo que existan "ventas a medias" o corrupciones en los arqueos de caja.

## Metodología de desarrollo

**_Scrum_**
Es un marco de trabajo ágil para el desarrollo, entrega y mantenimiento de productos complejos, definido en la **_Scrum Guide_** (Schwaber & Sutherland). Se fundamenta en tres pilares empíricos: **transparencia** (todos los aspectos del proceso son visibles para los responsables), **inspección** (los artefactos y el progreso son revisados frecuentemente) y **adaptación** (el proceso se ajusta cuando se detectan desviaciones). Para el Sistema POS de Cafetería, Scrum es la elección metodológica óptima porque el cliente puede proporcionar retroalimentación rápida sobre cada incremento funcional, y los requerimientos pueden evolucionar durante el desarrollo.

### Roles

**Product Owner — Torrez Calle Álvaro Ariel**

El _Product Owner_ es el responsable de maximizar el valor del producto. Sus funciones concretas en este proyecto son: definir, ordenar y mantener el _Product Backlog_ (lista priorizada de funcionalidades); ser el punto de contacto único con el cliente (la cafetería); aceptar o rechazar los incrementos al final de cada _Sprint_; y garantizar que el equipo de desarrollo comprenda los ítems del _backlog_ al nivel necesario.

**Scrum Master — Maldonado Carvajal Alan Ariel**

El _Scrum Master_ es el responsable de que el equipo comprenda y aplique correctamente Scrum. Sus funciones son: facilitar las ceremonias (_Planning_, _Daily_, _Review_, _Retrospective_); eliminar impedimentos que bloqueen al equipo de desarrollo; proteger al equipo de interrupciones externas durante el _Sprint_; y ayudar al _Product Owner_ a mantener un _backlog_ ordenado y comprensible.

**Equipo de Desarrollo — Claros Suntura Juan José y Lecoña Condori Elías Milán**

El Equipo de Desarrollo es autoorganizado y multifuncional. Es responsable de convertir los ítems del _Product Backlog_ seleccionados en un incremento potencialmente entregable al final de cada _Sprint_. Sus funciones incluyen estimar el esfuerzo de las historias de usuario, codificar el _frontend_ y _backend_, y ejecutar pruebas de integración.

### Artefactos

**_Product Backlog_** (Pila de producto): Lista única, ordenada y emergente de todo lo que se necesita en el producto, gestionada exclusivamente por el _Product Owner_. A continuación se presentan los ítems iniciales:

|  ID   | Historia de Usuario                                                                                        | Prioridad | Puntos |
| :---: | :--------------------------------------------------------------------------------------------------------- | :-------: | :----: |
| US-01 | _Como_ mesero, _quiero_ iniciar sesión con mis credenciales _para_ acceder solo a las funciones de mi rol. |   Alta    |   3    |
| US-02 | _Como_ cajero, _quiero_ ver el panel de mesas y su estado actual _para_ saber cuáles están ocupadas.       |   Alta    |   5    |
| US-03 | _Como_ mesero, _quiero_ agregar productos al pedido de una mesa desde la interfaz POS táctil.              |   Alta    |   8    |
| US-04 | _Como_ administrador, _quiero_ registrar y editar los productos del menú con sus precios.                  |   Alta    |   5    |
| US-05 | _Como_ cajero, _quiero_ generar e imprimir la factura de una orden cerrada en PDF.                         |   Media   |   8    |
| US-06 | _Como_ administrador, _quiero_ ver el historial de ventas del día con totales por método de pago.          |   Media   |   5    |

**_Sprint Backlog_** (Pila del ciclo): Conjunto de ítems del _Product Backlog_ seleccionados para el _Sprint_ actual, más el plan del equipo para entregar el Incremento y lograr el _Sprint Goal_. Es propiedad del Equipo de Desarrollo y se actualiza diariamente mediante un tablero Kanban con columnas: **Por hacer → En progreso → En revisión → Hecho**.

**Incremento del Producto:** Suma de todos los ítems completados durante el _Sprint_ más el valor de los _Sprints_ anteriores. Debe cumplir la **Definición de Hecho (DoD)** acordada por el equipo, la cual establece que un ítem está "hecho" cuando el código está _commiteado_ en la rama correspondiente de GitHub, las pruebas funcionales han pasado, el código ha sido revisado por al menos otro miembro del equipo (_code review_) y la funcionalidad ha sido demostrada al _Product Owner_.

### Eventos

**_Sprint Planning_ (Planificación del _Sprint_):** Se realiza al inicio de cada _Sprint_ (duración máxima: 4 horas). El equipo completo responde dos preguntas: ¿qué se puede entregar en este _Sprint_? (selección del _Sprint Backlog_) y ¿cómo se logrará ese trabajo? (descomposición en tareas técnicas). Al final se define el **_Sprint Goal_**: el objetivo en una frase que da coherencia a los ítems seleccionados.

**_Daily Scrum_ (Scrum Diario):** Reunión de 15 minutos, todos los días, para el Equipo de Desarrollo. Cada integrante responde: ¿qué hice ayer que ayudó al _Sprint Goal_? ¿Qué haré hoy? ¿Hay algún impedimento? El _Scrum Master_ facilita y anota los impedimentos para resolverlos de inmediato.

**_Sprint Review_ (Revisión del _Sprint_):** Se realiza al final del _Sprint_ (duración máxima: 2 horas). El Equipo de Desarrollo demuestra el Incremento funcionando al _Product Owner_ y _stakeholders_. Se actualiza el _Product Backlog_ en función de la retroalimentación recibida.

**_Sprint Retrospective_ (Retrospectiva del _Sprint_):** Se realiza después de la _Sprint Review_ (duración máxima: 1.5 horas). El equipo reflexiona sobre el proceso: ¿qué salió bien? ¿qué se puede mejorar? ¿qué acciones concretas tomamos en el próximo _Sprint_? El resultado es un plan de mejora que se incorpora al siguiente _Sprint Backlog_.

---

# MARCO PRÁCTICO — DESARROLLO DEL SISTEMA TPS

## Análisis del sistema

En base a la recopilación de datos, la estructura organizacional del sistema de la cafetería identifica actores con responsabilidades asimétricas: Administradores, enfocados en la gobernanza del catálogo y métricas; y Cajeros, cuyo objetivo es el alto rendimiento en el registro y cobro de pedidos. El flujo exige digitalizar cada interacción, desde la selección del producto táctil hasta su asignación a la mesa y el cobro final.

![Ejemplo de prueba en el análisis del sistema](assets/images/ejemplo.png){#fig:ejemplo_analisis width=65%}

## Determinación de requerimientos

### Requerimientos funcionales

Los requerimientos funcionales expresan lo que el sistema **debe hacer** operativamente.

- **RF01:** El sistema permitirá autenticar de forma segura a cajeros y administradores.
- **RF02:** El sistema proporcionará una interfaz de POS para la selección ágil de productos del menú por categoría.
- **RF03:** El sistema permitirá asignar obligatoriamente un número de "Mesa" a cada carrito de compra.
- **RF04:** El sistema calculará automáticamente subtotales, impuestos y totales conforme se añaden o restan productos.
- **RF05:** El sistema permitirá a los administradores gestionar colecciones maestras (Productos, Categorías, Usuarios).
- **RF06:** El sistema generará e imprimirá comprobantes (tickets) al concretar el cobro.

### Requerimientos no funcionales

Establecen las restricciones y la forma en cómo debe operar y comportarse estructuralmente la aplicación.

- **Seguridad:** Encriptación de contraseñas usando algoritmos seguros (_bcrypt_) y protección de rutas con JWT.
- **Rendimiento:** Tiempos de procesamiento del carrito y confirmación de pago menores a 1 segundo para no detener la fila.
- **Usabilidad:** Interfaz basada en principios POS: botones amplios e interacciones con mínimos clics.
- **Escalabilidad:** Separación modular estricta entre _Frontend_ (React) y _Backend_ (Node.js).

## Modelado del sistema

### Historias de Usuario

Se definen detallando la necesidad y la regla de aceptación comercial:

- _Como_ administrador de la cafetería, _quiero_ gestionar los productos y sus precios _para_ mantener el menú actualizado.
- _Como_ cajero en turno, _quiero_ agregar bebidas al ticket y asignarlo a una mesa mediante la pantalla _para_ atender ágilmente a los clientes y evitar confusiones en sala.

### Diagramas UML

A continuación se muestra un ejemplo genérico de la estructura de un diagrama, en este caso, se deben incrustar aquí los diagramas correspondientes: Diagramas de Casos de Uso, Clases/Esquemas NoSQL, y Actividades.

\begin{diagrama}[H]
\centering
\includegraphics[width=0.65\linewidth]{assets/diagrama/diagrama.png}
\caption{Ejemplo general de Diagrama Estructural UML}
\label{diag:ejemplo_diagrama}
\end{diagrama}

## Diseño del sistema

### Arquitectura del sistema

**Modelo: Arquitectura Web Cliente-Servidor (Pila MERN)**
El sistema se dividirá lógicamente en una aplicación cliente _Single Page Application_ (React) interactuando asíncronamente con un servidor _backend_ (Node.js/Express) que expondrá puntos de enlace (_endpoints_) REST y conectará con el motor de base de datos.

## Diseño de la Base de Datos

Se diseña bajo el paradigma documental (NoSQL) garantizando el aislamiento financiero. Las restricciones en el esquema aseguran que una "Orden" sea indivisible e incorpore el carrito completo para inmutabilidad histórica.

| Campo (Documento JSON) | Tipo       | Validaciones / Vínculos | Descripción                                                                                    |
| :--------------------- | :--------- | :---------------------- | :--------------------------------------------------------------------------------------------- |
| `_id`                  | ObjectId   | Único (PK lógica)       | Identificador nativo de MongoDB para la factura.                                               |
| `usuario_id`           | ObjectId   | Ref: 'Usuario'          | ID del cajero responsable de cobrar la orden.                                                  |
| `mesa_asignada`        | String/Int | Requerido               | Mesa física vinculada al pedido.                                                               |
| `cartItems`            | Array      | Contiene Objetos        | Arreglo desnormalizado con los productos, cantidades y precios exactos en el momento de venta. |
| `total_pagado`         | Number     | Mínimo 0                | Monto económico final calculado y liquidado.                                                   |

## IMPLEMENTACIÓN DE LOS MÓDULOS DEL SISTEMA

### Módulo de Catálogo, Menú y Mesas

Módulo fundamental para configurar el entorno de la cafetería.

- **Gestión de colecciones:** Interfaces CRUD para ingresar categorías, ítems del menú con sus precios, y la estructura de las mesas del local.
- **Estados de visualización:** Activación y desactivación de productos agotados sin borrarlos de la base de datos.

### Módulo de Usuarios y Roles

La barrera de seguridad criptográfica del sistema TPS.

- **Filtro Criptográfico:** Validaciones de contraseña cruzadas con _bcrypt_ en el inicio de sesión.
- **Control de acceso (RBAC):** El _frontend_ renderizará la "Terminal POS" para los cajeros y bloqueará las pestañas de "Administración", regla que es respaldada por los _middlewares_ de validación de _tokens_ JWT en el servidor.

### Módulo de Transacciones (El Punto de Venta)

Núcleo central del objeto TPS, diseñado para alta velocidad operativa.

- **Interfaz de Venta:** Pantalla con cuadrícula de productos a la izquierda y el carrito reactivo a la derecha.
- **Motor Matemático:** Sumatorias dinámicas (Redux) inyectables a la API para certificar la venta atómica.
- **Cobro y Cierre:** Ventana modal que captura el método de pago, asigna la mesa, y consolida irrevocablemente el documento JSON en MongoDB, disparando la generación del ticket.

### Módulo de Reportes

Módulo analítico que destila la información transaccional operativa del local.

- Extracción de ingresos consolidados mediante consultas de agregación (_Aggregations_) en MongoDB.
- Filtros por usuario y fechas para realizar el cierre y arqueo de caja exacto al final del turno.

## Capa Backend Funcional

El _backend_ es el cerebro transaccional aislado de la interfaz gráfica, diseñado bajo principios REST:

- **Controladores (_Controllers_):** Capturan las peticiones HTTP (req, res).
- **Modelos/Esquemas (_Mongoose Models_):** Representación estricta de la estructura de los documentos en la base de datos (Ej. `BillSchema`, `ItemSchema`).
- **Capa de Seguridad (_Middlewares_):** Componentes (como `verifyToken`) que inspeccionan las cabeceras HTTP antes de conceder cualquier inserción a la base de datos.
- **Lógica Transaccional:** Uso de sesiones para asegurar que el guardado de la factura y la limpieza de la mesa se ejecuten como una transacción ACID única.

## Validación y pruebas del sistema

El sistema asegura la calidad del producto final a través de distintas evaluaciones:

- **Pruebas de Estrés Unitarias:** Validar que el servidor sume grandes carritos de compra sin errores de formato decimal.
- **Pruebas funcionales de reversión:** Simular el error de la red justo en el momento de procesar un pago para verificar que la transacción se deshaga (_Rollback_) correctamente.
- **Pruebas de aceptación:** Pruebas finales en la caja registradora física para certificar la fluidez del _software_.

## Desarrollo del prototipo funcional

A lo largo de los _sprints_ se generan prototipos incrementales exponiendo sus interfaces interactivas reflejando el caso de éxito: desde el _login_ del cajero, armado de la orden, selección de mesa, hasta el cobro. _(Incluir evidencias y capturas de pantalla reales aquí)_.

## Documentación de Ingeniería Completa

Se acompañan los anexos técnicos:

- **Documentación funcional:** Relevamiento documentado de requerimientos e historias de usuario de la cafetería.
- **Documentación técnica:** Modelo arquitectónico, diseño de esquemas BSON (Colecciones) y documentación de _endpoints_ (API REST).
- **Documentación del sistema:** Manual de usuario, variables de entorno y directrices de despliegue.

---

# CONCLUSIONES Y RECOMENDACIONES

## Conclusiones

- Tras el proceso de desarrollo, se implementó satisfactoriamente el Sistema de Punto de Venta (POS) Web basado en el enfoque TPS para la cafetería, abordando con éxito el reemplazo de comandas manuales por un entorno digital unificado.
- La adopción de la pila MERN (MongoDB, Express, React, Node.js) y el diseño de persistencia orientada a documentos demostraron ser ideales para optimizar la velocidad de escritura del carrito de compras y garantizar la inmutabilidad de los reportes históricos.
- La seguridad del sistema fue robustecida a través del esquema de autenticación JWT y encriptación de credenciales, consolidando un TPS que erradica los descuadres de caja y facilita la gestión de mesas y auditorías administrativas.

## Recomendaciones

- **Mejoras futuras y Escalabilidad:** Es recomendable planificar la ampliación del módulo transaccional para descontar automáticamente ingredientes de un inventario maestro (ej. gramos de café, litros de leche) cada vez que se cobre un producto.
- **Seguridad y Mantenimiento:** Monitorear activamente los registros del servidor, rotar periódicamente la clave secreta de firmado de los _tokens_ JWT y actualizar las dependencias de Node.js para prevenir vulnerabilidades.
- **Migración a la Nube:** Aprovechando la naturaleza NoSQL de MongoDB, se recomienda a futuro desplegar la base de datos en clústeres administrados (como MongoDB Atlas) para asegurar redundancia, _backups_ automáticos y la posibilidad de conectar múltiples sucursales de la cafetería.
