/**
 * Spanish translations for the app UI.
 *
 * Keys are the English source strings (gettext-style). {placeholders} are
 * interpolated at render time. Only UI chrome is translated here — the
 * PDF's language is controlled by the `locale:` section of the YAML and is
 * intentionally unrelated.
 */
export const es: Record<string, string> = {
  // ── Header ──────────────────────────────────────────────────────────
  "compiling…": "compilando…",
  "1 error": "1 error",
  "{n} errors": "{n} errores",
  "0 errors · ready to compile": "0 errores · listo para compilar",
  "· match {n}%": "· {n}% de compatibilidad",
  "Import": "Importar",
  "Import YAML": "Importar YAML",
  "Download YAML": "Descargar YAML",
  "Download PDF": "Descargar PDF",
  "Language": "Idioma",

  // ── Editor tabs / form banner ───────────────────────────────────────
  "Form": "Formulario",
  "Switch to YAML editor": "Cambiar al editor YAML",
  "This YAML uses anchors/aliases inside cv:. The form is read-only to avoid corrupting it. Edit the YAML directly.":
    "Este YAML usa anchors/aliases dentro de cv:. El formulario es de solo lectura para evitar corromperlo. Edita el YAML directamente.",

  // ── Error panel ─────────────────────────────────────────────────────
  "error": "error",
  "errors": "errores",
  "syntax": "sintaxis",
  "schema": "esquema",
  "entry": "entrada",
  "entries": "entradas",

  // ── Basics card ─────────────────────────────────────────────────────
  "Header": "Encabezado",
  "Name": "Nombre",
  "Headline": "Titular",
  "Location": "Ubicación",
  "Email": "Email",
  "Phone": "Teléfono",
  "Website": "Sitio web",
  "Photo (URL or base64)": "Foto (URL o base64)",
  "Jane Doe": "María García",
  "Software Engineer": "Ingeniera de software",
  "San Francisco, CA": "Madrid, España",
  "jane@example.com": "maria@ejemplo.com",
  "+1 555 555 5555": "+34 600 000 000",
  "https://jane.com": "https://maria.es",
  "https://… or data:image/…": "https://… o data:image/…",

  // ── Connections card ────────────────────────────────────────────────
  "Connections": "Conexiones",
  "Social networks": "Redes sociales",
  "+ Add": "+ Añadir",
  "No social networks.": "Sin redes sociales.",
  "Custom connections": "Conexiones personalizadas",
  "No custom connections.": "Sin conexiones personalizadas.",
  "username": "usuario",
  "Font Awesome icon (e.g. fa-globe)": "Icono Font Awesome (ej. fa-globe)",
  "Placeholder text": "Texto del enlace",
  "URL (optional)": "URL (opcional)",
  "Remove": "Eliminar",

  // ── Sections card ───────────────────────────────────────────────────
  "Sections": "Secciones",
  "1 entry": "1 entrada",
  "{n} entries": "{n} entradas",
  "Move section up": "Subir sección",
  "Move section down": "Bajar sección",
  "Rename section": "Renombrar sección",
  "Delete section": "Eliminar sección",
  'Delete section "{title}"?': '¿Eliminar la sección "{title}"?',
  'A section named "{title}" already exists.':
    'Ya existe una sección llamada "{title}".',
  "Save": "Guardar",
  "Cancel": "Cancelar",
  "type:": "tipo:",
  "Move up": "Subir",
  "Move down": "Bajar",
  "Duplicate": "Duplicar",
  "Delete": "Eliminar",
  "+ Add entry": "+ Añadir entrada",
  "+ Add section": "+ Añadir sección",
  "Add section": "Añadir sección",
  "Section title (e.g. Experience)": "Título de la sección (ej. Experiencia)",

  // ── Entry fields (entry-fields.ts labels & hints) ───────────────────
  "Company": "Empresa",
  "Position": "Puesto",
  "Start date": "Fecha de inicio",
  "End date": "Fecha de fin",
  "Date (single)": "Fecha (única)",
  "Overrides start/end": "Sustituye a inicio/fin",
  "Summary": "Resumen",
  "Highlights": "Puntos destacados",
  "Institution": "Institución",
  "Area (field of study)": "Área (campo de estudio)",
  "Degree": "Título",
  "Date": "Fecha",
  "Authors": "Autores",
  "Journal": "Revista",
  "Bullet text": "Texto de la viñeta",
  "Label": "Etiqueta",
  "Details": "Detalles",
  "Number / text": "Número / texto",
  "Text": "Texto",
  "Title": "Título",
  "Must start with '10.'": "Debe empezar por '10.'",
  '"present" for current': '"present" para el actual',
  "Plain text entry…": "Entrada de texto simple…",

  // Entry type labels
  "Experience (company + position)": "Experiencia (empresa + puesto)",
  "Education (institution + area)": "Educación (institución + área)",
  "Normal (name)": "Normal (nombre)",
  "Publication (title + authors)": "Publicación (título + autores)",
  "Bullet (single bullet)": "Viñeta (viñeta única)",
  "One-line (label + details)": "Una línea (etiqueta + detalles)",
  "Numbered (number)": "Numerada (número)",
  "Reversed numbered": "Numerada inversa",
  "Text (plain strings)": "Texto (cadenas simples)",

  // ── Generic field widgets ───────────────────────────────────────────
  "+ Add item": "+ Añadir",
  "Pick a color": "Elegir color",

  // ── Design card ─────────────────────────────────────────────────────
  "PDF Design": "Diseño del PDF",
  "The design: section uses anchors/aliases. Edit it in the YAML editor.":
    "La sección design: usa anchors/aliases. Edítala en el editor YAML.",
  "Theme": "Tema",
  "Page": "Página",
  "Page size": "Tamaño de página",
  "Top margin": "Margen superior",
  "Bottom margin": "Margen inferior",
  "Left margin": "Margen izquierdo",
  "Right margin": "Margen derecho",
  "Show footer": "Mostrar pie de página",
  "Show top note": "Mostrar nota superior",
  "Colors": "Colores",
  "Body text": "Texto",
  "Footer": "Pie de página",
  "Top note": "Nota superior",
  "Typography": "Tipografía",
  "Body alignment": "Alineación del texto",
  "Date/location align": "Alineación fecha/ubicación",
  "Line spacing": "Interlineado",
  "Font family": "Familia tipográfica",
  "Font size": "Tamaño de fuente",
  "Body": "Texto",
  "Bold": "Negrita",
  "Small caps": "Versalitas",
  "Header layout": "Encabezado",
  "Alignment": "Alineación",
  "Photo position": "Posición de la foto",
  "Photo width": "Ancho de la foto",
  "Photo space left": "Espacio a la izquierda de la foto",
  "Photo space right": "Espacio a la derecha de la foto",
  "Space below name": "Espacio bajo el nombre",
  "Space below headline": "Espacio bajo el titular",
  "Space below connections": "Espacio bajo las conexiones",
  "Phone format": "Formato de teléfono",
  "Separator": "Separador",
  "Space between": "Espacio entre",
  "Show icons": "Mostrar iconos",
  "Hyperlink": "Hipervínculo",
  "Show URLs instead of usernames": "Mostrar URLs en vez de usuarios",
  "Empty = theme default separator": "Vacío = separador por defecto del tema",
  "Section titles": "Títulos de sección",
  "Style": "Estilo",
  "Line thickness": "Grosor de línea",
  "Space above": "Espacio superior",
  "Space below": "Espacio inferior",
  "Space between entries": "Espacio entre entradas",
  "Space between text entries": "Espacio entre entradas de texto",
  "Allow page break inside sections":
    "Permitir salto de página dentro de las secciones",
  "Show time spans in": "Mostrar duración en",
  "e.g. experience": "p. ej. experience",
  "Section keys whose entries show a duration":
    "Claves de sección cuyas entradas muestran duración",
  "Entries": "Entradas",
  "Date/location width": "Ancho fecha/ubicación",
  "Side space": "Espacio lateral",
  "Space between columns": "Espacio entre columnas",
  "Degree column width": "Ancho de columna de título",
  "Allow page break inside entries":
    "Permitir salto de página dentro de las entradas",
  "Short second row": "Segunda fila corta",
  "Summary space above": "Espacio superior del resumen",
  "Summary space left": "Espacio izquierdo del resumen",
  "Bullet": "Viñeta",
  "Nested bullet": "Viñeta anidada",
  "Space left": "Espacio izquierdo",
  "Between items": "Entre ítems",
  "Bullet ↔ text": "Viñeta ↔ texto",
  "Links": "Enlaces",
  "Underline links": "Subrayar enlaces",
  "External link icon": "Icono de enlace externo",
  "Templates": "Plantillas",
  "Placeholders like NAME, DATE, PAGE_NUMBER. Empty resets to the theme default.":
    "Marcadores como NAME, DATE, PAGE_NUMBER. Vacío restaura el valor del tema.",
  "Single date": "Fecha única",
  "Date range": "Rango de fechas",
  "Time span": "Duración",
  "Experience entry": "Entrada de experiencia",
  "Education entry": "Entrada de educación",
  "Normal entry": "Entrada normal",
  "Publication entry": "Entrada de publicación",
  "One-line entry": "Entrada de una línea",
  "main column": "columna principal",
  "degree column": "columna de título",
  "date and location column": "columna de fecha/ubicación",

  // ── PDF preview ─────────────────────────────────────────────────────
  "# preview": "# vista previa",
  "# compilation error": "# error de compilación",
  "# fix YAML errors to see the preview":
    "# corrige los errores del YAML para ver la vista previa",
  "# failed to render preview:":
    "# error al renderizar la vista previa:",
  "# loading typst compiler, first load may take a few seconds…":
    "# cargando el compilador de typst, la primera carga puede tardar unos segundos…",
  "# your cv preview will appear here":
    "# la vista previa de tu cv aparecerá aquí",
  "Failed to load PDF.": "Error al cargar el PDF.",

  // ── Job matcher ─────────────────────────────────────────────────────
  "# job matcher": "# Match con el puesto",
  "Matcher": "Match",
  "Show Job Matcher": "Mostrar match",
  "# paste job description": "# pega la descripción del empleo",
  "Paste the full job description here...":
    "Pega aquí la descripción completa del empleo...",
  "Analyze": "Analizar",
  "Clear": "Limpiar",
  "# paste a job description and click Analyze to see how your CV matches.":
    "# pega una descripción de empleo y pulsa Analizar para ver la compatibilidad de tu CV.",
  "# compatibility": "# compatibilidad",
  "{matched} of {total} keywords matched":
    "{matched} de {total} palabras clave coincidentes",
  "✓ Matched": "✓ Coinciden",
  "✗ Missing": "✗ Faltan",
  "Copy missing": "Copiar faltantes",
  "Copied!": "¡Copiado!",
  "# suggestions": "# sugerencias",
  "# no recognizable keywords found in the job description. Try pasting a more detailed description.":
    "# no se encontraron palabras clave reconocibles en la descripción del empleo. Prueba con una descripción más detallada.",
  "Languages": "Lenguajes",
  "Frameworks": "Frameworks",
  "Databases": "Bases de datos",
  "Infrastructure": "Infraestructura",
  "Tools": "Herramientas",
  "Methodologies": "Metodologías",
  "Soft Skills": "Habilidades blandas",
  "Found in:": "Encontrado en:",
  "Skills": "Habilidades",
  "Experience": "Experiencia",
  "Projects": "Proyectos",

  // Suggestion reason templates ({keyword} interpolated)
  'Add "{keyword}" to your Skills section.':
    'Añade "{keyword}" a tu sección de Habilidades.',
  'Mention "{keyword}" in a highlight under your Experience section.':
    'Menciona "{keyword}" en un punto destacado de tu sección de Experiencia.',
  'Reference "{keyword}" in a project description.':
    'Referencia "{keyword}" en la descripción de un proyecto.',
  'Create a Skills section and add "{keyword}".':
    'Crea una sección de Habilidades y añade "{keyword}".',
  'Demonstrate "{keyword}" through a concrete achievement in your Experience section.':
    'Demuestra "{keyword}" con un logro concreto en tu sección de Experiencia.',
  'Mention "{keyword}" in a summary or objective statement.':
    'Menciona "{keyword}" en un resumen u objetivo.',

  // ── App shell ───────────────────────────────────────────────────────
  "Edit": "Editar",
  "Preview": "Vista previa",
  "# independent project, compatible with RenderCV YAML":
    "# proyecto independiente, compatible con el YAML de RenderCV",
  "CV for all — Free YAML CV Generator":
    "CV for all — Generador de CV en YAML gratuito",
};
