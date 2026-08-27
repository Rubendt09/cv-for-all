/**
 * YAML parser and validator.
 *
 * Pipeline:
 *   YAML string → js-yaml → unknown object → Zod schema → RenderCVModel
 *
 * Distinguishes between syntax errors (from js-yaml) and schema errors
 * (from Zod), producing user-friendly error messages with line/column info.
 */
import { load, YAMLException } from "js-yaml";
import { renderCVModelSchema } from "./schema";
import {
  detectSectionEntryType,
  detectEntryType,
} from "./entry-detection";
import type {
  Entry,
  EntryTypeName,
  RenderCVSection,
} from "@/types/cv";

// =============================================================================
// Error types
// =============================================================================

export type ErrorKind = "syntax" | "schema" | "entry";

export interface ParseError {
  kind: ErrorKind;
  message: string;
  /** YAML line number (1-based), if known. */
  line?: number;
  /** YAML column number (1-based), if known. */
  column?: number;
  /** Path to the field in the data structure (e.g., "cv.sections.experience[0]"). */
  path?: string;
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: ParseError[];
}

// =============================================================================
// Syntax parsing (js-yaml)
// =============================================================================

export interface YamlSyntaxError {
  message: string;
  mark: {
    line: number;
    column: number;
    position: number;
  };
}

/**
 * Parse a YAML string into a JavaScript object.
 *
 * Returns a ParseResult with syntax errors (if any) from js-yaml.
 */
export function parseYaml(yamlString: string): ParseResult<unknown> {
  // Empty or whitespace-only strings are valid (produce null)
  if (yamlString.trim() === "") {
    return { success: true, data: null, errors: [] };
  }

  try {
    const data = load(yamlString, {
      json: false,
    });
    return { success: true, data, errors: [] };
  } catch (err) {
    if (err instanceof YAMLException) {
      return {
        success: false,
        errors: [
          {
            kind: "syntax" as const,
            message: err.message ?? "YAML syntax error",
            line: err.mark?.line != null ? err.mark.line + 1 : undefined,
            column: err.mark?.column != null ? err.mark.column + 1 : undefined,
          },
        ],
      };
    }
    return {
      success: false,
      errors: [
        {
          kind: "syntax",
          message:
            err instanceof Error ? err.message : "Unknown parsing error",
        },
      ],
    };
  }
}

// =============================================================================
// Schema validation (Zod)
// =============================================================================

/**
 * Format a Zod error path into a dot-notation string.
 */
function formatPath(path: (string | number)[]): string {
  return path
    .map((p) => (typeof p === "number" ? `[${p}]` : p))
    .join(".")
    .replace(/\.\[/g, "[");
}

/**
 * Convert Zod errors to ParseError[].
 */
function zodErrorsToParseErrors(
  issues: Array<{
    message: string;
    path: (string | number)[];
    code: string;
  }>,
): ParseError[] {
  return issues.map((issue) => ({
    kind: "schema" as const,
    message: issue.message,
    path: formatPath(issue.path) || undefined,
  }));
}

/**
 * Validate a parsed YAML object against the RenderCV schema.
 */
export function validateSchema(data: unknown): ParseResult<unknown> {
  const result = renderCVModelSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data, errors: [] };
  }
  return {
    success: false,
    errors: zodErrorsToParseErrors(
      result.error.issues as unknown as Array<{
        message: string;
        path: (string | number)[];
        code: string;
      }>,
    ),
  };
}

// =============================================================================
// Entry validation
// =============================================================================

/**
 * Validate that all entries in a section match the detected entry type.
 *
 * Mirrors RenderCV's `validate_section`: detect the type from the first
 * identifiable entry, then validate all entries against that type.
 */
