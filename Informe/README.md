# Informe: compilación y requisitos

Requisitos mínimos
- Pandoc (>= 2.0)  
- Una distribución TeX con xelatex (MiKTeX o TeX Live)  
- Fuente sans instalada (por ejemplo Calibri o Arial)  
- El archivo de carátula: `caratula/Caratula.pdf` dentro de esta carpeta

Instalación (Windows, opciones rápidas)
- Instalar Pandoc: https://pandoc.org/installing.html  
- Instalar MiKTeX: https://miktex.org/download  (asegura xelatex)  
 alternativa: instalar TeX Live
- Opcional: instalar Calibri o usar otra fuente disponible en el YAML (mainfont/sansfont)

## Uso de Referencias APA v7

El documento genera de manera automática la bibliografía usando el estándar **APA v7**.

- Agrega la información de tus libros y páginas web al archivo **`referencias.bib`** usando formato estándar BibTeX.
- Dentro de tu texto (en `documento_proyecto.md`), haz las referencias usando corchetes y arroba usando el ID de tu cita. Por ejemplo: `[@laudon2020]`.
- **Importante:** Asegúrate de que el documento `apa.csl` se encuentre en la misma carpeta para que le dé el formato oficial.

## Compilar el informe

Ejecutar desde el directorio `Informe`:

```bash
# abre PowerShell o el terminal de VS Code en ...\Proyecto\Informe
pandoc compilacion.md documento_proyecto.md -o documento_proyecto.pdf --number-sections --pdf-engine=xelatex --citeproc
```