/**
 * Full Typst document generator — assembles preamble, header, and sections
 * into a complete .typ file.
 *
 * Ported from RenderCV's templater.py (render_full_template).
 */
import type { RenderCVModel } from "@/types/cv";
import { processModel, type ProcessedModel } from "../typst/model-processor";
import { generatePreamble } from "./preamble";
import { generateHeader } from "./header";
import { generateSection } from "./section";

/**
 * Generate a complete Typst document from a validated RenderCVModel.
 *
 * Pipeline:
 *   RenderCVModel → processModel → ProcessedModel
 *   → generatePreamble + generateHeader + generateSection(s)
 *   → complete .typ string
 */
export function generateTypstSource(model: RenderCVModel): string {
  const processed = processModel(model);

  const preamble = generatePreamble(processed);
  const header = generateHeader(processed);

  const sectionParts: string[] = [];
  for (const section of processed.sections) {
    sectionParts.push(generateSection(section, model.design));
  }

  const parts = [preamble, "", header, "", ...sectionParts];
  return parts.join("\n");
}

/**
 * Get the processed model (for debugging or advanced use).
 */
export function getProcessedModel(model: RenderCVModel): ProcessedModel {
  return processModel(model);
}
