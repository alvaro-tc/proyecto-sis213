# MARCO REFERENCIAL DEL SISTEMA TPS

## Introducción

En el contexto actual de la transformación digital, las organizaciones de todo tamaño enfrentan la necesidad imperiosa de modernizar sus procesos operativos. Los Sistemas de Información Organizacional (SIO) han emergido como la respuesta tecnológica a esta necesidad, permitiendo a las empresas capturar, procesar y distribuir información de manera eficiente, precisa y centralizada. Dentro de esta categoría, los Sistemas de Procesamiento de Transacciones (TPS, por sus siglas en inglés — _Transaction Processing Systems_) representan el eslabón más fundamental: son la capa operativa que registra y procesa cada evento del negocio en tiempo real, constituyendo la base sobre la que se construyen todos los demás niveles de información organizacional.

La evolución histórica de los TPS es un reflejo directo del avance tecnológico. En sus orígenes, durante las décadas de 1960 y 1970, estos sistemas operaban en mainframes centralizados con procesamiento por lotes (_batch processing_), donde las transacciones se acumulaban y procesaban en diferido. Con la llegada de las redes de computadoras y, posteriormente, de Internet, los TPS evolucionaron hacia arquitecturas distribuidas de procesamiento en línea (_OLTP — Online Transaction Processing_), capaces de manejar miles de transacciones concurrentes con tiempos de respuesta de milisegundos. Hoy en día, la adopción de arquitecturas web modernas basadas en _stacks_ como MERN (MongoDB, Express.js, React.js, Node.js) ha democratizado la implementación de TPS robustos, haciéndolos accesibles incluso para pequeñas y medianas empresas que anteriormente no podían costear soluciones de este tipo.

En este marco, el presente proyecto propone el desarrollo de un Sistema de Información Organizacional Web basado en el enfoque TPS, orientado específicamente a la gestión integral de una cafetería en la ciudad de La Paz, Bolivia. El sistema, concebido como un Punto de Venta (_Point of Sale_ — POS) web, tiene por objetivo digitalizar y centralizar los procesos críticos del negocio: la toma y seguimiento de órdenes por mesa, la administración del catálogo de productos, el control de acceso diferenciado por roles de usuario, el procesamiento de cobros y la generación automatizada de reportes financieros. La solución busca reemplazar los procesos manuales actualmente vigentes — basados en libretas de papel, cálculos mentales y ausencia total de trazabilidad — por una plataforma tecnológica accesible, segura y escalable que eleve la eficiencia operativa del establecimiento.

## Antecedentes

### Antecedentes del objeto de estudio

El objeto de estudio del presente proyecto es una cafetería de tamaño mediano en la ciudad de La Paz, Bolivia, que actualmente opera sus procesos de atención y venta de manera completamente manual. Este escenario, lejos de ser un caso aislado, refleja la realidad predominante en el sector gastronómico local, donde la adopción de tecnologías de gestión sigue siendo incipiente.

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
\includegraphics[width=0.85\linewidth]{assets/diagrama/arquitectura_mern.jpg}
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

Un Sistema de Información Organizacional (SIO) es un conjunto integrado de componentes — personas, procesos, datos, _hardware_ y _software_ — diseñado para recolectar, almacenar, procesar y distribuir información que apoye la coordinación, el control, el análisis y la toma de decisiones dentro de una organización (Laudon & Laudon, 2020). A diferencia de un simple programa informático, un SIO está profundamente imbricado con los procesos de negocio de la organización: define cómo fluye la información entre los actores, cuándo se captura, cómo se transforma y quién tiene acceso a ella.

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

