/**
 * Preamble generator — produces the Typst preamble that imports
 * @preview/rendercv and configures all design options.
 *
 * Ported from RenderCV's Preamble.j2.typ template.
 */
import type { ProcessedModel } from "@/typst/model-processor";
import { toTypstBool } from "@/typst/string-utils";

/**
 * Map full language names to ISO 639-1/2/3 codes for Typst.
 * Typst's locale-catalog-language expects 2-3 letter codes.
 */
const languageToIsoCode: Record<string, string> = {
  english: "en",
  spanish: "es",
  french: "fr",
  german: "de",
  italian: "it",
  portuguese: "pt",
  dutch: "nl",
  russian: "ru",
  chinese: "zh",
  japanese: "ja",
  korean: "ko",
  arabic: "ar",
  hebrew: "he",
  persian: "fa",
  urdu: "ur",
  turkish: "tr",
  polish: "pl",
  swedish: "sv",
  norwegian: "no",
  danish: "da",
  finnish: "fi",
  czech: "cs",
  greek: "el",
  hindi: "hi",
  bengali: "bn",
  thai: "th",
  vietnamese: "vi",
  indonesian: "id",
  malay: "ms",
  ukrainian: "uk",
  romanian: "ro",
  hungarian: "hu",
  slovak: "sk",
  bulgarian: "bg",
  croatian: "hr",
  serbian: "sr",
  slovenian: "sl",
  lithuanian: "lt",
  latvian: "lv",
  estonian: "et",
  icelandic: "is",
  catalan: "ca",
  basque: "eu",
  galician: "gl",
  welsh: "cy",
  irish: "ga",
  scottish: "gd",
  breton: "br",
  corsican: "co",
  occitan: "oc",
  piedmontese: "pms",
  asturian: "ast",
  aragonese: "an",
  esperanto: "eo",
  latin: "la",
};

/** Default font available in the WASM compiler (no Source Sans 3 bundled). */
const DEFAULT_FONT = "Libertinus Serif";

/**
 * Generate the Typst preamble from the processed model.
 *
 * This imports the @preview/rendercv package and applies the rendercv
 * template with all design configuration (page, colors, typography, etc.).
 */
