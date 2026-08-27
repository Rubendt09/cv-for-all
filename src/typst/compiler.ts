/**
 * Typst WASM compiler wrapper.
 *
 * Uses @myriaddreamin/typst.ts to compile Typst source code to PDF
 * entirely in the browser via WebAssembly. The WASM module is lazy-loaded
 * on first use to avoid blocking initial page render.
 */
import { $typst } from "@myriaddreamin/typst.ts";
import compilerModule from "@myriaddreamin/typst-ts-web-compiler/wasm?url";
import { renderIconSvg, svgTemplates } from "./svg-icons";

let isInitialized = false;
let initPromise: Promise<void> | null = null;
let lastIconColor: string | undefined;

/**
 * Initialize the Typst WASM compiler.
 *
 * This is called lazily on first compile. The WASM module (~27MB) is
 * loaded from the node_modules package via Vite's ?url import.
 * Subsequent calls are no-ops.
 */
export async function initCompiler(): Promise<void> {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // getModule must return a URL/BufferSource/WebAssembly.Module
    // pointing to the actual .wasm binary.
    // Vite's ?url import resolves the wasm file to a servable URL.
    await $typst.setCompilerInitOptions({
      getModule: () => compilerModule,
    });

    isInitialized = true;
  })();

  return initPromise;
}

/**
 * Write SVG icons to the compiler's virtual filesystem, colored to match
 * the CV's connections color, so that #image("/icons/linkedin.svg") resolves
 * to an icon matching the surrounding text color.
 *
 * Note: Typst's #image() renders SVGs in an isolated context and does not
 * propagate its ambient text color into the SVG (fill="currentColor" always
 * resolves to black there), so we bake the actual color into each icon's
 * fill attribute before writing it to the virtual filesystem.
 *
 * The main file is written to /tmp/{random}.typ, so we use absolute paths
 * to ensure the icons are found regardless of the main file location.
 */
async function writeIcons(iconColor: string | undefined): Promise<void> {
  if (lastIconColor === iconColor) return;
  const encoder = new TextEncoder();
  for (const name of Object.keys(svgTemplates)) {
    const svg = renderIconSvg(name, iconColor);
    if (svg) {
      await $typst.mapShadow(`/icons/${name}.svg`, encoder.encode(svg));
    }
  }
  lastIconColor = iconColor;
}

export interface CompileResult {
  /** PDF bytes as a Uint8Array. */
  pdf: Uint8Array | undefined;
  /** SVG output (if requested). */
  svg?: string;
  /** Compilation errors/warnings. */
  diagnostics?: string;
  /** Whether compilation succeeded. */
  success: boolean;
  /** Error message if compilation failed. */
  error?: string;
}

/**
 * Compile Typst source code to PDF.
 *
 * @param typstSource - The complete .typ file content.
 * @param iconColor - Color (Typst/SVG color string) to bake into connection
 *   icons, matching the CV design's connections color.
 * @returns CompileResult with PDF bytes or error info.
 */
export async function compileToPdf(
  typstSource: string,
  iconColor?: string,
): Promise<CompileResult> {
  await initCompiler();
  await writeIcons(iconColor);

  try {
    const pdf = await $typst.pdf({
      mainContent: typstSource,
    });

    if (!pdf || pdf.length === 0) {
      return {
        success: false,
        pdf: undefined,
        error: "Compilation produced no output.",
      };
    }

    return {
      success: true,
      pdf,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      pdf: undefined,
      error: message,
    };
  }
}

/**
 * Compile Typst source code to SVG (for preview rendering).
 *
 * @param typstSource - The complete .typ file content.
 * @param iconColor - Color (Typst/SVG color string) to bake into connection
 *   icons, matching the CV design's connections color.
 * @returns CompileResult with SVG string or error info.
 */
export async function compileToSvg(
  typstSource: string,
  iconColor?: string,
): Promise<CompileResult> {
  await initCompiler();
  await writeIcons(iconColor);

  try {
    const svg = await $typst.svg({
      mainContent: typstSource,
    });

    if (!svg) {
      return {
        success: false,
        pdf: undefined,
        error: "Compilation produced no SVG output.",
      };
    }

    return {
      success: true,
      pdf: undefined,
      svg,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      pdf: undefined,
      error: message,
    };
  }
}

/**
 * Check if the compiler has been initialized.
 */
export function isCompilerReady(): boolean {
  return isInitialized;
}