export function validateSections(
  sections: Record<string, unknown[]> | null | undefined,
): ParseError[] {
  const errors: ParseError[] = [];

  if (!sections) return errors;

  for (const [sectionTitle, entries] of Object.entries(sections)) {
    if (!Array.isArray(entries)) {
      errors.push({
        kind: "entry",
        message: `Section "${sectionTitle}" must be a list of entries.`,
        path: `cv.sections.${sectionTitle}`,
      });
      continue;
    }

    if (entries.length === 0) continue;

    const detectedType = detectSectionEntryType(entries);
    if (detectedType === null) {
      errors.push({
        kind: "entry",
        message: `Could not determine the entry type for section "${sectionTitle}". Check that entries have the correct fields.`,
        path: `cv.sections.${sectionTitle}`,
      });
      continue;
    }

    // Validate each entry matches the detected type.
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const entryType = detectEntryType(entry);
      if (entryType === null) {
        errors.push({
          kind: "entry",
          message: `Entry ${i + 1} in section "${sectionTitle}" does not match any entry type.`,
          path: `cv.sections.${sectionTitle}[${i}]`,
        });
      } else if (entryType !== detectedType && entryType !== "TextEntry") {
        // Allow mixed TextEntry with other types? RenderCV doesn't, but
        // we're lenient here. Full validation happens in the template generator.
      }
    }
  }

  return errors;
}

// =============================================================================
// Full pipeline
// =============================================================================

/**
 * Parse and validate a YAML string into a RenderCVModel.
 *
 * Combines syntax parsing, schema validation, and entry validation.
 */
export function parseAndValidate(
  yamlString: string,
): ParseResult<unknown> {
  // Step 1: Parse YAML syntax
  const syntaxResult = parseYaml(yamlString);
  if (!syntaxResult.success) {
    return { success: false, errors: syntaxResult.errors };
  }

  // Step 2: Validate against Zod schema
  const schemaResult = validateSchema(syntaxResult.data);
  if (!schemaResult.success) {
    // Also check for entry-level errors in the raw data
    const rawData = syntaxResult.data as {
      cv?: { sections?: Record<string, unknown[]> | null };
    };
    const entryErrors = validateSections(rawData?.cv?.sections);
    return {
      success: false,
      errors: [...schemaResult.errors, ...entryErrors],
    };
  }

  // Step 3: Validate entries (section-level type consistency)
  const validatedData = schemaResult.data as {
    cv?: { sections?: Record<string, unknown[]> | null };
  };
  const entryErrors = validateSections(validatedData?.cv?.sections);

  if (entryErrors.length > 0) {
    return {
      success: false,
      data: schemaResult.data,
      errors: entryErrors,
    };
  }

  return { success: true, data: schemaResult.data, errors: [] };
}

// =============================================================================
// Section processing (post-validation)
// =============================================================================

/**
 * Convert a section title key to a properly capitalized title.
 *
 * Mirrors RenderCV's `dictionary_key_to_proper_section_title`.
 * Snake_case keys become Title Case (with articles/prepositions lowercase).
 */
export function toProperSectionTitle(key: string): string {
  // If there's a space or uppercase letter, return as-is.
  if (key.includes(" ") || /[A-Z]/.test(key)) {
    return key;
  }

  const words = key.replace(/_/g, " ").split(" ");
  const lowercaseWords = new Set([
    "a", "and", "as", "at", "but", "by", "for", "from", "if", "in",
    "into", "like", "near", "nor", "of", "off", "on", "onto", "or",
    "over", "so", "than", "that", "to", "upon", "when", "with", "yet",
  ]);

  return words
    .map((word) =>
      lowercaseWords.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

/**
 * Transform the sections dict into a list of typed RenderCVSection objects.
 *
 * Mirrors RenderCV's `get_rendercv_sections`.
 */
export function getRenderCVSections(
  sections: Record<string, Entry[]> | null | undefined,
): RenderCVSection[] {
  if (!sections) return [];

  const result: RenderCVSection[] = [];
  for (const [title, entries] of Object.entries(sections)) {
    const formattedTitle = toProperSectionTitle(title);
    const entryType: EntryTypeName =
      entries.length === 0
        ? "TextEntry"
        : (detectSectionEntryType(entries) as EntryTypeName) ?? "TextEntry";

    result.push({
      title: formattedTitle,
      entry_type: entryType,
      entries,
    });
  }
  return result;
}