export function generatePreamble(model: ProcessedModel): string {
  const { design, locale, plainName, footer, topNote, pdfTitle, currentDate } = model;

  const lines: string[] = [];
  lines.push('// Import the rendercv function and all the refactored components');
  lines.push('#import "@preview/rendercv:0.3.0": *');
  lines.push('');
  lines.push('// Apply the rendercv template with custom configuration');
  lines.push('#show: rendercv.with(');

  // Header fields
  lines.push(`  name: "${escapeTypstString(plainName)}",`);
  lines.push(`  title: "${escapeTypstString(pdfTitle)}",`);
  lines.push(`  footer: ${footer},`);
  lines.push(`  top-note: [ ${topNote} ],`);

  // Locale — Typst expects ISO 639-1/2/3 codes, not full language names
  const langName = locale.language ?? "english";
  const isoCode = languageToIsoCode[langName] ?? "en";
  lines.push(`  locale-catalog-language: "${isoCode}",`);
  // RTL detection (arabic, hebrew, persian, etc.)
  const rtlLanguages = ["arabic", "hebrew", "persian", "urdu"];
  const isRtl = rtlLanguages.includes(langName);
  lines.push(`  text-direction: ${isRtl ? "rtl" : "ltr"},`);

  // Page
  lines.push(`  page-size: "${design.page?.size ?? "us-letter"}",`);
  lines.push(`  page-top-margin: ${design.page?.top_margin ?? "0.7in"},`);
  lines.push(`  page-bottom-margin: ${design.page?.bottom_margin ?? "0.7in"},`);
  lines.push(`  page-left-margin: ${design.page?.left_margin ?? "0.7in"},`);
  lines.push(`  page-right-margin: ${design.page?.right_margin ?? "0.7in"},`);
  lines.push(`  page-show-footer: ${toTypstBool(design.page?.show_footer ?? true)},`);
  lines.push(`  page-show-top-note: ${toTypstBool(design.page?.show_top_note ?? true)},`);

  // Colors
  const colors = design.colors;
  if (colors) {
    lines.push(`  colors-body: ${colors.body ?? "rgb(0, 0, 0)"},`);
    lines.push(`  colors-name: ${colors.name ?? "rgb(0, 79, 144)"},`);
    lines.push(`  colors-headline: ${colors.headline ?? "rgb(0, 79, 144)"},`);
    lines.push(`  colors-connections: ${colors.connections ?? "rgb(0, 79, 144)"},`);
    lines.push(`  colors-section-titles: ${colors.section_titles ?? "rgb(0, 79, 144)"},`);
    lines.push(`  colors-links: ${colors.links ?? "rgb(0, 79, 144)"},`);
    lines.push(`  colors-footer: ${colors.footer ?? "rgb(128, 128, 128)"},`);
    lines.push(`  colors-top-note: ${colors.top_note ?? "rgb(128, 128, 128)"},`);
  }

  // Typography
  const typo = design.typography;
  if (typo) {
    lines.push(`  typography-line-spacing: ${typo.line_spacing ?? "0.6em"},`);
    lines.push(`  typography-alignment: "${typo.alignment ?? "justified"}",`);
    lines.push(`  typography-date-and-location-column-alignment: ${typo.date_and_location_column_alignment ?? "right"},`);

    const fontFamily = typo.font_family;
    if (typeof fontFamily === "string") {
      lines.push(`  typography-font-family-body: "${fontFamily}",`);
      lines.push(`  typography-font-family-name: "${fontFamily}",`);
      lines.push(`  typography-font-family-headline: "${fontFamily}",`);
      lines.push(`  typography-font-family-connections: "${fontFamily}",`);
      lines.push(`  typography-font-family-section-titles: "${fontFamily}",`);
    } else if (fontFamily) {
      lines.push(`  typography-font-family-body: "${fontFamily.body ?? DEFAULT_FONT}",`);
      lines.push(`  typography-font-family-name: "${fontFamily.name ?? DEFAULT_FONT}",`);
      lines.push(`  typography-font-family-headline: "${fontFamily.headline ?? DEFAULT_FONT}",`);
      lines.push(`  typography-font-family-connections: "${fontFamily.connections ?? DEFAULT_FONT}",`);
      lines.push(`  typography-font-family-section-titles: "${fontFamily.section_titles ?? DEFAULT_FONT}",`);
    }

    const fontSize = typo.font_size;
    if (fontSize) {
      lines.push(`  typography-font-size-body: ${fontSize.body ?? "10pt"},`);
      lines.push(`  typography-font-size-name: ${fontSize.name ?? "30pt"},`);
      lines.push(`  typography-font-size-headline: ${fontSize.headline ?? "10pt"},`);
      lines.push(`  typography-font-size-connections: ${fontSize.connections ?? "10pt"},`);
      lines.push(`  typography-font-size-section-titles: ${fontSize.section_titles ?? "1.4em"},`);
    }

    const smallCaps = typo.small_caps;
    if (smallCaps) {
      lines.push(`  typography-small-caps-name: ${toTypstBool(smallCaps.name ?? false)},`);
      lines.push(`  typography-small-caps-headline: ${toTypstBool(smallCaps.headline ?? false)},`);
      lines.push(`  typography-small-caps-connections: ${toTypstBool(smallCaps.connections ?? false)},`);
      lines.push(`  typography-small-caps-section-titles: ${toTypstBool(smallCaps.section_titles ?? false)},`);
    }

    const bold = typo.bold;
    if (bold) {
      lines.push(`  typography-bold-name: ${toTypstBool(bold.name ?? true)},`);
      lines.push(`  typography-bold-headline: ${toTypstBool(bold.headline ?? false)},`);
      lines.push(`  typography-bold-connections: ${toTypstBool(bold.connections ?? false)},`);
      lines.push(`  typography-bold-section-titles: ${toTypstBool(bold.section_titles ?? true)},`);
    }
  }

  // Links
  const links = design.links;
  if (links) {
    lines.push(`  links-underline: ${toTypstBool(links.underline ?? false)},`);
    lines.push(`  links-show-external-link-icon: ${toTypstBool(links.show_external_link_icon ?? false)},`);
  }

  // Header
  const header = design.header;
  if (header) {
    lines.push(`  header-alignment: ${header.alignment ?? "center"},`);
    lines.push(`  header-photo-width: ${header.photo_width ?? "3.5cm"},`);
    lines.push(`  header-space-below-name: ${header.space_below_name ?? "0.7cm"},`);
    lines.push(`  header-space-below-headline: ${header.space_below_headline ?? "0.7cm"},`);
    lines.push(`  header-space-below-connections: ${header.space_below_connections ?? "0.7cm"},`);

    const conn = header.connections;
    if (conn) {
      lines.push(`  header-connections-hyperlink: ${toTypstBool(conn.hyperlink ?? true)},`);
      lines.push(`  header-connections-show-icons: ${toTypstBool(conn.show_icons ?? true)},`);
      lines.push(`  header-connections-display-urls-instead-of-usernames: ${toTypstBool(conn.display_urls_instead_of_usernames ?? false)},`);
      lines.push(`  header-connections-separator: "${conn.separator ?? ""}",`);
      lines.push(`  header-connections-space-between-connections: ${conn.space_between_connections ?? "0.5cm"},`);
    }
  }

  // Section titles
  const sectionTitles = design.section_titles;
  if (sectionTitles) {
    lines.push(`  section-titles-type: "${sectionTitles.type ?? "with_partial_line"}",`);
    lines.push(`  section-titles-line-thickness: ${sectionTitles.line_thickness ?? "0.5pt"},`);
    lines.push(`  section-titles-space-above: ${sectionTitles.space_above ?? "0.5cm"},`);
    lines.push(`  section-titles-space-below: ${sectionTitles.space_below ?? "0.3cm"},`);
  }

  // Sections
  const sections = design.sections;
  if (sections) {
    lines.push(`  sections-allow-page-break: ${toTypstBool(sections.allow_page_break ?? true)},`);
    lines.push(`  sections-space-between-text-based-entries: ${sections.space_between_text_based_entries ?? "0.3em"},`);
    lines.push(`  sections-space-between-regular-entries: ${sections.space_between_regular_entries ?? "1.2em"},`);
  }

  // Entries
  const entries = design.entries;
  if (entries) {
    lines.push(`  entries-date-and-location-width: ${entries.date_and_location_width ?? "4.15cm"},`);
    lines.push(`  entries-side-space: ${entries.side_space ?? "0.2cm"},`);
    lines.push(`  entries-space-between-columns: ${entries.space_between_columns ?? "0.1cm"},`);
    lines.push(`  entries-allow-page-break: ${toTypstBool(entries.allow_page_break ?? false)},`);
    lines.push(`  entries-short-second-row: ${toTypstBool(entries.short_second_row ?? true)},`);
    lines.push(`  entries-degree-width: ${entries.degree_width ?? "1cm"},`);
    lines.push(`  entries-summary-space-left: ${entries.summary?.space_left ?? "0cm"},`);
    lines.push(`  entries-summary-space-above: ${entries.summary?.space_above ?? "0cm"},`);

    const highlights = entries.highlights;
    if (highlights) {
      const bulletChar = highlights.bullet ?? "•";
      // Special handling for ● character in RenderCV
      const bulletExpr = bulletChar === "●"
        ? ` text(13pt, [•], baseline: -0.6pt) `
        : ` "${bulletChar}" `;
      lines.push(`  entries-highlights-bullet: ${bulletExpr},`);

      const nestedBulletChar = highlights.nested_bullet ?? "•";
      const nestedBulletExpr = nestedBulletChar === "●"
        ? ` text(13pt, [•], baseline: -0.6pt) `
        : ` "${nestedBulletChar}" `;
      lines.push(`  entries-highlights-nested-bullet: ${nestedBulletExpr},`);

      lines.push(`  entries-highlights-space-left: ${highlights.space_left ?? "0.15cm"},`);
      lines.push(`  entries-highlights-space-above: ${highlights.space_above ?? "0cm"},`);
      lines.push(`  entries-highlights-space-between-items: ${highlights.space_between_items ?? "0cm"},`);
      lines.push(`  entries-highlights-space-between-bullet-and-text: ${highlights.space_between_bullet_and_text ?? "0.5em"},`);
    }
  }

  // Date
  lines.push(`  date: datetime(`);
  lines.push(`    year: ${currentDate.getFullYear()},`);
  lines.push(`    month: ${currentDate.getMonth() + 1},`);
  lines.push(`    day: ${currentDate.getDate()},`);
  lines.push(`  ),`);

  lines.push(')');

  return lines.join('\n');
}

/** Escape a string for use inside Typst double-quoted strings. */
function escapeTypstString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, " ");
}
