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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
          <span className="font-mono text-sm font-bold text-sky-400 dark:text-sky-600">
            CV
          </span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            CV for all
          </h1>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            Free YAML CV Generator
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
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
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Import YAML
        </button>

        <button
          onClick={handleDownloadYaml}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Download YAML
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={!pdfUrl}
          className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
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
