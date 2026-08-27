/**
 * Header generator — produces the Typst header (name, headline, connections, photo).
 *
 * Ported from RenderCV's Header.j2.typ template.
 */
import type { ProcessedModel } from "@/typst/model-processor";

/**
 * Generate the Typst header from the processed model.
 */
export function generateHeader(model: ProcessedModel): string {
  const { cv, design, connections } = model;
  const lines: string[] = [];

  const hasPhoto = cv.photo != null;
  const photoPosition = design.header?.photo_position ?? "left";
  const photo = hasPhoto
    ? `#pad(left: ${design.header?.photo_space_left ?? "0.4cm"}, right: ${design.header?.photo_space_right ?? "0.4cm"}, image("${cv.photo}", width: ${design.header?.photo_width ?? "3.5cm"}))`
    : null;

  if (photo) {
    // Grid layout with photo
    lines.push("#grid(");
    if (photoPosition === "left") {
      lines.push("  columns: (auto, 1fr),");
    } else {
      lines.push("  columns: (1fr, auto),");
    }
    lines.push("  column-gutter: 0cm,");
    lines.push("  align: horizon + left,");
    if (photoPosition === "left") {
      lines.push(`  [${photo}],`);
      lines.push("  [");
    } else {
      lines.push("  [");
    }
  }

  // Name
  if (cv.name) {
    lines.push(`= ${cv.name}`);
  }

  // Headline
  if (cv.headline) {
    lines.push('');
    lines.push(`  #headline([${cv.headline}])`);
    lines.push('');
  }

  // Connections
  if (connections.length > 0) {
    lines.push('#connections(');
    for (const conn of connections) {
      lines.push(`  [${conn}],`);
    }
    lines.push(')');
  }

  if (photo) {
    if (photoPosition === "left") {
      lines.push("  ]");
      lines.push(")");
    } else {
      lines.push("  ],");
      lines.push(`  [${photo}],`);
      lines.push(")");
    }
  }

  return lines.join("\n");
}
