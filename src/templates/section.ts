/**
 * Section generator — produces Typst section headers and entry blocks.
 *
 * Ported from RenderCV's SectionBeginning.j2.typ and SectionEnding.j2.typ.
 */
import type { RenderCVSection, Design } from "@/types/cv";
import { generateEntry } from "./entries";

/**
 * Generate Typst code for a complete section (title + all entries).
 */
export function generateSection(
  section: RenderCVSection,
  design: Design,
): string {
  const lines: string[] = [];

  // Section title
  lines.push(`== ${section.title}`);

  // For reversed numbered entries, wrap in #reversed-numbered-entries
  if (section.entry_type === "ReversedNumberedEntry") {
    lines.push("");
    lines.push("#reversed-numbered-entries(");
    lines.push("  [");
  }

  // Entries
  for (const entry of section.entries) {
    const entryCode = generateEntry(entry, section.entry_type, design);
    if (section.entry_type === "ReversedNumberedEntry") {
      lines.push(`    ${entryCode}`);
    } else {
      // In Typst, a blank line between entries creates a paragraph break.
      // RenderCV's Jinja2 templates end each entry with \n\n for this reason.
      lines.push(entryCode);
      lines.push("");
    }
  }

  if (section.entry_type === "ReversedNumberedEntry") {
    lines.push("  ]");
    lines.push(")");
  }

  return lines.join("\n");
}
