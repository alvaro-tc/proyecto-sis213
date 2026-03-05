# Constitución de la Empresa

## Tipo de Sociedad
Se elige y justifica la constitución bajo la figura de **Sociedad de Responsabilidad Limitada (S.R.L.)**. 

De acuerdo con la normativa comercial boliviana, este tipo societario es el ideal para nuestra conformación de cuatro socios (profesionales en Ingeniería de Sistemas). Su principal ventaja es que la responsabilidad de los socios queda limitada al monto de sus cuotas de capital, protegiendo el patrimonio personal de cada integrante. Además, bajo el marco normativo del **SEPREC** (para el registro comercial), el **Servicio de Impuestos Nacionales (SIN)** (para obligaciones tributarias) y el **Ministerio de Trabajo, Empleo y Previsión Social** (para regulaciones laborales), la S.R.L. ofrece una estructura organizativa formal pero menos rígida y menos costosa de mantener que una Sociedad Anónima (S.A.), siendo perfecta para una consultora de software emergente, frente a la Empresa Unipersonal que no permite la asociación de múltiples fundadores.

## Misión
Desarrollamos soluciones de software a medida, sistemas web y plataformas de transformación digital para pequeñas y medianas empresas (PYMES) en el Estado Plurinacional de Bolivia. Nuestro trabajo está dirigido a negocios que buscan modernizar sus procesos operativos y administrativos. El valor diferencial que ofrecemos es la integración de arquitecturas tecnológicas modernas, metodologías ágiles y un enfoque profundo en la experiencia del usuario, garantizando productos de alta calidad y un soporte técnico cercano y transparente.

## Visión
En un plazo de 5 a 10 años, queremos posicionarnos como la empresa consultora de desarrollo de software y aseguramiento de calidad más confiable y referente en el occidente de Bolivia, con una presencia consolidada en el mercado nacional y habiendo iniciado la exportación de nuestros servicios tecnológicos y productos propios al mercado internacional sudamericano, impulsando la transformación digital a gran escala.

## Valores Corporativos
* **Innovación:** Adopción constante de nuevas tecnologías y frameworks modernos.
* **Ética profesional:** Integridad, confidencialidad y honestidad en el manejo de datos de nuestros clientes.
* **Calidad:** Rigurosidad técnica en el código y aseguramiento de calidad (QA) en cada entregable.
* **Transparencia:** Comunicación clara sobre alcances, costos y tiempos de desarrollo.
* **Responsabilidad social:** Fomento del talento tecnológico local y creación de soluciones que aporten al crecimiento económico de la región.

# Requisitos Legales para Funcionamiento en Bolivia

Para operar formalmente en la ciudad de La Paz, la consultora seguirá el siguiente procedimiento legal de registro y formalización:

1. **Reserva de nombre comercial ante SEPREC:** Verificación de disponibilidad y reserva del nombre "GRUPO 5 S.R.L." en el portal del Servicio Plurinacional de Registro de Comercio.
2. **Elaboración de minuta de constitución:** Redacción del documento constitutivo y los estatutos sociales de la empresa con el apoyo de un abogado.
3. **Protocolo ante notaría:** Presentación de la minuta ante un Notario de Fe Pública para su elevación a Escritura Pública y obtención del testimonio.
4. **Obtención de Matrícula de Comercio:** Inscripción de la Escritura Pública en SEPREC para obtener la matrícula que habilita el ejercicio legal del comercio.
5. **Registro en el Servicio de Impuestos Nacionales (NIT):** Inscripción en el Padrón Nacional de Contribuyentes del SIN bajo el Régimen General para la dosificación y emisión de facturas.
6. **Registro municipal (Licencia de Funcionamiento):** Trámite ante el Gobierno Autónomo Municipal de La Paz (GAMLP) para autorizar la apertura física de la oficina.
7. **Registro en el Ministerio de Trabajo:** Inscripción en el Registro Obligatorio de Empleadores (ROE) para dar cumplimiento a la normativa sociolaboral vigente.
8. **Afiliación a Caja de Salud y AFP:** Registro patronal en la Caja Nacional de Salud (CNS) para el seguro médico a corto plazo, y en la Gestora Pública para la seguridad social a largo plazo de los empleados.

