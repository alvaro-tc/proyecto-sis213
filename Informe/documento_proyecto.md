# MARCO REFERENCIAL DEL SISTEMA TPS

## Introducción

En el contexto actual de la transformación digital, las organizaciones de todo tamaño enfrentan la necesidad imperiosa de modernizar sus procesos operativos. Los Sistemas de Información Organizacional (SIO) han emergido como la respuesta tecnológica a esta necesidad, permitiendo a las empresas capturar, procesar y distribuir información de manera eficiente, precisa y centralizada. Dentro de esta categoría, los Sistemas de Procesamiento de Transacciones (TPS, por sus siglas en inglés — _Transaction Processing Systems_) representan el eslabón más fundamental: son la capa operativa que registra y procesa cada evento del negocio en tiempo real, constituyendo la base sobre la que se construyen todos los demás niveles de información organizacional.

La evolución histórica de los TPS es un reflejo directo del avance tecnológico. En sus orígenes, durante las décadas de 1960 y 1970, estos sistemas operaban en mainframes centralizados con procesamiento por lotes (_batch processing_), donde las transacciones se acumulaban y procesaban en diferido. Con la llegada de las redes de computadoras y, posteriormente, de Internet, los TPS evolucionaron hacia arquitecturas distribuidas de procesamiento en línea (_OLTP — Online Transaction Processing_), capaces de manejar miles de transacciones concurrentes con tiempos de respuesta de milisegundos. Hoy en día, la adopción de arquitecturas web modernas basadas en _stacks_ como MERN (MongoDB, Express.js, React.js, Node.js) ha democratizado la implementación de TPS robustos, haciéndolos accesibles incluso para pequeñas y medianas empresas que anteriormente no podían costear soluciones de este tipo.

En este marco, el presente proyecto propone el desarrollo de un Sistema de Información Organizacional Web basado en el enfoque TPS, orientado específicamente a la gestión integral de una cafetería en la ciudad de La Paz, Bolivia. El sistema, concebido como un Punto de Venta (_Point of Sale_ — POS) web, tiene por objetivo digitalizar y centralizar los procesos críticos del negocio: la toma y seguimiento de órdenes por mesa, la administración del catálogo de productos, el control de acceso diferenciado por roles de usuario, el procesamiento de cobros y la generación automatizada de reportes financieros. La solución busca reemplazar los procesos manuales actualmente vigentes — basados en libretas de papel, cálculos mentales y ausencia total de trazabilidad — por una plataforma tecnológica accesible, segura y escalable que eleve la eficiencia operativa del establecimiento.

## Antecedentes

### Antecedentes del objeto de estudio

El objeto de estudio del presente proyecto es una cafetería de tamaño mediano en la ciudad de La Paz, Bolivia, que actualmente opera sus procesos de atención y venta de manera completamente manual. Este escenario, lejos de ser un caso aislado, refleja la realidad predominante en el sector gastronómico local, donde la adopción de tecnologías de gestión sigue siendo incipiente.

