/**
 * Section title translations.
 *
 * RenderCV does not auto-translate section titles — they come directly from
 * the YAML keys. This module provides translations for the conventional
 * English section titles so that switching `locale.language` localizes the
 * rendered section headers automatically.
 *
 * Matching is case-insensitive against the "proper" title form produced by
 * `toProperSectionTitle` (e.g. "skills", "Skills", "SKILLS" all match).
 * Custom titles that don't appear in the map are left untouched.
 */

/** Maps an English section title (lowercase) to its translation per language. */
const sectionTranslations: Record<string, Record<string, string>> = {
  spanish: {
    summary: "Resumen",
    experience: "Experiencia",
    education: "Educación",
    projects: "Proyectos",
    skills: "Habilidades",
    awards: "Premios",
    certifications: "Certificaciones",
    publications: "Publicaciones",
    languages: "Idiomas",
    interests: "Intereses",
    links: "Enlaces",
  },
};

/**
 * Translate a section title for the given locale language, if a translation
 * is known. Returns the original title unchanged when no translation exists.
 */
export function translateSectionTitle(
  title: string,
  language: string,
): string {
  const map = sectionTranslations[language];
  if (!map) return title;

  const key = title.toLowerCase();
  const translated = map[key];
  return translated ?? title;
}
