/**
 * Header component — logo, template selector, download buttons.
 */
import { useRef } from "react";
import { useCvStore } from "@/store/cvStore";
import { parseAndValidate } from "@/yaml/parser";
import { renderCVModelSchema } from "@/yaml/schema";
import {
  downloadPdf,
  downloadYaml,
  generatePdfFilename,
} from "@/pdf/generator";
import { generateTypstFromYaml } from "@/pdf/generator";
import { compileToPdf } from "@/typst/compiler";
import type { ThemeName } from "@/types/cv";
import { TemplateSelector } from "@/components/TemplateSelector/TemplateSelector";

export function Header() {
  const yamlString = useCvStore((s) => s.yamlString);
  const pdfUrl = useCvStore((s) => s.pdfUrl);
  const selectedTheme = useCvStore((s) => s.selectedTheme);
  const setTheme = useCvStore((s) => s.setTheme);
  const importYaml = useCvStore((s) => s.importYaml);
  const isCompiling = useCvStore((s) => s.isCompiling);
  const errors = useCvStore((s) => s.errors);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusLine = isCompiling
    ? "# compiling\u2026"
    : errors.length > 0
      ? `# ${errors.length} ${errors.length === 1 ? "error" : "errors"}`
      : "# 0 errors \u00b7 ready to compile";
  const statusColor = isCompiling
    ? "text-ink-faint"
    : errors.length > 0
      ? "text-error"
      : "text-success";

  const handleDownloadPdf = async () => {
    // If we already have a compiled PDF URL, download from there
    // But we need the actual bytes. Let's recompile to get bytes directly.
    const result = parseAndValidate(yamlString);
    if (!result.success) return;

    const modelResult = renderCVModelSchema.safeParse(result.data);
    if (!modelResult.success) return;

    const model = modelResult.data as Parameters<typeof generatePdfFilename>[0];
    const typstResult = generateTypstFromYaml(yamlString);
    if (!typstResult.success || !typstResult.typstSource) return;

    const iconColor = model.design?.colors?.connections;
    const compileResult = await compileToPdf(typstResult.typstSource, iconColor);
    if (compileResult.success && compileResult.pdf) {
      downloadPdf(compileResult.pdf, generatePdfFilename(model));
    }
  };

  const handleDownloadYaml = () => {
    downloadYaml(yamlString, "my_cv.yaml");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        importYaml(text);
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-imported
    e.target.value = "";
  };

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
    // Update the YAML to use the selected theme
    const updatedYaml = updateThemeInYaml(yamlString, theme);
    if (updatedYaml) {
      useCvStore.getState().setYaml(updatedYaml);
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-line bg-paper-raised px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded border border-line bg-paper-sunken">
          <span className="font-mono text-xs font-semibold text-signal">
            [cv]
          </span>
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-ink">
            cv-for-all
          </h1>
          <p
            className={`hidden font-mono text-[11px] leading-none sm:block ${statusColor}`}
          >
            {statusLine}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TemplateSelector
          value={selectedTheme}
          onChange={handleThemeChange}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={handleImportClick}
          className="rounded border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink"
        >
          Import YAML
        </button>

        <button
          onClick={handleDownloadYaml}
          className="rounded border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink"
        >
          Download YAML
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={!pdfUrl}
          className="rounded bg-signal px-4 py-1.5 text-sm font-semibold text-signal-contrast transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Download PDF
        </button>
      </div>
    </header>
  );
}

/**
 * Update the theme in a YAML string.
 * Simple regex replacement of `theme: xxx` under the `design:` section.
 */
function updateThemeInYaml(yaml: string, theme: string): string | null {
  // Match `theme: xxx` under design section
  const pattern = /(design:\s*\n(?:\s+\S.*\n)*?\s+theme:\s*).*/;
  if (pattern.test(yaml)) {
    return yaml.replace(pattern, `$1${theme}`);
  }
  // If no theme line exists under design, add one
  const designPattern = /(design:\s*\n)/;
  if (designPattern.test(yaml)) {
    return yaml.replace(designPattern, `$1  theme: ${theme}\n`);
  }
  return null;
}