# Estructura Organizacional

![Organigrama de la Empresa](assets/organigrama_empresa.png){width=80%}

**Descripción de cargos básica:**

* **Gerente General:** (Torrez Calle Alvaro Ariel). Representante legal de la empresa. Encargado de la toma de decisiones estratégicas, gestión financiera, relaciones comerciales y la maximización del valor de los productos (Product Owner).
* **Director Técnico / Líder de Proyecto:** (Maldonado Carvajal Alan Ariel). Responsable de la viabilidad técnica de los proyectos, diseño de arquitectura y de facilitar el marco de trabajo ágil eliminando impedimentos (Scrum Master).
* **Desarrollador Backend / QA:** (Claros Suntura Juan Jose). Encargado del desarrollo de la lógica de negocio, APIs, gestión de base de datos y de la ejecución de pruebas de calidad (QA) para asegurar un software libre de errores.
* **Desarrollador Frontend:** (Lecoña Condori Elias Milan). Responsable del diseño, maquetado y programación de las interfaces de usuario, asegurando una experiencia fluida, responsiva y conectada con los servicios del backend.

# Hojas de Vida (Curriculum Vitae)

*(Se adjuntan a continuación los perfiles profesionales de los integrantes del equipo en formato de consultoría, incluyendo datos generales, formación académica, experiencia, certificaciones, competencias técnicas y firma digital).*

\includepdf[pages=-, pagecommand={\thispagestyle{plain}}, scale=0.85]{assets/cv_juan.pdf}
\includepdf[pages=-, pagecommand={\thispagestyle{plain}}, scale=0.85]{assets/cv_elias.pdf}
\includepdf[pages=-, pagecommand={\thispagestyle{plain}}, scale=0.85]{assets/cv_alan.pdf}
\includepdf[pages=-, pagecommand={\thispagestyle{plain}}, scale=0.85]{assets/cv_alvaro.pdf}

\newpage

# Propuesta de Proyecto de Software

## Nombre del Proyecto
**Sistema Web POS (Punto de Venta) y Gestión para Cafeterías**

## Descripción del Problema
Las cafeterías y negocios gastronómicos medianos en La Paz enfrentan demoras y desorganización al gestionar pedidos de manera manual o con sistemas obsoletos. Esto genera errores en las comandas, pérdida de tiempo en la asignación de mesas, dificultades para unificar métodos de pago y una deficiente emisión de recibos. La falta de un flujo digital centralizado impacta negativamente en la experiencia del cliente y en el control administrativo del negocio.

## Objetivo General
Desarrollar un sistema web de Punto de Venta (POS) para optimizar la gestión de pedidos, administración de mesas y facturación en cafeterías.

## Objetivos Específicos
* **Desarrollar** un módulo de gestión de pedidos en tiempo real para agilizar la atención al cliente mediante interfaces táctiles dinámicas.
* **Diseñar** un sistema de control de acceso y roles para garantizar la seguridad de la información mediante autenticación con JSON Web Tokens (JWT).
* **Implementar** un módulo de gestión de mesas y reservas para mejorar la organización del flujo de clientes mediante un panel visual de estados.
* **Integrar** un módulo de facturación básica para automatizar el cobro y la generación de recibos detallados utilizando herramientas de generación de reportes en PDF.

## Alcance del Proyecto
**Qué incluye el proyecto:**

* Módulo de Punto de Venta (POS) interactivo para la toma de pedidos.
* Gestión de estados de órdenes (en preparación, servido, pagado).
* Administración visual de mesas y reservas.
* Autenticación segura con roles definidos (Administrador, Cajero, Mesero).
* Generación de cuentas, facturación básica e integración de métodos de pago simulados (pasarela estándar).
* Panel administrativo para el registro de productos del menú.

**Qué NO incluye el proyecto:**

* Desarrollo de aplicaciones móviles nativas para iOS/Android.
* Gestión avanzada de inventario (kardex) o proveedores.
* Integración con plataformas de delivery de terceros (PedidosYa, Yango, etc.).
* Impresión directa en controladores fiscales de hardware (requiere configuración manual del cliente).

## Metodología de Desarrollo

Se utilizará el marco de trabajo **Scrum** para garantizar entregas funcionales de manera iterativa e incremental.