Un Sistema de Procesamiento de Transacciones es un tipo especializado de SIO diseñado para capturar, procesar, validar y almacenar las transacciones operativas de una organización de forma inmediata, confiable y a gran escala (O'Brien & Marakas, 2011). En el contexto del negocio, una **transacción** se define como cualquier evento discreto que modifica el estado de los datos del sistema y que debe quedar registrado de forma permanente e inalterable: el registro de una venta, la creación de una orden, el cobro de una cuenta o la modificación del catálogo de productos.

### Características

Los TPS se distinguen de otros tipos de sistemas de información por un conjunto de atributos técnicos y funcionales que los hacen aptos para el procesamiento operativo de alto volumen:

- **Procesamiento en tiempo real (_OLTP_):** A diferencia del procesamiento por lotes (_batch_), los TPS modernos procesan cada transacción en el instante en que se produce, actualizando la base de datos de forma inmediata y reflejando el estado actual del negocio en todo momento.
- **Alta confiabilidad y disponibilidad:** Un TPS para un punto de venta debe estar disponible durante todo el horario operativo del negocio. La indisponibilidad del sistema implica la parálisis del servicio al cliente.
- **Integridad transaccional (propiedades ACID):** Toda transacción en un TPS debe cumplir las propiedades de Atomicidad (la transacción se ejecuta completa o no se ejecuta), Consistencia (el sistema pasa de un estado válido a otro estado válido), Aislamiento (las transacciones concurrentes no interfieren entre sí) y Durabilidad (una transacción confirmada persiste incluso ante fallos del sistema).
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

La arquitectura del sistema POS se basa en el modelo Cliente–Servidor, una de las estructuras más utilizadas en aplicaciones web modernas por su capacidad de separación de responsabilidades, escalabilidad y mantenimiento.

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

Se descartan las sesiones tradicionales. El sistema implementa JSON Web Tokens (JWT). Tras validar credenciales (contraseñas previamente procesadas con funciones criptográficas unidireccionales de _hash_, como _bcrypt_), el _backend_ emite un token firmado. Este token viaja en las cabeceras HTTP de cada petición del cliente, garantizando que el usuario es quien dice ser sin consultar la base de datos reiteradamente.

### Autorización

La autorización asegura que un usuario autenticado solo pueda realizar las acciones para las que está facultado. Se ejecuta verificando los niveles de privilegio incrustados y firmados criptográficamente en el token antes de responder a una petición.

### Roles

El modelo de datos incluye una propiedad rígida de "Rol" (ej. Administrador, Cajero). Este mecanismo se implementa mediante _Middlewares_ (bloques de código intermedios en el _backend_) que desencriptan el _payload_ del token y rechazan con un error 403 (Prohibido) cualquier intento de un Cajero de acceder a las rutas de eliminación de usuarios o reportes gerenciales.

### Control de acceso

Tanto a nivel de la interfaz (ocultando botones de configuración a cajeros) como a nivel de capa de datos, se aplican políticas estrictas para evitar inyecciones maliciosas o robo de sesiones, blindando el flujo desde que se presiona "Cobrar" hasta que la información reposa en el disco.

## Base de datos

El diseño de la persistencia de datos constituye el corazón del sistema, siendo responsabilidad directa de la ingeniería de datos modelar la información de la cafetería para que sea escalable, rápida y matemáticamente exacta.

### Modelo relacional

Aunque tecnologías modernas como la pila MERN utilicen modelos NoSQL orientados a documentos para optimizar la velocidad transaccional, los principios lógicos relacionales son ineludibles en un TPS. Las entidades maestras se identifican y separan claramente: `Usuarios` (Personal), `Categorías` (Clasificación del menú), `Productos` (Ítems de venta) y `Facturas/Órdenes` (Registro de la transacción). Se definen llaves referenciales explícitas entre ellas para establecer cardinalidad (ej. un cajero realiza muchas ventas, una orden contiene múltiples productos).

### Integridad

Los principios lógicos de integridad se mantienen ineludibles mediante el uso de esquemas de validación estrictos (como _Mongoose_ en el caso de la pila seleccionada). Estos esquemas garantizan la exactitud de los tipos de datos ingresados y previenen la inserción de documentos huérfanos o con información financiera incompleta.

### Normalización

Se aplican reglas de normalización para evitar anomalías; por ejemplo, la información del perfil del usuario o la descripción detallada de un producto no se repiten innecesariamente. Sin embargo, por requerimientos de diseño de un POS y para proteger la contabilidad, se realiza una desnormalización controlada en las `Órdenes`: al registrar una venta, el precio exacto actual del producto se copia de forma fija dentro de la orden. Esto garantiza que la información histórica sea inmutable frente a futuros cambios de precios en el catálogo.

### Transacciones

En el entorno TPS, una transacción es indivisible. Registrar una venta implica: calcular totales, insertar la orden, asociar el método de pago y actualizar la disponibilidad de la mesa. El motor de la base de datos se configura para garantizar atomicidad (Principios ACID), asegurando que si ocurre un fallo de red a la mitad del proceso, la base de datos ejecute un _Rollback_ (reversión completa de los pasos previos), previniendo que existan "ventas a medias" o corrupciones en los arqueos de caja.

## Metodología de desarrollo

### Scrum

Es un marco de trabajo ágil para el desarrollo, entrega y mantenimiento de productos complejos, definido en la _Scrum Guide_. Se fundamenta en tres pilares empíricos: transparencia, inspección y adaptación. Para el Sistema POS de Cafetería, Scrum es la elección metodológica óptima porque permite iterar rápidamente y ajustar requerimientos de acuerdo a la retroalimentación del cliente.

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

\begingroup\small
\begin{longtable}{|p{3.5cm}|p{1.5cm}|p{3.2cm}|p{5.5cm}|}
\hline
\rowcolor{headerblue} \bfseries \color{white} Campo (Documento JSON) & \bfseries \color{white} Tipo & \bfseries \color{white} Validaciones / Vínculos & \bfseries \color{white} Descripción \\ \hline
\endhead
\_id & ObjectId & Único (PK lógica) & Identificador nativo de MongoDB para la factura. \\ \hline
usuario_id & ObjectId & Ref: 'Usuario' & ID del cajero responsable de cobrar la orden. \\ \hline
mesa_asignada & String/Int & Requerido & Mesa física vinculada al pedido. \\ \hline
cartItems & Array & Contiene Objetos & Arreglo desnormalizado con los productos, cantidades y precios exactos en el momento de venta. \\ \hline
total_pagado & Number & Mínimo 0 & Monto económico final calculado y liquidado. \\ \hline
\caption{Diccionario para colección de Órdenes (Base de Datos)}
\label{tab:diccionario_bd}
\end{longtable}
\endgroup

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