![Ejemplo de problemas en las cafeterias](assets/images/cafeteria.png){#fig:ejemplo_cafeteria width=65%}

En su estado actual, el flujo operativo de la cafetería depende íntegramente de la intervención humana no sistematizada: los pedidos de los clientes son anotados a mano por el personal en libretas o talonarios de papel, la comunicación entre el área de atención y la barra de preparación se realiza de forma verbal o mediante la entrega física de las comandas, y el proceso de cobro se ejecuta mediante cálculos mentales o con el apoyo de calculadoras de escritorio. Al cierre de cada jornada, el arqueo de caja se realiza de forma manual, contrastando el efectivo físico con las anotaciones del día, un proceso propenso a errores y discrepancias.

Esta situación genera un conjunto de problemas operativos concretos y recurrentes que afectan tanto la eficiencia del servicio como la salud financiera del negocio:

- **Pérdida e ilegibilidad de comandas:** El registro manual en papel está expuesto a extravíos, manchas o escritura ilegible, lo que deriva en errores en la preparación de pedidos y conflictos con los clientes.
- **Ausencia de control y auditoría de usuarios:** Al no existir un sistema de registro, resulta imposible determinar qué miembro del personal procesó, modificó o anuló una orden, eliminando cualquier posibilidad de rendición de cuentas.
- **Descuadres de caja recurrentes:** El cobro basado en cálculo mental o en calculadoras simples, sin un sistema que valide automáticamente los totales, genera discrepancias diarias entre los ingresos registrados y el efectivo real.
- **Nula trazabilidad histórica:** La ausencia de una base de datos implica que no existe ningún registro histórico de ventas. La gerencia no puede conocer cuáles son los productos más vendidos, los picos de demanda por hora o los ingresos acumulados por período, privándose de información crítica para la toma de decisiones estratégicas.

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

La unidad de análisis del presente proyecto es una cafetería de servicio rápido ubicada en la ciudad de La Paz, Bolivia, con capacidad para atender simultáneamente a múltiples mesas. El establecimiento ofrece un menú compuesto principalmente por bebidas calientes y frías (cafés, infusiones, batidos) y una selección de alimentos de preparación rápida (postres, sándwiches, snacks), atendiendo a una clientela diversa en horario continuo.

**Estructura organizacional y actores del sistema:**

El personal operativo del establecimiento se organiza en dos roles funcionales claramente diferenciados, que se corresponden directamente con los actores del sistema a desarrollar:

- **Administrador:** Responsable de la gobernanza general del negocio. Gestiona el catálogo de productos (altas, bajas y modificaciones de precios), administra las cuentas del personal operativo y tiene acceso a los reportes de ventas e indicadores financieros.
- **Cajero / Operador POS:** Personal de atención directa al cliente. Su función central es construir y procesar órdenes en la interfaz del punto de venta, asignarlas a la mesa correspondiente y ejecutar el cobro al momento de cerrar la cuenta.

**Flujo actual del negocio (situación sin sistema):**

El ciclo de servicio actual sigue el siguiente flujo manual: el cliente se ubica en una mesa disponible → el cajero toma el pedido verbalmente y lo anota en la comanda de papel → la comanda se entrega en barra para preparación → los productos son entregados al cliente → al solicitar la cuenta, el cajero suma manualmente los ítems, comunica el total y recibe el pago en efectivo → el dinero se deposita en la caja registradora mecánica.

**Flujo propuesto del negocio (con el sistema TPS):**

Con la implementación del sistema, el flujo se transforma radicalmente: el cajero selecciona los productos del menú digital interactivo y los asigna a la mesa del cliente en la interfaz POS → el sistema calcula automáticamente el subtotal en tiempo real → al confirmar el cobro, el _backend_ procesa matemáticamente la transacción, aplica impuestos y sella el registro de forma inmutable en la base de datos → el sistema genera automáticamente el comprobante de pago (ticket/factura) → la mesa queda marcada como disponible para el próximo cliente. Cada uno de estos eventos queda registrado con fecha, hora, cajero responsable y detalle de productos, garantizando trazabilidad completa y eliminando cualquier posibilidad de descuadre.

## Identificación del Problema

La cafetería objeto de estudio opera actualmente sin ningún sistema de información digital que centralice y automatice sus procesos transaccionales. Esta carencia se manifiesta en cinco dimensiones de problema interrelacionadas:

En primer lugar, la **ineficiencia operativa en la toma y seguimiento de pedidos**: la gestión manual de comandas en papel provoca errores en la preparación, pedidos duplicados u omitidos, y tiempos de espera prolongados para el cliente, especialmente durante los picos de demanda. En segundo lugar, la **imposibilidad de control y auditoría de usuarios**: sin un sistema de registro de sesiones, es imposible determinar qué operario procesó, anuló o modificó una orden, creando un entorno sin rendición de cuentas. En tercer lugar, la **inexactitud en el cobro y los arqueos de caja**: la dependencia del cálculo mental y de las calculadoras genera descuadres frecuentes entre el registro de ventas y el efectivo físico al cierre del turno. En cuarto lugar, la **ausencia total de datos históricos**: sin una base de datos, la gerencia carece de información sobre ventas por período, productos más demandados o rendimiento del personal, limitando severamente su capacidad de tomar decisiones informadas. Finalmente, la **falta de escalabilidad del modelo operativo actual**: el sistema manual no puede adaptarse a un eventual crecimiento del negocio (más mesas, más personal, múltiples sucursales) sin incrementar proporcionalmente los errores y la carga operativa.

## Formulación del Problema

¿De qué manera el desarrollo e implementación de un Sistema de Información Organizacional Web basado en el enfoque de Procesamiento de Transacciones (TPS), construido sobre la arquitectura MERN, puede optimizar la gestión de pedidos, la administración de mesas, el control de usuarios por roles, el procesamiento de cobros y la generación de reportes financieros en una cafetería de la ciudad de La Paz, reduciendo los errores operativos y garantizando la trazabilidad e integridad de cada transacción?

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

## Límites y Alcances del Sistema

### Límites del Sistema

El sistema de Punto de Venta (POS) web propuesto ha sido diseñado bajo un conjunto de restricciones técnicas y funcionales que delimitan su alcance en esta primera versión (MVP — _Minimum Viable Product_). Estos límites permiten enfocar el desarrollo en los requerimientos críticos del negocio, garantizando estabilidad, simplicidad y viabilidad en su implementación inicial.

Los principales límites del sistema son:

- **Plataforma exclusivamente web:** El sistema será accesible únicamente a través de navegadores web modernos, descartando el desarrollo de aplicaciones móviles nativas (Android/iOS) en esta etapa.

- **Dependencia de conectividad local o a internet:** El sistema requiere conexión a red (LAN o Internet) para operar, ya que la lógica de negocio y la base de datos residen en el servidor. No se contempla un modo offline.

- **Base de datos NoSQL (MongoDB):** Se utilizará una base de datos documental orientada a rendimiento transaccional, sin implementación de motores relacionales tradicionales (SQL).

- **Sistema cerrado de autenticación:** No se integrarán servicios externos de autenticación como Google, Facebook o proveedores OAuth. El acceso será exclusivamente mediante credenciales internas.

- **Pagos simulados (sin integración bancaria real):** En esta versión, los métodos de pago (efectivo, tarjeta) serán registrados de forma lógica sin conexión a pasarelas de pago reales.

- **Monosucursal:** El sistema estará diseñado para una única cafetería, sin soporte inicial para múltiples sucursales.

### Alcances del Sistema

El sistema POS web permitirá digitalizar y optimizar los procesos clave del negocio, cubriendo completamente el flujo operativo de ventas y gestión básica del establecimiento.

Entre los principales alcances se incluyen:

- **Gestión del catálogo de productos:**
  - Registro, edición y eliminación de productos.
  - Clasificación por categorías.
  - Control de precios en tiempo real.

- **Gestión de usuarios y roles (RBAC):**
  - Creación y administración de cuentas.
  - Asignación de roles (Administrador, Cajero).
  - Control de permisos mediante middleware.

- **Sistema de autenticación segura:**
  - Inicio de sesión mediante credenciales.
  - Uso de JSON Web Tokens (JWT).
  - Encriptación de contraseñas con bcrypt.

- **Módulo de Punto de Venta (POS):**
  - Selección interactiva de productos.
  - Construcción de pedidos en tiempo real.
  - Cálculo automático de totales.

- **Gestión de mesas:**
  - Visualización del estado (libre, ocupada).
  - Asignación obligatoria de mesa a cada orden.

- **Procesamiento de transacciones:**
  - Registro de ventas con persistencia en base de datos.
  - Asociación de usuario, mesa y productos.

- **Facturación automatizada:**
  - Generación de tickets en formato PDF.
  - Registro histórico de ventas.

- **Reportes básicos:**
  - Consulta de ventas por fecha.
  - Totales por usuario o turno.

- **Arquitectura escalable:**
  - Separación frontend/backend.
  - Preparado para despliegue en la nube.

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
- **Modelo C4:** Para documentar la arquitectura del sistema en cuatro niveles de abstracción progresiva (Contexto, Contenedores, Componentes y Código), permitiendo comunicar el diseño técnico de forma clara tanto a audiencias técnicas como no técnicas.

### Modelo C4

Se aplicarán diferentes modelos para diagramar todo el proceso y elaboriación del sistema POS. El Modelo C4 (_Context, Containers, Components, Code_) es un enfoque de documentación de arquitecturas de _software_ creado por Simon Brown que propone describir un sistema desde cuatro niveles de abstracción jerárquica, permitiendo que diferentes audiencias comprendan la arquitectura con el nivel de detalle que cada una requiere (Brown, 2018).

**Nivel 1 — Diagrama de Contexto del Sistema (_System Context_):**
Es el nivel más alto de abstracción. Muestra el sistema como una caja negra en el centro, rodeado de los usuarios (_actores_) que interactúan con él y de los sistemas externos con los que se comunica. Para el Sistema POS de Cafetería, este diagrama ubicaría al sistema en su entorno: el _Cajero_ y el _Administrador_ como actores principales, y sistemas externos como el servidor de correo electrónico (para notificaciones) o la pasarela de pagos (en versiones futuras). Su propósito es responder: ¿qué hace el sistema y quién lo usa?

**Nivel 2 — Diagrama de Contenedores (_Containers_):**
Descompone el sistema en sus grandes bloques tecnológicos desplegables: las aplicaciones, los servicios y los almacenes de datos que lo componen. Para el Sistema POS, este nivel revela los tres contenedores principales de la arquitectura MERN: la **Aplicación Web** (_Single Page Application_ en React.js, ejecutada en el navegador del operador), la **API REST** (servidor Node.js/Express.js desplegado en un contenedor Docker en AWS EC2) y la **Base de Datos** (instancia de MongoDB). Este diagrama responde: ¿cómo está estructurado técnicamente el sistema y cómo se comunican sus partes?

**Nivel 3 — Diagrama de Componentes (_Components_):**
Profundiza dentro de un contenedor específico, mostrando los componentes lógicos que lo integran y sus responsabilidades. Para el contenedor de la **API REST**, los componentes serían: el _Router de Autenticación_ (gestiona el registro y _login_), el _Middleware JWT_ (valida tokens en cada petición), el _Controlador de Órdenes_ (maneja el ciclo de vida de los pedidos), el _Controlador de Productos_ (gestiona el catálogo del menú), el _Controlador de Mesas_ (administra el estado de las mesas) y el _Generador de Reportes PDF_ (produce los comprobantes de venta). Este nivel responde: ¿qué hace cada parte interna del contenedor?

**Nivel 4 — Código (_Code_):**
Es el nivel más detallado y opcional, representado mediante diagramas de clases UML o directamente a través del código fuente documentado. Para el Sistema POS, este nivel se materializa en los esquemas de _Mongoose_ (`UserSchema`, `ProductSchema`, `OrderSchema`, `TableSchema`) y en la estructura de clases o módulos del _frontend_ React. Su propósito es responder: ¿cómo está implementado internamente cada componente?

La adopción del Modelo C4 en este proyecto garantiza que la arquitectura MERN quede documentada de forma consistente y navegable, facilitando la incorporación de nuevos desarrolladores al equipo y la comunicación técnica con el cliente. Los diagramas de Contexto y Contenedores se incluyen en el presente informe; los de Componentes y Código se desarrollan en el Marco Práctico.

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

A continuación se presenta el diagrama de la arquitectura propuesta:

\begin{diagrama}[H]
\centering
\includegraphics[width=0.85\linewidth]{assets/diagrama/arquitectura_mern.png}
\caption{Diagrama de Arquitectura MERN de tres capas del Sistema POS}
\label{diag:arquitectura_mern}
\end{diagrama}

## Cronograma

El proyecto tiene una duración total de **4 meses (16 semanas)**, organizado en 8 _Sprints_ de 2 semanas cada uno bajo el marco Scrum.

\begingroup\small
\begin{longtable}{|p{1.2cm}|p{1.5cm}|p{2.6cm}|p{5.5cm}|p{3cm}|}
\hline
\rowcolor{headerblue} \bfseries \color{white} Sprint & \bfseries \color{white} Semanas & \bfseries \color{white} Fase & \bfseries \color{white} Actividades principales & \bfseries \color{white} Entregable \\ \hline
\endhead
\textbf{0} & 1–2 & Inicio y Diseño & Levantamiento de requerimientos, diseño de \emph{wireframes} UI/UX, modelado de base de datos, configuración del repositorio GitHub y entorno Docker. & \emph{Product Backlog}, diseño de BD, \emph{wireframes} aprobados. \\ \hline
\textbf{1} & 3–4 & \emph{Backend} – Fundamentos & Configuración de Express.js, conexión MongoDB con Mongoose, modelos de datos (User, Product, Table, Order), sistema de autenticación JWT y \emph{middleware} de roles. & API de autenticación funcional (registro, \emph{login}, roles). \\ \hline
\textbf{2} & 5–6 & \emph{Backend} – Módulos Core & APIs RESTful para gestión de productos del menú (CRUD), gestión de mesas (CRUD + estados) y gestión de órdenes (crear, actualizar estado). & \emph{Endpoints} de Products, Tables y Orders documentados. \\ \hline
\textbf{3} & 7–8 & \emph{Frontend} – Base y Auth & Configuración de React.js + Redux Toolkit + React Router, pantallas de \emph{Login}, \emph{layout} principal y conexión con el API de autenticación. & \emph{Frontend} base funcional con \emph{login} y roles. \\ \hline
\textbf{4} & 9–10 & \emph{Frontend} – POS & Módulo POS táctil: selección de categorías, productos, cantidad y adición al carrito de órdenes; envío de pedidos al \emph{backend}. & Interfaz POS funcional conectada al \emph{backend}. \\ \hline
\textbf{5} & 11–12 & Mesas y Dashboard & Panel visual de estados de mesas, módulo de administración de menú (alta/baja de productos), vista de órdenes activas para cocina. & Gestión de mesas e interfaz de cocina operativa. \\ \hline
\textbf{6} & 13–14 & Facturación y Pagos & Módulo de generación de facturas en PDF, cálculo automático de totales, integración de métodos de pago simulados, historial de ventas. & Facturación y cierre de órdenes completo. \\ \hline
\textbf{7} & 15–16 & Cierre: QA y Despliegue & Pruebas funcionales e integración (QA), corrección de \emph{bugs}, despliegue en AWS/DigitalOcean con Docker, documentación técnica final y capacitación al usuario. & Sistema desplegado en producción y manual de usuario. \\ \hline
\caption{Cronograma de Sprints}
\label{tab:cronograma_sprints}
\end{longtable}
\endgroup

---

# MARCO TEÓRICO DEL SISTEMA TPS

## Sistemas de Información Organizacional

### Definición

Un Sistema de Información Organizacional (SIO) es un conjunto integrado de componentes — personas, procesos, datos, _hardware_ y _software_ — diseñado para recolectar, almacenar, procesar y distribuir información que apoye la coordinación, el control, el análisis y la toma de decisiones dentro de una organización [@laudon2020]. A diferencia de un simple programa informático, un SIO está profundamente imbricado con los procesos de negocio de la organización: define cómo fluye la información entre los actores, cuándo se captura, cómo se transforma y quién tiene acceso a ella.

En términos más precisos, un SIO transforma datos crudos (ej. el registro de una venta) en información significativa y estructurada (ej. un reporte de ingresos diarios), que a su vez se convierte en conocimiento útil para la gestión (ej. la identificación del turno de mayor rentabilidad). Este proceso de transformación es el núcleo del valor que aportan los SIO a las organizaciones modernas.

### Componentes

Todo Sistema de Información Organizacional se articula en torno a seis componentes fundamentales que trabajan de forma interdependiente:

- **Hardware:** La infraestructura física que sustenta el sistema: servidores, terminales de trabajo, dispositivos de red y, en el contexto del presente proyecto, las estaciones de trabajo desde las que el personal operará la interfaz POS.
- **Software:** Los programas y aplicaciones que procesan los datos. Incluye tanto el _software_ de sistema (sistema operativo, entorno de ejecución Node.js) como el _software_ de aplicación desarrollado a medida (la plataforma POS web).
- **Datos:** La materia prima del sistema. En el contexto de la cafetería, los datos son las órdenes, los productos, los usuarios, las mesas y las transacciones que el sistema captura y persiste en la base de datos MongoDB.
- **Redes y telecomunicaciones:** La infraestructura de conectividad que permite el acceso concurrente al sistema desde múltiples dispositivos, habilitado por la arquitectura cliente-servidor del proyecto.
- **Procedimientos:** Los protocolos y flujos de trabajo que definen cómo deben interactuar los usuarios con el sistema (ej. el proceso de apertura de turno, la toma de una orden, el cierre de caja).
- **Recursos humanos:** Los actores que operan el sistema. En el proyecto, esto comprende al Administrador y al Cajero, cada uno con roles y permisos claramente delimitados.

### Tipos de sistemas

Desde una perspectiva funcional, los SIO se clasifican en distintos tipos según el nivel organizacional al que sirven. Los **Sistemas de Procesamiento de Transacciones (TPS)** operan en el nivel operativo, capturando y procesando las transacciones cotidianas del negocio. Los **Sistemas de Información Gerencial (MIS)** consolidan la información del TPS para generar reportes estructurados destinados a la gerencia media. Los **Sistemas de Soporte a Decisiones (DSS)** asisten en la toma de decisiones complejas mediante análisis de datos y modelos. Los **Sistemas de Información Ejecutiva (EIS)** proveen información estratégica de alto nivel a los directivos. El presente proyecto se enfoca en la implementación de un TPS, que actúa como la base de toda esta pirámide informacional.

## Sistema de Procesamiento de Transacciones (TPS)

### Definición

Un Sistema de Procesamiento de Transacciones es un tipo especializado de SIO diseñado para capturar, procesar, validar y almacenar las transacciones operativas de una organización de forma inmediata, confiable y a gran escala [@obrien2011]. En el contexto del negocio, una **transacción** se define como cualquier evento discreto que modifica el estado de los datos del sistema y que debe quedar registrado de forma permanente e inalterable: el registro de una venta, la creación de una orden, el cobro de una cuenta o la modificación del catálogo de productos.

### Características

Los TPS se distinguen de otros tipos de sistemas de información por un conjunto de atributos técnicos y funcionales que los hacen aptos para el procesamiento operativo de alto volumen:

- **Procesamiento en tiempo real (_OLTP_):** A diferencia del procesamiento por lotes (_batch_), los TPS modernos procesan cada transacción en el instante en que se produce, actualizando la base de datos de forma inmediata y reflejando el estado actual del negocio en todo momento.
- **Alta confiabilidad y disponibilidad:** Un TPS para un punto de venta debe estar disponible durante todo el horario operativo del negocio. La indisponibilidad del sistema implica la parálisis del servicio al cliente.
- **Integridad transaccional (propiedades ACID):** Toda transacción en un TPS debe cumplir las propiedades de Atomicidad (la transacción se ejecuta completa o no se ejecuta), Consistencia (el sistema pasa de un estado válido a otro estado válido), Aislamiento (las transacciones concurrentes no interfieren entre sí) y Durabilidad (una transacción confirmada persiste incluso ante fallos del sistema) [@elmasri2015].
- **Manejo de alto volumen de datos estandarizados:** Los TPS están optimizados para procesar grandes cantidades de transacciones simples y repetitivas de forma eficiente, a diferencia de los sistemas analíticos que trabajan con consultas complejas sobre datos históricos.

### Funciones

En el contexto específico del presente proyecto, el TPS ejecuta el siguiente ciclo funcional para cada transacción de venta:

1. **Captura de datos de origen:** El cajero construye la orden seleccionando productos del catálogo digital y asignándola a una mesa, introduciendo los datos de la transacción en el sistema mediante la interfaz POS de React.js.
2. **Validación y verificación:** El _backend_ (Node.js/Express.js) verifica que el usuario tenga los permisos necesarios (validación JWT), que losítulos existan en el catálogo activo y que la mesa esté disponible.
3. **Procesamiento matemático:** El motor transaccional calcula automáticamente los subtotales por ítem, aplica los impuestos correspondientes y determina el total a cobrar, eliminando el margen de error del cálculo manual.
4. **Actualización de la base de datos:** La transacción se escribe de forma atómica en MongoDB, vinculando el documento de la orden con el cajero responsable, la mesa asignada y los ítems del carrito con sus precios exactos en ese instante.
5. **Emisión del comprobante:** El sistema genera el ticket o factura en formato PDF, disponible para impresión inmediata, y actualiza el estado de la mesa a "disponible".

### Evolución hacia sistemas web

Los TPS han recorrido un largo camino desde las terminales monolíticas de los años setenta. La adopción de arquitecturas web modernas —como la empleada en este proyecto— representa la fase más reciente de esta evolución, caracterizada por tres ventajas fundamentales: **ubicuidad** (el sistema es accesible desde cualquier dispositivo con navegador web en la red local del negocio), **centralización** (todos los datos residen en un único repositorio en la nube, eliminando la dispersión de información), y **escalabilidad** (la arquitectura basada en microservicios y contenedores Docker permite escalar el sistema horizontalmente para absorber incrementos en la carga de trabajo sin rediseñar la arquitectura base).

## Arquitectura de sistemas web

La arquitectura del sistema POS se basa en el modelo Cliente–Servidor, una de las estructuras más utilizadas en aplicaciones web modernas por su capacidad de separación de responsabilidades, escalabilidad y mantenimiento [@sommerville2015].

### Cliente

El cliente representa la capa de presentación del sistema, encargada de interactuar directamente con el usuario final mediante una interfaz gráfica accesible desde el navegador. En este proyecto, el cliente será desarrollado utilizando React.js, permitiendo:

- Renderizado dinámico de componentes (Virtual DOM).
- Interacciones en tiempo real en el POS.
- Manejo del estado global mediante Redux Toolkit.
- Navegación sin recarga de página (SPA).

Funciones principales:

- Capturar datos de entrada (pedidos, login).
- Mostrar información procesada.
- Enviar solicitudes HTTP al servidor.

### Servidor

El servidor constituye la capa de lógica de negocio.
Tecnologías: Node.js; Express.js.
Funciones principales:

- Procesamiento de órdenes.
- Validaciones y cálculos.
- Ejecución de la lógica transaccional.

### API

La API permite la comunicación entre cliente y servidor mediante HTTP y JSON. Actúa como el puente documentado que estructura y transmite la información bidireccionalmente.
Características:

- Métodos estándar: GET, POST, PUT, DELETE.
- Arquitectura RESTful.

### Base de datos

Repositorio central donde reposa la persistencia de las entidades. Es el componente responsable de almacenar los datos operacionales a largo plazo para asegurar la durabilidad y disponibilidad de la información de las ventas y el menú.

### Flujo del Sistema

1. Usuario interactúa con frontend.
2. Cliente envía petición HTTP a la API.
3. Servidor procesa la solicitud y valida.
4. Se consulta o impacta la base de datos.
5. Servidor responde en JSON.
6. Frontend actualiza la interfaz.

## Seguridad en sistemas de información

Como modelador y encargado de la seguridad arquitectónica, se establece que un sistema de ventas (POS) debe proteger de forma absoluta sus _endpoints_ (rutas de API) y la persistencia de datos.

### Autenticación

Se descartan las sesiones tradicionales. El sistema implementa JSON Web Tokens (JWT). Tras validar credenciales (contraseñas previamente procesadas con funciones criptográficas unidireccionales de _hash_, como _bcrypt_), el _backend_ emite un token firmado [@stallings2017]. Este token viaja en las cabeceras HTTP de cada petición del cliente, garantizando que el usuario es quien dice ser sin consultar la base de datos reiteradamente.

### Autorización

La autorización asegura que un usuario autenticado solo pueda realizar las acciones para las que está facultado. Se ejecuta verificando los niveles de privilegio incrustados y firmados criptográficamente en el token antes de responder a una petición.

### Roles

El modelo de datos incluye una propiedad rígida de "Rol" (ej. Administrador, Cajero). Este mecanismo se implementa mediante _Middlewares_ (bloques de código intermedios en el _backend_) que desencriptan el _payload_ del token y rechazan con un error 403 (Prohibido) cualquier intento de un Cajero de acceder a las rutas de eliminación de usuarios o reportes gerenciales.

### Control de acceso

Tanto a nivel de la interfaz (ocultando botones de configuración a cajeros) como a nivel de capa de datos, se aplican políticas estrictas para evitar inyecciones maliciosas o robo de sesiones, blindando el flujo desde que se presiona "Cobrar" hasta que la información reposa en el disco.

## Base de datos

El diseño de la persistencia de datos constituye el corazón del sistema, siendo responsabilidad directa de la ingeniería de datos modelar la información de la cafetería para que sea escalable, rápida y matemáticamente exacta.

### Modelo relacional

Aunque tecnologías modernas como la pila MERN utilicen modelos NoSQL orientados a documentos para optimizar la velocidad transaccional, los principios lógicos relacionales son ineludibles en un TPS [@elmasri2015]. Las entidades maestras se identifican y separan claramente: `Usuarios` (Personal), `Categorías` (Clasificación del menú), `Productos` (Ítems de venta) y `Facturas/Órdenes` (Registro de la transacción). Se definen llaves referenciales explícitas entre ellas para establecer cardinalidad (ej. un cajero realiza muchas ventas, una orden contiene múltiples productos).

### Integridad

Los principios lógicos de integridad se mantienen ineludibles mediante el uso de esquemas de validación estrictos (como _Mongoose_ en el caso de la pila seleccionada). Estos esquemas garantizan la exactitud de los tipos de datos ingresados y previenen la inserción de documentos huérfanos o con información financiera incompleta.

### Normalización

Se aplican reglas de normalización para evitar anomalías; por ejemplo, la información del perfil del usuario o la descripción detallada de un producto no se repiten innecesariamente. Sin embargo, por requerimientos de diseño de un POS y para proteger la contabilidad, se realiza una desnormalización controlada en las `Órdenes`: al registrar una venta, el precio exacto actual del producto se copia de forma fija dentro de la orden. Esto garantiza que la información histórica sea inmutable frente a futuros cambios de precios en el catálogo.

### Transacciones

En el entorno TPS, una transacción es indivisible. Registrar una venta implica: calcular totales, insertar la orden, asociar el método de pago y actualizar la disponibilidad de la mesa. El motor de la base de datos se configura para garantizar atomicidad (Principios ACID), asegurando que si ocurre un fallo de red a la mitad del proceso, la base de datos ejecute un _Rollback_ (reversión completa de los pasos previos), previniendo que existan "ventas a medias" o corrupciones en los arqueos de caja.

## Metodología de desarrollo

### Scrum

Es un marco de trabajo ágil para el desarrollo, entrega y mantenimiento de productos complejos, definido en la _Scrum Guide_ [@schwaber2020]. Se fundamenta en tres pilares empíricos: transparencia, inspección y adaptación. Para el Sistema POS de Cafetería, Scrum es la elección metodológica óptima porque permite iterar rápidamente y ajustar requerimientos de acuerdo a la retroalimentación del cliente.

#### Roles

- **Product Owner:** Es el responsable de maximizar el valor del producto. Sus funciones son definir y mantener el _Product Backlog_; ser el punto de contacto único con el cliente; y aceptar o rechazar los incrementos funcionales.
- **Scrum Master:** Responsable de que el equipo aplique correctamente Scrum. Facilita las ceremonias, elimina impedimentos y protege al equipo de interrupciones externas.
- **Equipo de Desarrollo:** Equipo autoorganizado responsable de convertir los ítems del _Product Backlog_ en un incremento potencialmente entregable (programación, diseño y pruebas).

#### Artefactos

- **Product Backlog:** Lista única y priorizada de todos los requerimientos funcionales y técnicos necesarios para el sistema.
- **Sprint Backlog:** Conjunto de requerimientos seleccionados para el _Sprint_ actual, divididos en tareas concretas a desarrollar por el equipo.
- **Incremento:** La suma de todas las funcionalidades completadas durante el _Sprint_, las cuales deben cumplir con la Definición de Hecho (código probado y validado).

#### Eventos

- **Sprint Planning (Planificación):** Reunión de inicio donde el equipo define qué se va a entregar y cómo se va a construir el incremento durante el ciclo de trabajo.
- **Daily Scrum (Reunión diaria):** Reunión breve de sincronización del equipo de desarrollo para evaluar el progreso y exponer bloqueos u obstáculos.
- **Sprint Review (Revisión):** Demostración del _software_ funcional al _Product Owner_ y partes interesadas al finalizar el _Sprint_ para recoger impresiones.
- **Sprint Retrospective (Retrospectiva):** Espacio de mejora continua donde el equipo reflexiona sobre sus propios procesos de trabajo de cara a la siguiente iteración.

# MARCO PRÁCTICO — DESARROLLO DEL SISTEMA TPS

# Análisis del sistema

En base a la recopilación de datos realizada mediante entrevistas al personal y observación directa del flujo operativo de la cafetería, se identifican los siguientes actores, procesos y flujos que el sistema debe digitalizar.

**Actores del sistema:**

La cafetería opera con tres actores principales que interactúan con el sistema en distintos niveles de privilegio:

- **Administrador:** Actor con control total del sistema. Gestiona el catálogo de productos, categorías y precios; administra usuarios y roles; supervisa el inventario de insumos; genera reportes financieros y de ventas; y toma decisiones estratégicas apoyadas en los indicadores del _dashboard_.
- **Cajero / Operador POS:** Actor de atención directa. Registra ventas, selecciona productos del menú digital, asigna la mesa correspondiente, procesa el cobro y emite el comprobante digital al cliente.
- **Encargado de Cocina:** Actor de apoyo operativo. Recibe notificaciones de pedidos en producción, actualiza la disponibilidad de productos cuando un insumo se agota y gestiona el menú semanal disponible.

**Procesos principales identificados:**

1. **Proceso de venta:** El cajero construye el pedido seleccionando productos del menú digital → asigna la mesa → el sistema calcula automáticamente el subtotal → se selecciona el método de pago (efectivo o QR) → el _backend_ procesa la transacción de forma atómica → se emite el comprobante digital → el inventario se descuenta automáticamente.

2. **Proceso de gestión de inventario:** El administrador registra insumos y productos con su stock inicial → el sistema descuenta automáticamente al registrar cada venta → cuando un insumo alcanza el nivel mínimo, el sistema emite una alerta → el administrador genera la orden de compra vinculada al proveedor correspondiente → al recibir la mercadería, se registra la entrada y el stock se actualiza.

3. **Proceso de gestión de menú:** El encargado de cocina actualiza semanalmente los productos disponibles → asigna precios de venta y costos de producción → agrupa productos por categoría (bebidas calientes, jugos, almuerzos, _snacks_, postres) → marca productos como no disponibles cuando el insumo se agota → gestiona combos y menús del día.

4. **Proceso de reportes:** El administrador consulta el _dashboard_ con indicadores en tiempo real → filtra ventas por día, semana o mes → analiza productos más vendidos, horas pico, márgenes por categoría y comparativos históricos → exporta reportes en PDF.

**Flujo de datos del sistema:**

El flujo de información sigue la dirección: **Entrada (interfaz POS / administración)** → **Procesamiento (_backend_ Node.js/Express.js con validación JWT)** → **Persistencia (MongoDB)** → **Salida (reportes, comprobantes PDF, alertas de stock, _dashboard_)**. Cada transacción queda vinculada al cajero que la ejecutó, la mesa asignada, los productos con sus precios en ese instante y la fecha y hora exactas, garantizando trazabilidad completa y soporte a auditorías.

![Ejemplo de prueba en el análisis del sistema](assets/images/ejemplo.png){#fig:ejemplo_analisis width=65%}

## Determinación de requerimientos

### Requerimientos funcionales

Los requerimientos funcionales expresan lo que el sistema **debe hacer** operativamente. Se organizan por módulo funcional según el análisis del sistema.

**4.1 Gestión de Ventas y Pedidos**

\begingroup\small
\begin{longtable}{|p{1.2cm}|p{7.5cm}|p{2.5cm}|p{1.8cm}|}
\hline
\rowcolor{headerblue} \bfseries \color{white} ID & \bfseries \color{white} Descripción del Requerimiento & \bfseries \color{white} Actor & \bfseries \color{white} Prioridad \\ \hline
\endhead
RF-01 & Registrar cada venta con detalle: producto, cantidad, precio y hora de transacción. & Cajero/Admin & Media \\ \hline
RF-08 & Recibir pedidos que ya están hechos o que están en producción. & Admin/Cajero & Media \\ \hline
RF-09 & Notificar que el pedido del cliente está preparado o en producción. & Enc. cocina/Admin & Media \\ \hline
RF-11 & Emitir comprobantes o tickets digitales al cliente al momento del pago. & Cajero/Admin & Media \\ \hline
RF-12 & Soportar múltiples formas de pago: efectivo, código QR. & Cajero/Admin & Alta \\ \hline
RF-13 & Visualizar historial de ventas filtrado por día, semana o mes. & Admin & Media \\ \hline
RF-14 & Cancelar o modificar pedidos antes de su despacho, con trazabilidad del cambio. & Cajero/Admin & Alta \\ \hline
\caption{Requerimientos funcionales — Gestión de Ventas y Pedidos}
\label{tab:rf_ventas}
\end{longtable}
\endgroup

**4.2 Control de Inventario**

\begingroup\small
\begin{longtable}{|p{1.2cm}|p{7.5cm}|p{2.5cm}|p{1.8cm}|}
\hline
\rowcolor{headerblue} \bfseries \color{white} ID & \bfseries \color{white} Descripción del Requerimiento & \bfseries \color{white} Actor & \bfseries \color{white} Prioridad \\ \hline
\endhead
RF-03 & Registrar todos los productos e insumos con su stock actual y unidad de medida. & Admin & Alta \\ \hline
RF-15 & Descontar automáticamente del inventario al momento de registrar una venta. & Sistema/Admin & Alta \\ \hline
RF-16 & Emitir alertas automáticas cuando un insumo alcance el nivel mínimo de stock. & Sistema/Admin & Alta \\ \hline
RF-17 & Registrar entradas de mercadería vinculadas a órdenes de compra y proveedores. & Admin & Alta \\ \hline
RF-18 & Identificar productos con alta rotación y aquellos con riesgo de desperdicio. & Admin & Media \\ \hline
RF-19 & Generar reportes de merma y diferencias de inventario. & Admin & Media \\ \hline
\caption{Requerimientos funcionales — Control de Inventario}
\label{tab:rf_inventario}
\end{longtable}
\endgroup

**4.3 Gestión de Menú y Productos**

\begingroup\small
\begin{longtable}{|p{1.2cm}|p{7.5cm}|p{2.5cm}|p{1.8cm}|}
\hline
\rowcolor{headerblue} \bfseries \color{white} ID & \bfseries \color{white} Descripción del Requerimiento & \bfseries \color{white} Actor & \bfseries \color{white} Prioridad \\ \hline
\endhead
RF-05 & Crear, editar y desactivar productos del menú de forma rápida y sencilla. & Enc. cocina/Admin & Media \\ \hline
RF-06 & Asignar precios de venta y costos de producción a cada producto para calcular el margen real. & Admin & Alta \\ \hline
RF-07 & Agrupar productos por categorías: bebidas calientes, jugos, almuerzos, \emph{snacks}, postres, etc. & Admin & Alta \\ \hline
RF-10 & Elaborar el menú disponible semanal actualizado. & Enc. cocina/Admin & Media \\ \hline
RF-20 & Marcar productos como no disponibles cuando el insumo correspondiente se haya agotado. & Enc. cocina/Admin & Alta \\ \hline
RF-21 & Gestionar combos o menús del día con precios especiales. & Admin & Media \\ \hline
\caption{Requerimientos funcionales — Gestión de Menú y Productos}
\label{tab:rf_menu}
\end{longtable}
\endgroup

**4.4 Reportes y Apoyo a la Toma de Decisiones**

\begingroup\small
\begin{longtable}{|p{1.2cm}|p{7.5cm}|p{2.5cm}|p{1.8cm}|}
\hline
\rowcolor{headerblue} \bfseries \color{white} ID & \bfseries \color{white} Descripción del Requerimiento & \bfseries \color{white} Actor & \bfseries \color{white} Prioridad \\ \hline
\endhead
RF-04 & Reporte de productos más vendidos para identificar los artículos estrella del menú. & Admin & Media \\ \hline
RF-22 & Generar reporte de ingresos diarios, semanales y mensuales con comparativos históricos. & Admin & Alta \\ \hline
RF-23 & Analizar horas pico para optimizar la asignación de personal por turno. & Admin & Media \\ \hline
RF-24 & Comparar costos versus ingresos por producto y por categoría. & Admin & Alta \\ \hline
RF-25 & Mostrar un panel de control (\emph{dashboard}) con indicadores clave en tiempo real. & Admin & Alta \\ \hline
\caption{Requerimientos funcionales — Reportes y Toma de Decisiones}
\label{tab:rf_reportes}
\end{longtable}
\endgroup

**4.5 Gestión de Proveedores y Compras**

\begingroup\small
\begin{longtable}{|p{1.2cm}|p{7.5cm}|p{2.5cm}|p{1.8cm}|}
\hline
\rowcolor{headerblue} \bfseries \color{white} ID & \bfseries \color{white} Descripción del Requerimiento & \bfseries \color{white} Actor & \bfseries \color{white} Prioridad \\ \hline
\endhead
RF-02 & Registrar proveedores con sus datos de contacto y condiciones comerciales. & Admin & Media \\ \hline
RF-26 & Generar y registrar órdenes de compra vinculadas automáticamente al inventario. & Admin & Alta \\ \hline
RF-27 & Mantener historial de compras por proveedor para evaluación y negociación. & Admin & Media \\ \hline
RF-28 & Registrar precios de compra históricos para analizar variaciones de costo. & Admin & Media \\ \hline
\caption{Requerimientos funcionales — Gestión de Proveedores y Compras}
\label{tab:rf_proveedores}
\end{longtable}
\endgroup

**4.6 Gestión de Personal y Turnos**

\begingroup\small
\begin{longtable}{|p{1.2cm}|p{7.5cm}|p{2.5cm}|p{1.8cm}|}
\hline
\rowcolor{headerblue} \bfseries \color{white} ID & \bfseries \color{white} Descripción del Requerimiento & \bfseries \color{white} Actor & \bfseries \color{white} Prioridad \\ \hline
\endhead
RF-29 & Registrar datos básicos de empleados: nombre, cargo y turno asignado. & Admin & Media \\ \hline
RF-30 & Asociar cada venta al empleado que la realizó para garantizar trazabilidad y control. & Admin & Alta \\ \hline
RF-31 & Registrar asistencia y puntualidad por turno. & Admin & Baja \\ \hline
RF-32 & Gestionar permisos de acceso diferenciados por rol: administrador y cajero/operario. & Admin & Alta \\ \hline
\caption{Requerimientos funcionales — Gestión de Personal y Turnos}
\label{tab:rf_personal}
\end{longtable}
\endgroup

### Requerimientos no funcionales

Establecen las restricciones y la forma en cómo debe operar y comportarse estructuralmente la aplicación.

\begingroup\small
\begin{longtable}{|p{1.2cm}|p{6.5cm}|p{2.5cm}|p{1.8cm}|}
\hline
\rowcolor{headerblue} \bfseries \color{white} ID & \bfseries \color{white} Descripción del Requerimiento & \bfseries \color{white} Categoría & \bfseries \color{white} Prioridad \\ \hline
\endhead
RNF-01 & El registro de cada venta no debe superar los 5 segundos de respuesta. & Rendimiento & Media \\ \hline
RNF-02 & Cada registro de venta se realizará con un \emph{token} para verificación e historial del administrador. & Confiabilidad & Alta \\ \hline
RNF-03 & Control de acceso mediante usuario y contraseña con roles diferenciados. & Seguridad & Alta \\ \hline
RNF-04 & Adición de claves únicas para reservas o llegadas de pedidos, evitando valores duplicados. & Disponibilidad & Media \\ \hline
RNF-05 & Arquitectura que permita incorporar nuevos productos, usuarios o sucursales sin rediseño del sistema. & Escalabilidad & Alta \\ \hline
RNF-06 & Interfaz intuitiva que permita operar al personal sin capacitación técnica avanzada. & Usabilidad & Alta \\ \hline
RNF-07 & Diseño adaptado para uso en pantallas de mostrador. & Usabilidad & Media \\ \hline
RNF-08 & El sistema debe estar disponible durante todo el horario de operación sin interrupciones no planificadas. & Disponibilidad & Alta \\ \hline
RNF-09 & Las consultas de reportes deben completarse en menos de 10 segundos. & Rendimiento & Media \\ \hline
RNF-10 & Protección de datos sensibles frente a accesos no autorizados. & Seguridad & Alta \\ \hline
RNF-11 & Respaldo automático de datos para evitar pérdida de información. & Confiabilidad & Alta \\ \hline
RNF-12 & Posibilidad de recuperar datos de los últimos 30 días. & Confiabilidad & Alta \\ \hline
RNF-13 & El sistema debe contar con documentación técnica para facilitar mantenimiento. & Mantenibilidad & Media \\ \hline
\caption{Requerimientos no funcionales del Sistema POS}
\label{tab:rnf}
\end{longtable}
\endgroup

## Modelado del sistema

### Historias de Usuario

Las historias de usuario se redactan siguiendo el formato estándar: _Como_ [rol], _quiero_ [acción], _para_ [beneficio]. Se ordenan por módulo funcional y se acompañan de criterios de aceptación que sirven como base para las pruebas de validación.

**Módulo de autenticación y roles:**

- _Como_ administrador, _quiero_ crear y gestionar cuentas de usuario con roles diferenciados _para_ garantizar que cada empleado acceda únicamente a las funciones de su responsabilidad.
  - _Criterio de aceptación:_ Un cajero que intente acceder a la sección de reportes o administración recibe un error 403 y es redirigido a su panel POS.

- _Como_ cajero, _quiero_ iniciar sesión con mis credenciales de forma rápida _para_ comenzar a operar el POS sin demoras al inicio del turno.
  - _Criterio de aceptación:_ El _login_ exitoso redirige al panel POS en menos de 2 segundos y el _token_ JWT expira automáticamente al cerrar sesión.

**Módulo de ventas y pedidos:**

- _Como_ cajero en turno, _quiero_ seleccionar productos del menú digital por categoría y agregarlos al carrito _para_ construir el pedido del cliente de forma ágil y sin errores de suma.
  - _Criterio de aceptación:_ El subtotal se actualiza en tiempo real con cada producto añadido o eliminado; el sistema no permite confirmar el cobro si el carrito está vacío.

- _Como_ cajero, _quiero_ cancelar o modificar un pedido antes de su despacho _para_ corregir errores del cliente sin afectar la contabilidad.
  - _Criterio de aceptación:_ La modificación queda registrada en la bitácora con fecha, hora y usuario que realizó el cambio.

- _Como_ cajero, _quiero_ emitir un comprobante digital al cliente al momento del pago _para_ acreditar la transacción de forma inmediata.
  - _Criterio de aceptación:_ El sistema genera el PDF del comprobante en menos de 3 segundos tras confirmar el cobro.

**Módulo de inventario:**

- _Como_ administrador, _quiero_ que el sistema descuente automáticamente los insumos del inventario al registrar cada venta _para_ mantener el stock actualizado sin intervención manual.
  - _Criterio de aceptación:_ El stock de cada insumo se reduce correctamente tras cada venta confirmada; si el stock llega al mínimo, el sistema emite una alerta visible en el _dashboard_.

- _Como_ administrador, _quiero_ registrar la entrada de mercadería vinculada a una orden de compra _para_ mantener el historial de compras por proveedor y actualizar el inventario.
  - _Criterio de aceptación:_ La entrada de mercadería incrementa el stock del insumo correspondiente y queda vinculada al proveedor y la orden de compra en el historial.

**Módulo de menú y productos:**

- _Como_ encargado de cocina, _quiero_ marcar un producto como no disponible cuando su insumo se agota _para_ evitar que los cajeros lo incluyan en pedidos que no podrán completarse.
  - _Criterio de aceptación:_ El producto marcado como no disponible desaparece de la interfaz POS del cajero en tiempo real y reaparece al actualizarse el stock.

- _Como_ administrador, _quiero_ asignar precios de venta y costos de producción a cada producto _para_ calcular el margen real de cada ítem del menú.
  - _Criterio de aceptación:_ El sistema calcula y muestra el margen porcentual en el panel de administración de productos.

**Módulo de reportes:**

- _Como_ administrador, _quiero_ visualizar un _dashboard_ con indicadores clave en tiempo real _para_ tomar decisiones operativas durante el turno sin necesidad de generar reportes manuales.
  - _Criterio de aceptación:_ El _dashboard_ muestra ventas del día, productos más vendidos, alertas de stock crítico y total de ingresos actualizados en intervalos menores a 30 segundos.

- _Como_ administrador, _quiero_ generar reportes de ingresos por día, semana o mes con comparativos históricos _para_ analizar la evolución financiera del negocio.
  - _Criterio de aceptación:_ El reporte se genera en PDF en menos de 10 segundos y refleja exactamente los datos de las transacciones registradas en el período seleccionado.

### Diagramas UML

Los diagramas UML del sistema han sido elaborados en la herramienta Draw.io y se adjuntan como evidencia gráfica del diseño funcional. Se incluyen los siguientes tipos de diagrama:

**Diagrama de Casos de Uso:**
Representa las interacciones entre los actores del sistema (Administrador, Cajero, Encargado de Cocina) y los casos de uso identificados durante el análisis. Los casos de uso principales son: _Gestionar productos_, _Gestionar usuarios_, _Registrar venta_, _Emitir comprobante_, _Consultar inventario_, _Generar reporte_ y _Gestionar menú_.

\begin{diagrama}[H]
\centering
\includegraphics[width=0.85\linewidth]{assets/diagrama/casos_de_uso.png}
\caption{Diagrama de Casos de Uso del Sistema POS}
\label{diag:casos_uso}
\end{diagrama}

**Diagrama de Clases:**
Modela la estructura estática del sistema mediante las entidades principales y sus relaciones. Las clases identificadas son: `Usuario` (con atributos: id, nombre, email, contraseña, rol), `Producto` (id, nombre, precio, costo, categoría, disponible, stock), `Categoría` (id, nombre), `Orden` (id, usuario_id, mesa, estado, total, fecha, cartItems[ ]), `ItemOrden` (producto_id, cantidad, precioUnitario), `Proveedor` (id, nombre, contacto, condiciones) e `Inventario` (producto_id, stockActual, stockMínimo).

\begin{diagrama}[H]
\centering
\includegraphics[width=0.85\linewidth]{assets/diagrama/clases.png}
\caption{Diagrama de Clases del Sistema POS}
\label{diag:clases}
\end{diagrama}

**Diagrama de Actividades:**
Representa el flujo de actividades del proceso principal del sistema: el ciclo completo de una venta, desde que el cajero inicia sesión hasta que se emite el comprobante y se actualiza el inventario.

\begin{diagrama}[H]
\centering
\includegraphics[width=0.75\linewidth]{assets/diagrama/actividades.png}
\caption{Diagrama de Actividades — Flujo de Venta}
\label{diag:actividades}
\end{diagrama}

## Diseño del sistema

### Arquitectura del sistema

**Modelo: Arquitectura Web Cliente-Servidor**
El sistema se dividirá lógicamente en una aplicación cliente basada en componentes interactuando asíncronamente con un servidor _backend_ que expondrá puntos de enlace (_endpoints_) REST.
_Se sugiere aplicar adicionalmente el modelo C4 para diagramar las capas de contexto, contenedores, y componentes de la solución._

## Diseño de la Base de Datos

Se diseña bajo el paradigma relacional para modelar las entidades y su cardinalidad. Las restricciones aseguran que una transacción no puede existir sin su usuario operador o su proceso maestro.

\begingroup\small
\begin{longtable}{|p{3cm}|p{2cm}|p{2.5cm}|p{5cm}|}
\hline
\rowcolor{headerblue} \bfseries \color{white} Campo & \bfseries \color{white} Tipo & \bfseries \color{white} Llave & \bfseries \color{white} Descripción \\ \hline
\endhead
id & Int & Primaria (PK) & Identificador único de la transacción. \\ \hline
usuario_id & Int & Foránea (FK) & Código del usuario responsable. \\ \hline
fecha & Datetime & Ninguna & Fechas y hora de ejecución. \\ \hline
estado & Varchar & Ninguna & Estado lógico de la transacción. \\ \hline
\caption{Ejemplo de diccionario para tabla de Base de Datos}
\label{tab:diccionario_bd}
\end{longtable}
\endgroup

## IMPLEMENTACIÓN DE LOS MÓDULOS DEL SISTEMA

### Módulo de Gestión de Procesos

Modulo fundamental para configurar el entorno.

- **Registro de procesos:** Interfaces para ingresar la descripción de un proceso.
- **Actualización:** Se permite modificar detalles exceptuando integridades históricas.
- **Eliminación y consulta:** Eliminación lógica de procesos inactivos y un panel de cuadrícula (_Grid_) para buscar por criterios múltiples.

### Módulo de Usuarios y Roles

La barrera de seguridad del sistema TPS.

- **Registro e Inicio de sesión:** Validaciones fuertes contra la tabla criptográfica.
- **Gestión de roles y control de acceso:** El _frontend_ renderizará menús diferenciados basados en el rol (Administrador versus Operativo) dictado por el _token_ JWT emitido por la API _backend_.

### Módulo de Transacciones

Núcleo central del sistema TPS para la cafetería, diseñado en React.js para ofrecer una interfaz táctil de alta velocidad y baja fricción en la toma de pedidos (Punto de Venta).

- **Toma de Pedidos (POS):** Interfaz interactiva para seleccionar categorías (Cafés, Infusiones, Postres, Snacks) y agregar productos al carrito de compras con sus respectivas cantidades.
- **Gestión de Mesas y Estados:** Vinculación obligatoria de cada orden a una mesa específica de la cafetería. Control del flujo del pedido cambiando su estado: "En preparación" (barra/cocina), "Servido" y "Pagado".
- **Procesamiento de Pago y Cierre:** Cálculo automático en tiempo real de subtotales, impuestos y total a cobrar. Registro del método de pago (efectivo, tarjeta) e impresión del comprobante o ticket de venta.
- **Historial de transacciones:** Bitácora inmutable en MongoDB de todas las ventas realizadas, asociadas al cajero en turno, con protección contra alteraciones concurrentes.

### Módulo de Reportes

Módulo analítico estadístico que destila la información transaccional operativa de la cafetería para facilitar la toma de decisiones de la gerencia.

- **Dashboard Estadístico:** Panel visual en el _frontend_ que emplea librerías de gráficos (ej. Chart.js o Recharts) para mostrar las métricas clave en tiempo real.
- **Reportes de Ventas:** Consultas agregadas a MongoDB para extraer ingresos diarios, semanales o mensuales.
- **Rendimiento de Productos:** Identificación automática de los productos más vendidos (ej. Capuchino, Croissants) y los de menor rotación en el menú.
- **Exportación de Datos:** Capacidad para generar y descargar los reportes consolidados por cajero o por turnos en formatos limpios como PDF o Excel, facilitando el arqueo de caja y la contabilidad externa.

## Capa Backend Funcional

El _backend_ de la cafetería está desarrollado en **Node.js** con el _framework_ **Express.js**, actuando como una API RESTful robusta, aislada de la interfaz gráfica y conectada a **MongoDB**. Su arquitectura sigue el patrón MVC (Modelo-Vista-Controlador) adaptado a servicios:

- **Conexión BD:** Implementación de la cadena de conexión segura hacia MongoDB utilizando la librería `mongoose` para el modelado de datos mediante esquemas estructurados.
- **Modelos (`Models`):** Representación orientada a documentos de las entidades principales de la cafetería: `UserSchema` (personal operativo y administrativo), `ProductSchema` (menú), `TableSchema` (mesas) y `OrderSchema` (transacciones/ventas).
- **Controladores (`Controllers`):** Funciones que capturan las peticiones HTTP (GET, POST, PUT, DELETE), procesan la lógica central de ventas y devuelven respuestas estandarizadas en formato JSON.
- **Rutas y Servicios (`Routes/Services`):** Definición ordenada de los _endpoints_ de la API (`/api/orders`, `/api/products`, etc.) extrayendo la lógica de negocio a un nivel de servicio para mantener controladores limpios.
- **Capa de Seguridad (`Middlewares`):** Bloques intermedios que protegen rigurosamente las rutas. Incluyen la verificación de autenticidad mediante la validación y desencriptación de JSON Web Tokens (JWT) y la autorización por niveles (Ej. bloqueando a un Cajero de la ruta de borrado de productos).
- **Validaciones:** Uso de librerías en el _backend_ para verificar la integridad de los _payloads_ antes de interactuar con la base de datos (ej. asegurar que una orden recibida contenga obligatoriamente el ID de una mesa válida y al menos un producto).

## Validación y pruebas del sistema

El sistema asegura la calidad del producto final a través de distintas evaluaciones de estrés y rendimiento:

- **Pruebas unitarias:** Validando que las funciones matemáticas y servicios individuales del _backend_ operen según la lógica.
- **Pruebas funcionales:** Ejecución de casos de uso (Ej: Qué sucede si el usuario ingresa un formato de fecha erróneo).
- **Pruebas de integración:** Ensayos del flujo Cliente hacia la API y hacia la base de datos extremo a extremo.
- **Pruebas de aceptación:** Pruebas finales realizadas con un entorno cercano a la organización para validación definitiva del _Product Owner_.

## Desarrollo del prototipo funcional

A lo largo de los _sprints_ se generan prototipos incrementales. En esta etapa el proyecto expone sus interfaces plenamente interactivas reflejando casos de éxito desde el inicio de sesión (_login_), hasta el registro exitoso de la operación. _(Incluir evidencias y capturas de pantalla reales aquí)_.

## Documentación de Ingeniería Completa

Se acompañan como anexos técnicos o repositorios vinculados:

- **Documentación funcional**

La documentación funcional consolida todos los artefactos producidos durante la fase de análisis y modelado del sistema. Está orientada a servir como referencia oficial para el equipo de desarrollo, el _Product Owner_ y las pruebas de aceptación.

- **Especificación de Requerimientos de Software (SRS)**

La Especificación de Requerimientos de Software documenta de forma estructurada y completa todos los requerimientos identificados para el Sistema POS de Cafetería. Se organiza en las siguientes secciones:

    - **Propósito del sistema:** Desarrollar un Sistema de Punto de Venta (POS) web basado en la arquitectura MERN para digitalizar y centralizar las operaciones de una cafetería en la ciudad de La Paz, eliminando los procesos manuales y garantizando la trazabilidad de cada transacción.

    - **Alcance funcional:** El sistema cubre seis módulos funcionales: Gestión de Ventas y Pedidos (RF-01, RF-08, RF-09, RF-11, RF-12, RF-13, RF-14), Control de Inventario (RF-03, RF-15, RF-16, RF-17, RF-18, RF-19), Gestión de Menú y Productos (RF-05, RF-06, RF-07, RF-10, RF-20, RF-21), Reportes y Toma de Decisiones (RF-04, RF-22, RF-23, RF-24, RF-25), Gestión de Proveedores y Compras (RF-02, RF-26, RF-27, RF-28) y Gestión de Personal y Turnos (RF-29, RF-30, RF-31, RF-32).

    - **Restricciones del sistema:** Plataforma exclusivamente web; autenticación interna sin proveedores OAuth; pagos simulados sin integración bancaria real; sistema monosucursal en su primera versión; sin descuento automático de insumos compuestos. _(Referencia completa en la sección Límites y Alcances del Marco Referencial)._

    - **Requerimientos funcionales:** 32 requerimientos funcionales organizados en 6 módulos, con identificador, descripción, actor responsable y prioridad. _(Referencia: Tablas RF-01 a RF-32 en la sección 3.2)._

    - **Requerimientos no funcionales:** 13 requerimientos no funcionales en las categorías de Rendimiento, Confiabilidad, Seguridad, Disponibilidad, Escalabilidad, Usabilidad y Mantenibilidad. _(Referencia: Tabla RNF-01 a RNF-13 en la sección 3.2)._

- **Relevamiento documentado**

  El relevamiento de información se realizó mediante las siguientes técnicas aplicadas al personal de la cafetería:
  - **Entrevista estructurada al administrador:** Se identificaron los procesos críticos de cobro, control de inventario y generación de reportes. El administrador manifestó la necesidad urgente de eliminar los descuadres de caja diarios y contar con información de ventas en tiempo real.
  - **Observación directa del flujo de servicio:** Se documentó el ciclo completo de atención al cliente: toma de pedido verbal → comanda en papel → preparación → cobro manual → anotación en cuaderno. Se identificaron los puntos de falla más frecuentes: comandas ilegibles, errores de suma y ausencia de trazabilidad.
  - **Revisión del repositorio de referencia:** Se analizó la estructura del repositorio _Restaurant_POS_System_ (amritmaurya1504, GitHub), identificando los módulos implementados: gestión de órdenes en tiempo real, reservas de mesa, autenticación con control de roles, integración de pagos y facturación automática. Estos módulos sirvieron como base para la definición del alcance funcional del presente sistema.

- **Documentación técnica:** El diagrama de la arquitectura desplegada, diccionarios de datos, modelo E/R completo y especificación paramétrica de API.
- **Documentación del sistema:** Manual de usuario para operadores, el manual técnico, directrices de instalación en entorno de servidor y parametrización de variables de entorno.
- **3.10 Documentación del código:** Detalla la estructura de directorios del proyecto MERN y las dependencias utilizadas en el sistema de la cafetería.
  - **Estructura del Proyecto:** Separación física y lógica entre el cliente (aplicación React en el directorio `/frontend`) y el servidor (API Node.js en el directorio `/backend`).
  - **Librerías y Dependencias Backend:** Uso de `express` para el enrutamiento HTTP, `mongoose` como ODM para modelar los datos de MongoDB, `jsonwebtoken` para la generación y firma de tokens de sesión, `bcryptjs` para el hash de contraseñas, y `cors` para habilitar peticiones seguras desde el frontend.
  - **Librerías y Dependencias Frontend:** Uso de `react` para la construcción de interfaces de usuario interactivas del POS, `react-router-dom` para la navegación entre el terminal de cobro y el panel de administración, y `axios` para consumir las rutas RESTful del backend asíncronamente.

\newpage

# Referencias Bibliográficas {-}

<div id="refs"></div>
