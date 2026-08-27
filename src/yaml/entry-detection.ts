/**
 * Automatic entry type detection.
 *
 * Ported from RenderCV's section.py (get_characteristic_entry_fields and
 * get_entry_type_name_and_section_model). Entries in a section don't declare
 * their type explicitly — it's inferred from the fields they contain.
 *
 * Each entry type has "characteristic fields" — fields unique to that type
 * (not shared with other types). If an entry contains any of these fields,
 * it's classified as that type.
 */
import type { EntryTypeName } from "@/types/cv";

/** Map of entry type names to their characteristic (unique) field names. */
const entryTypeFields: Record<
  Exclude<EntryTypeName, "TextEntry">,
  string[]
> = {
  ExperienceEntry: ["company", "position"],
  EducationEntry: ["institution", "area", "degree"],
  NormalEntry: ["name"],
  PublicationEntry: ["title", "authors", "doi", "journal"],
  BulletEntry: ["bullet"],
  OneLineEntry: ["label", "details"],
  NumberedEntry: ["number"],
  ReversedNumberedEntry: ["reversed_number"],
};

/**
 * Compute characteristic fields per entry type.
 *
 * A field is "characteristic" for a type if it appears in that type but
 * not in any other type. This mirrors RenderCV's
 * `get_characteristic_entry_fields`.
 */
function computeCharacteristicFields(): Record<
  Exclude<EntryTypeName, "TextEntry">,
  Set<string>
> {
  const allFields: string[] = [];
  for (const fields of Object.values(entryTypeFields)) {
    allFields.push(...fields);
  }

  const fieldCounts = new Map<string, number>();
  for (const field of allFields) {
    fieldCounts.set(field, (fieldCounts.get(field) ?? 0) + 1);
  }

  // Fields that appear in more than one type are NOT characteristic.
  const commonFields = new Set(
    [...fieldCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([field]) => field),
  );

  const result = {} as Record<
    Exclude<EntryTypeName, "TextEntry">,
    Set<string>
  >;
  for (const [typeName, fields] of Object.entries(entryTypeFields) as [
    Exclude<EntryTypeName, "TextEntry">,
    string[],
  ][]) {
    result[typeName] = new Set(
      fields.filter((f) => !commonFields.has(f)),
    );
  }
  return result;
}

const characteristicFields = computeCharacteristicFields();

/**
 * Detect the entry type of a single entry based on its fields.
 *
 * @param entry - The entry data (a dict or a string).
 * @returns The detected entry type name, or null if no type matches.
 *
 * Mirrors RenderCV's `get_entry_type_name_and_section_model`.
 */
export function detectEntryType(
  entry: unknown,
): Exclude<EntryTypeName, "TextEntry"> | "TextEntry" | null {
  // Plain strings are TextEntry
  if (typeof entry === "string") {
    return "TextEntry";
  }

  if (entry === null || entry === undefined) {
    return null;
  }

  if (typeof entry !== "object" || Array.isArray(entry)) {
    return null;
  }

  const entryKeys = new Set(Object.keys(entry as Record<string, unknown>));

  for (const [typeName, charFields] of Object.entries(
    characteristicFields,
  ) as [
    Exclude<EntryTypeName, "TextEntry">,
    Set<string>,
  ][]) {
    // If at least one characteristic field is present, classify as this type.
    for (const field of charFields) {
      if (entryKeys.has(field)) {
        return typeName;
      }
    }
  }

  return null;
}

/**
 * Detect the entry type for an entire section by examining its entries.
 *
 * Iterates through entries until one is successfully classified, then
 * returns that type. Mirrors RenderCV's `validate_section` logic.
 *
 * @param entries - Array of entry data.
 * @returns The detected entry type name, or null if none match.
 */
export function detectSectionEntryType(
  entries: unknown[],
): Exclude<EntryTypeName, "TextEntry"> | "TextEntry" | null {
  if (entries.length === 0) {
    return "TextEntry";
  }

  for (const entry of entries) {
    const type = detectEntryType(entry);
    if (type !== null) {
      return type;
    }
  }

  return null;
}

/**
 * Get the list of all available entry type names.
 */
export function getAvailableEntryTypes(): EntryTypeName[] {
  return [
    ...Object.keys(entryTypeFields),
    "TextEntry",
  ] as EntryTypeName[];
}

/**
 * Get the characteristic fields for a given entry type.
 */
export function getCharacteristicFields(
  typeName: Exclude<EntryTypeName, "TextEntry">,
): Set<string> {
  return characteristicFields[typeName];
}
