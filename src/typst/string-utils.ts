/**
 * String utilities for Typst generation.
 *
 * Ported from RenderCV's string_processor.py and related utilities.
 */

/**
 * Remove protocol and trailing slash from a URL for display.
 *
 * Mirrors RenderCV's `clean_url`.
 * "https://example.com/" → "example.com"
 */
export function cleanUrl(url: string): string {
  let cleaned = url;
  cleaned = cleaned.replace(/^https?:\/\//, "");
  cleaned = cleaned.replace(/^www\./, "");
  // Remove trailing slash but keep domain-only URLs clean.
  if (cleaned.endsWith("/") && cleaned.length > 1) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

/**
 * Convert a name to snake_case for file naming.
 *
 * "John Doe" → "John_Doe"
 */
export function nameToSnakeCase(name: string): string {
  return name.trim().replace(/\s+/g, "_");
}

/**
 * Convert a name to lower snake_case.
 *
 * "John Doe" → "john_doe"
 */
export function nameToLowerSnakeCase(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Convert a name to upper snake_case.
 *
 * "John Doe" → "JOHN_DOE"
 */
export function nameToUpperSnakeCase(name: string): string {
  return name.trim().toUpperCase().replace(/\s+/g, "_");
}

/**
 * Convert a name to kebab-case.
 *
 * "John Doe" → "John-Doe"
 */
export function nameToKebabCase(name: string): string {
  return name.trim().replace(/\s+/g, "-");
}

/**
 * Convert a name to lower kebab-case.
 *
 * "John Doe" → "john-doe"
 */
export function nameToLowerKebabCase(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

/**
 * Convert a name to upper kebab-case.
 *
 * "John Doe" → "JOHN-DOE"
 */
export function nameToUpperKebabCase(name: string): string {
  return name.trim().toUpperCase().replace(/\s+/g, "-");
}

/**
 * Indent each line of a string by a given number of spaces.
 *
 * Mirrors Jinja2's `indent` filter used in RenderCV templates.
 */
export function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line.trim() === "" ? line : pad + line))
    .join("\n");
}

/**
 * Convert a boolean to Typst's lowercase string representation.
 *
 * true → "true", false → "false"
 */
export function toTypstBool(val: boolean): string {
  return val ? "true" : "false";
}
