---
geometry: "top=2.5cm, bottom=2.5cm, left=3cm, right=2.5cm"
fontsize: 12pt
papersize: letter
mainfont: "Arial"
sansfont: "Arial"
monofont: "Consolas"
linestretch: 1.5
header-includes: |
  \usepackage{pdfpages}
  \usepackage{float}
  \usepackage{longtable}
  \usepackage{array}
  \usepackage[table]{xcolor}
  \definecolor{headerblue}{RGB}{50, 100, 160}
  \setlength{\arrayrulewidth}{1pt}
  \arrayrulecolor{black}
  \setlength{\tabcolsep}{8pt}
  \renewcommand{\arraystretch}{1.5}
  \let\origfigure\figure
  \let\endorigfigure\endfigure
  \renewenvironment{figure}[1][2] {
      \expandafter\origfigure\expandafter[H]
  } {
      \endorigfigure
  }
  \newfloat{diagrama}{H}{lod}
  \floatname{diagrama}{Diagrama}
  \usepackage{caption}
  \captionsetup[table]{name=Tabla,labelfont=bf}
  \captionsetup[figure]{name=Figura,labelfont=bf}
  \usepackage{tocloft}
  \setcounter{tocdepth}{3}
  \setcounter{secnumdepth}{3}
  \renewcommand{\cftsecfont}{\bfseries}
  \renewcommand{\cftsecpagefont}{\bfseries}
  \renewcommand{\cftsecpresnum}{Capítulo }
  \renewcommand{\cftsecaftersnum}{.}
  \setlength{\cftsecnumwidth}{5.5em}
  \usepackage{titlesec}
  \newcommand{\sectionbreak}{}
  \titleformat{\section}{\Large\bfseries}{Capítulo \thesection.}{0.5em}{}
  \titleformat{\subsection}{\large\bfseries}{\thesubsection}{1em}{}
  \titleformat{\subsubsection}{\normalsize\bfseries}{\thesubsubsection}{1em}{}
  \renewcommand{\familydefault}{\sfdefault}
  \usepackage{fancyhdr}
  \pagestyle{fancy}
  \fancyhf{}
  \fancyfoot[R]{\thepage}
  \renewcommand*{\headrulewidth}{0pt}
  \renewcommand*{\footrulewidth}{0pt}
  \fancypagestyle{plain}{
    \fancyhf{}
    \fancyfoot[R]{\thepage}
  }
---

\includepdf[pages=1]{caratula/Caratula.pdf}

\newpage
\pagenumbering{roman}
\pagestyle{fancy}

\begin{center}
\Large\textbf{Índice General}
\end{center}

\renewcommand{\contentsname}{}
\tableofcontents

\newpage

\begin{center}
\Large\textbf{Índice de Figuras, Tablas y Diagramas}
\end{center}

\vspace{0.6cm}
**Figuras**
\vspace{-1.5em}

\renewcommand{\listfigurename}{}
\listoffigures

\vspace{0.8cm}
**Tablas**
\vspace{-1.5em}

\renewcommand{\listtablename}{}
\listoftables

\vspace{0.8cm}
**Diagramas**
\vspace{-1.5em}

\listof{diagrama}{}

\newpage
\pagenumbering{arabic}
\setcounter{page}{1}

\renewcommand{\sectionbreak}{\clearpage\thispagestyle{plain}}