* **Product Owner:** (Torrez) Define y prioriza el Product Backlog según el valor para la cafetería.
* **Scrum Master:** (Maldonado) Facilita las ceremonias (Sprint Planning, Daily, Review, Retrospective) y elimina obstáculos.
* **Equipo de Desarrollo:** (Claros, Lecoña) Encargados de la codificación, diseño y pruebas.

## Cronograma Tentativo (4 meses)

\begin{longtable}{|p{2.5cm}|p{6cm}|p{2cm}|}
\hline
\rowcolor{headerblue} \bfseries \color{white} Fases & \bfseries \color{white} Entregables & \bfseries \color{white} Duración \\ \hline
\endhead
\textbf{Mes 1: Inicio y Diseño} & Levantamiento de requerimientos, diseño de UI/UX y arquitectura de base de datos. & 4 Semanas \\ \hline
\textbf{Mes 2: Backend y Auth} & APIs RESTful construidas, roles configurados y autenticación JWT implementada. & 4 Semanas \\ \hline
\textbf{Mes 3: Frontend y POS} & Interfaces de POS táctil, gestión de mesas e integración de pedidos en tiempo real. & 4 Semanas \\ \hline
\textbf{Mes 4: Cierre} & Generación de facturas, pruebas de QA, despliegue en la nube y capacitación. & 4 Semanas \\ \hline
\end{longtable}

## Presupuesto Estimado
Se ha estimado el esfuerzo aplicando la medición de **Puntos de Función COSMIC**, evaluando movimientos de datos (Entradas, Salidas, Lecturas y Escrituras) en los módulos principales, expresado en moneda nacional (Bs).

\begin{longtable}{|p{7cm}|p{4cm}|}
\hline
\rowcolor{headerblue} \bfseries \color{white} Concepto & \bfseries \color{white} Costo Estimado (Bs) \\ \hline
\endhead
\textbf{Costos de desarrollo} (Aprox. 110 CFP x factor técnico) & 42,000.00 Bs \\ \hline
\textbf{Infraestructura} (Servidor Cloud, Dominio - 1 año) & 2,500.00 Bs \\ \hline
\textbf{Licencias} (Software, assets UI) & 1,200.00 Bs \\ \hline
\textbf{Soporte y Mantenimiento} (3 meses post-despliegue) & 5,000.00 Bs \\ \hline
\textbf{Costo Total Estimado} & \textbf{50,700.00 Bs} \\ \hline
\end{longtable}

## Arquitectura Tecnológica Propuesta
Para este sistema se propone el uso del Stack MERN, garantizando un rendimiento óptimo y alta escalabilidad:
* **Backend:** Node.js con el framework Express.js (manejo eficiente de peticiones asíncronas y APIs RESTful).
* **Base de datos:** MongoDB (Base de datos NoSQL altamente flexible para catálogos de productos y órdenes).
* **Frontend:** React.js con Tailwind CSS y Redux Toolkit (para un manejo de estado global eficiente e interfaces reactivas).
* **Despliegue en la nube:** AWS (Amazon Web Services) o DigitalOcean, apoyado por contenedores Docker para facilitar la portabilidad.

# Análisis FODA Empresarial

* **Fortalezas:**
  * Dominio experto de tecnologías modernas y altamente demandadas (Stack MERN).
  * Enfoque ágil que permite la adaptabilidad frente a cambios de requerimientos del cliente.
  * Especialización en interfaces modernas, fluidas y orientadas a la experiencia del usuario (UX).
* **Oportunidades:**
  * Alta necesidad de modernización y digitalización en el creciente sector gastronómico de La Paz.
  * Oportunidad de escalar el software desarrollado a un modelo de negocio SaaS (Software as a Service) para múltiples clientes.
* **Debilidades:**
  * Al ser una empresa de reciente creación, carecemos de un portafolio extenso que certifique proyectos previos a gran escala.
  * Recursos financieros limitados para competir en marketing contra consultoras consolidadas.
* **Amenazas:**
  * Presencia de software de punto de venta (POS) genérico internacional a precios muy bajos.
  * Inestabilidad económica local que pueda frenar la inversión tecnológica por parte de las PYMES.