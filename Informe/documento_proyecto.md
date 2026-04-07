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

- **Plataforma exclusivamente web:**  
  El sistema será accesible únicamente a través de navegadores web modernos, descartando el desarrollo de aplicaciones móviles nativas (Android/iOS) en esta etapa.

- **Dependencia de conectividad local o a internet:**  
  El sistema requiere conexión a red (LAN o Internet) para operar, ya que la lógica de negocio y la base de datos residen en el servidor. No se contempla un modo offline.

- **Base de datos NoSQL (MongoDB):**  
  Se utilizará una base de datos documental orientada a rendimiento transaccional, sin implementación de motores relacionales tradicionales (SQL).

- **Sistema cerrado de autenticación:**  
  No se integrarán servicios externos de autenticación como Google, Facebook o proveedores OAuth. El acceso será exclusivamente mediante credenciales internas.

- **Pagos simulados (sin integración bancaria real):**  
  En esta versión, los métodos de pago (efectivo, tarjeta) serán registrados de forma lógica sin conexión a pasarelas de pago reales.

- **Sin gestión avanzada de inventario:**  
  El sistema no descontará automáticamente insumos (ej. gramos de café, leche), limitándose al control de productos finales.

- **Monosucursal:**  
  El sistema estará diseñado para una única cafetería, sin soporte inicial para múltiples sucursales.

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

## Análisis del sistema

En base a la recopilación de datos, la estructura organizacional del sistema identifica diversos actores: Administradores, quienes tienen control global; y Operadores, quienes ejecutan diariamente transacciones asociadas a los procesos de negocio. El flujo de procesos demanda digitalizar desde el ingreso del actor al sistema, registro de eventos, hasta la confirmación e impacto histórico.

![Ejemplo de prueba en el análisis del sistema](assets/images/ejemplo.png){#fig:ejemplo_analisis width=65%}

## Determinación de requerimientos

### Requerimientos funcionales

Los requerimientos funcionales expresan lo que el sistema **debe hacer** operativamente.

- **RF01:** El sistema permitirá registrar nuevos usuarios operativos.
- **RF02:** El sistema permitirá a los usuarios iniciar y cerrar sesión de manera segura.
- **RF03:** El sistema permitirá al administrador asignar o revocar roles de acceso.
- **RF04:** El sistema permitirá registrar un nuevo proceso organizacional básico.
- **RF05:** El sistema permitirá el registro consecutivo de transacciones asociadas a un proceso.
- **RF06:** El sistema permitirá generar reportes tabulados basados en un rango de fechas.

### Requerimientos no funcionales

Establecen las restricciones y la forma en cómo debe operar y comportarse estructuralmente la aplicación.

- **Seguridad:** Encriptación de contraseñas usando algoritmos seguros (ej. _bcrypt_) y comunicaciones seguras.
- **Rendimiento:** Tiempos de respuesta para guardado de transacciones menores a 2 segundos en carga moderada.
- **Usabilidad:** Interfaces intuitivas, adaptables a monitores de escritorio (diseño responsivo).
- **Disponibilidad:** Arquitectura preparada para mantener disponibilidad en un entorno de servidor las 24 horas.
- **Escalabilidad:** Separación modular del código que facilite agregar futuros módulos sin modificar el núcleo operativo.

## Modelado del sistema

### Historias de Usuario

Se definen detallando la necesidad y la regla de aceptación:

- _Como_ administrador, _quiero_ registrar y eliminar usuarios _para_ controlar estrictamente el acceso a la plataforma corporativa.
- _Como_ operador de sistemas, _quiero_ registrar una transacción en tiempo de ejecución _para_ avanzar en mi cuota diaria de procesos.

### Diagramas UML

A continuación se muestra un ejemplo genérico de la estructura de un diagrama, en este caso, se deben incrustar aquí los diagramas correspondientes: Diagramas de Casos de Uso, Clases, Secuencia y Actividades generados en herramientas tipo StarUML o Drawio.

\begin{diagrama}[H]
\centering
\includegraphics[width=0.65\linewidth]{assets/diagrama/diagrama.png}
\caption{Ejemplo general de Diagrama Estructural UML}
\label{diag:ejemplo_diagrama}
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

Núcleo central del objeto TPS, diseñado para alta velocidad operativa y baja fricción en la entrada de datos (_Data Entry_).

- **Registro:** Pantallas con autocompletado y validaciones estrictas.
- **Modificación/Consulta:** Vista detallada tipo "maestro-detalle" y bloqueo de interferencias concurrentes en caso de ediciones simultáneas.
- **Historial de operaciones:** Bitácora interna de acciones ("El usuario X anuló la transacción a las 15:42 p.m.").

### Módulo de Reportes

Módulo analítico que destila la información transaccional operativa.

- Generación en memoria del "Reporte estadístico mensual".
- Extracción y consolidación de "Reporte de transacciones por usuario", posibilitando descargas en formatos limpios o impresiones en formato PDF.

## Capa Backend Funcional

El _backend_ es responsable único del procesamiento transaccional aislado de la interfaz gráfica, diseñado bajo principios REST y patrones en capas:

- **Controladores (_Controllers_):** Capturan las peticiones HTTP y manejan la repuesta.
- **Servicios (_Services_):** Contienen puramente la lógica de reglas de negocio organizacionales.
- **Modelos/Entidades (_Models/Entities_):** Representación orientada a objetos de las tablas y procedimientos almacenados.
- **Capa de Seguridad (_Middlewares_):** Componentes intermedios que verifican autenticidad mediante la inspección de cabeceras HTTP antes de conceder cualquier ejecución.
- **Validaciones (_DTOs_):** Objetos de transferencia de datos (_Data Transfer Objects_) que verifican limpiamente los cuerpos de datos (_Payloads_) antes de impactar el Servicio.

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

- **Documentación funcional:** Incluye la Especificación de Requerimientos de Software (SRS), relevamiento documentado explícito e historias de usuario extendidas.
- **Documentación técnica:** El diagrama de la arquitectura desplegada, diccionarios de datos, modelo E/R completo y especificación paramétrica de API.
- **Documentación del sistema:** Manual de usuario para operadores, el manual técnico, directrices de instalación en entorno de servidor y parametrización de variables de entorno.
- **Documentación del código:** Documentación generada automáticamente, estructura arquitectónica base (_Framework_), y lista de librerías vinculadas (_dependencias_).

\newpage

# BIBLIOGRAFÍA

<div id="refs"></div>
