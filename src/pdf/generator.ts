/**
 * PDF generator — orchestrates the full pipeline from YAML to PDF.
 *
 * Pipeline:
 *   YAML string → parse → validate → RenderCVModel
 *   → generate Typst source → compile via WASM → PDF bytes
 *   → Blob → download URL
 */
import { parseAndValidate, type ParseResult } from "@/yaml/parser";
import { renderCVModelSchema } from "@/yaml/schema";
import type { RenderCVModel } from "@/types/cv";
import { generateTypstSource } from "@/templates/generator";
import { compileToPdf, type CompileResult } from "@/typst/compiler";

export interface GeneratePdfResult {
  /** Whether the entire pipeline succeeded. */
  success: boolean;
  /** PDF bytes (if successful). */
  pdf?: Uint8Array;
  /** Generated Typst source (for debugging). */
  typstSource?: string;
  /** Validation errors (if YAML is invalid). */
  validationErrors?: ParseResult<unknown>["errors"];
  /** Compilation errors (if Typst compilation fails). */
  compileError?: string;
  /** Blob URL for the PDF (for preview/download). */
  pdfUrl?: string;
}

/**
 * Generate a PDF from a YAML string.
 *
 * This is the main entry point for the CV generation pipeline.
 */
export async function generatePdfFromYaml(
  yamlString: string,
): Promise<GeneratePdfResult> {
  // Step 1: Parse and validate YAML
  const parseResult = parseAndValidate(yamlString);
  if (!parseResult.success) {
    return {
      success: false,
      validationErrors: parseResult.errors,
    };
  }

  // Step 2: Parse into RenderCVModel (Zod already applied defaults)
  const modelResult = renderCVModelSchema.safeParse(parseResult.data);
  if (!modelResult.success) {
    return {
      success: false,
      validationErrors: parseResult.errors,
    };
  }

  const model = modelResult.data as RenderCVModel;

  // Step 3: Generate Typst source
  let typstSource: string;
  try {
    typstSource = generateTypstSource(model);
  } catch (err) {
    return {
      success: false,
      compileError: `Template generation error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Step 4: Compile Typst to PDF
  const iconColor = model.design?.colors?.connections;
  const compileResult: CompileResult = await compileToPdf(
    typstSource,
    iconColor,
  );
  if (!compileResult.success || !compileResult.pdf) {
    return {
      success: false,
      compileError: compileResult.error,
      typstSource,
    };
  }

  // Step 5: Create blob URL
  // Copy into a fresh ArrayBuffer to satisfy Blob's type requirement
  // (Uint8Array may be backed by SharedArrayBuffer which Blob doesn't accept)
  const pdfBytes = new Uint8Array(compileResult.pdf);
  const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
  const pdfUrl = URL.createObjectURL(pdfBlob);

  return {
    success: true,
    pdf: compileResult.pdf,
    typstSource,
    pdfUrl,
  };
}

/**
 * Generate only the Typst source from a YAML string (without compiling).
 *
 * Useful for debugging or showing the user the intermediate Typst code.
 */
export function generateTypstFromYaml(
  yamlString: string,
): { success: boolean; typstSource?: string; errors?: ParseResult<unknown>["errors"] } {
  const parseResult = parseAndValidate(yamlString);
  if (!parseResult.success) {
    return { success: false, errors: parseResult.errors };
  }

  const modelResult = renderCVModelSchema.safeParse(parseResult.data);
  if (!modelResult.success) {
    return { success: false, errors: parseResult.errors };
  }

  const model = modelResult.data as RenderCVModel;

  try {
    const typstSource = generateTypstSource(model);
    return { success: true, typstSource };
  } catch (err) {
    return {
      success: false,
      errors: [
        {
          kind: "schema",
          message: `Template generation error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
    };
  }
}

/**
 * Trigger a download of a PDF blob.
 */
export function downloadPdf(pdf: Uint8Array, filename: string): void {
  const pdfBytes = new Uint8Array(pdf);
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a delay to ensure download starts
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Trigger a download of a YAML file.
 */
export function downloadYaml(yamlString: string, filename: string): void {
  const blob = new Blob([yamlString], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generate a filename from the CV model.
 */
export function generatePdfFilename(model: RenderCVModel): string {
  const name = model.cv.name ?? "CV";
  const snakeName = name.trim().replace(/\s+/g, "_");
  return `${snakeName}_CV.pdf`;
}
