/**
 * Entry generators — produce Typst code for each entry type.
 *
 * Ported from RenderCV's entries/*.j2.typ templates.
 */
import type { Entry, EntryTypeName } from "@/types/cv";
import type { Design } from "@/types/cv";

/**
 * Generate Typst code for a regular entry (experience, normal, education).
 *
 * Uses #regular-entry() or #education-entry() functions from @preview/rendercv.
 */
function generateRegularEntry(
  entry: Record<string, unknown>,
  design: Design,
  isEducation: boolean,
): string {
  const shortSecondRow = design.entries?.short_second_row ?? true;
  const mainColumn = String(entry.main_column ?? "");
  const dateAndLocationColumn = String(entry.date_and_location_column ?? "");

  const mainLines = mainColumn.split("\n");
  const dateLines = dateAndLocationColumn.split("\n");

  let firstRowLines: number;
  if (!shortSecondRow) {
    firstRowLines = dateLines.length || 1;
  } else {
    firstRowLines = mainLines.length;
  }

  const funcName = isEducation ? "education-entry" : "regular-entry";
  const lines: string[] = [];

  lines.push(`#${funcName}(`);
  lines.push("  [");
  for (const line of mainLines.slice(0, firstRowLines)) {
    if (line.trim()) lines.push(`    ${line}`);
    lines.push("");
  }
  lines.push("  ],");
  lines.push("  [");
  for (const line of dateLines) {
    if (line.trim()) lines.push(`    ${line}`);
    lines.push("");
  }
  lines.push("  ],");

  // Education: degree column
  if (isEducation && design.templates?.education_entry?.degree_column) {
    const degreeColumn = String(entry.degree_column ?? "");
    lines.push("  degree-column: [");
    lines.push(`    ${degreeColumn}`);
    lines.push("  ],");
  }

  // Second row (if not short)
  if (!shortSecondRow) {
    const secondRowLines = mainLines.slice(firstRowLines);
    if (secondRowLines.length > 0) {
      lines.push("  main-column-second-row: [");
      for (const line of secondRowLines) {
        if (line.trim()) lines.push(`    ${line}`);
        lines.push("");
      }
      lines.push("  ],");
    }
  }

  lines.push(")");
  return lines.join("\n");
}

/**
 * Generate Typst code for a single entry based on its type.
 */
export function generateEntry(
  entry: Entry,
  entryType: EntryTypeName,
  design: Design,
): string {
  if (entryType === "TextEntry" || typeof entry === "string") {
    return String(entry);
  }

  const e = entry as Record<string, unknown>;

  switch (entryType) {
    case "ExperienceEntry":
      return generateRegularEntry(e, design, false);

    case "EducationEntry":
      return generateRegularEntry(e, design, true);

    case "NormalEntry":
      return generateRegularEntry(e, design, false);

    case "PublicationEntry":
      return generateRegularEntry(e, design, false);

    case "BulletEntry":
      return `- ${String(e.bullet ?? "")}`;

    case "OneLineEntry":
      return String(e.main_column ?? `${e.label}: ${e.details}`);

    case "NumberedEntry":
      return `+ ${String(e.number ?? "")}`;

    case "ReversedNumberedEntry":
      return `+ ${String(e.reversed_number ?? "")}`;

    default:
      return String(e.main_column ?? "");
  }
}
