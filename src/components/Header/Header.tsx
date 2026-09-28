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
import { LanguageSelector } from "@/components/LanguageSelector/LanguageSelector";
import { useT } from "@/i18n";

export function Header() {
  const yamlString = useCvStore((s) => s.yamlString);
  const pdfUrl = useCvStore((s) => s.pdfUrl);
  const selectedTheme = useCvStore((s) => s.selectedTheme);
  const setTheme = useCvStore((s) => s.setTheme);
  const importYaml = useCvStore((s) => s.importYaml);
  const isCompiling = useCvStore((s) => s.isCompiling);
  const errors = useCvStore((s) => s.errors);
  const jobMatcherResults = useCvStore((s) => s.jobMatcherResults);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  const statusLine = isCompiling
    ? `# ${t("compiling\u2026")}`
    : errors.length > 0
      ? `# ${errors.length === 1 ? t("1 error") : t("{n} errors", { n: errors.length })}`
      : `# ${t("0 errors \u00b7 ready to compile")}`;
  const statusColor = isCompiling
    ? "text-ink-faint"
    : errors.length > 0
      ? "text-error"
      : "text-success";

  const matcherLine = jobMatcherResults
    ? ` ${t("\u00b7 match {n}%", { n: jobMatcherResults.compatibilityPercentage })}`
    : "";
  const matcherColor = jobMatcherResults
    ? jobMatcherResults.compatibilityPercentage >= 75
      ? "text-success"
      : jobMatcherResults.compatibilityPercentage >= 50
        ? "text-signal"
        : "text-error"
    : "";

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
    <header className="flex flex-col gap-2 border-b border-line bg-paper-raised px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3 w-full max-w-full overflow-hidden">
      {/* Top bar on mobile / left side on desktop */}
      <div className="flex items-center justify-between sm:justify-start sm:gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-line bg-paper-sunken sm:h-9 sm:w-9 shrink-0">
            <span className="font-mono text-xs font-semibold text-signal">
              [cv]
            </span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-ink sm:text-base leading-tight">
              cv-for-all
            </h1>
            <p
              className={`hidden font-mono text-[11px] leading-none sm:block ${statusColor}`}
            >
              {statusLine}
              {matcherLine && (
                <span className={matcherColor}>{matcherLine}</span>
              )}
            </p>
          </div>
        </div>

        {/* Mobile-only language selector */}
        <div className="sm:hidden">
          <LanguageSelector id="language-select-mobile" />
        </div>
      </div>

      {/* Bottom bar on mobile / right side on desktop */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto min-w-0">
        {/* Desktop-only language selector */}
        <div className="hidden sm:block">
          <LanguageSelector id="language-select-desktop" />
        </div>

        <div className="flex-1 sm:flex-initial min-w-0">
          <TemplateSelector
            value={selectedTheme}
            onChange={handleThemeChange}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={handleImportClick}
          title={t("Import YAML")}
          className="shrink-0 rounded border border-line px-2 py-1 text-xs font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink sm:px-3 sm:py-1.5 sm:text-sm"
        >
          <span className="sm:hidden">{t("Import")}</span>
          <span className="hidden sm:inline">{t("Import YAML")}</span>
        </button>

        <button
          onClick={handleDownloadYaml}
          title={t("Download YAML")}
          className="shrink-0 rounded border border-line px-2 py-1 text-xs font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink sm:px-3 sm:py-1.5 sm:text-sm"
        >
          <span className="sm:hidden">YAML</span>
          <span className="hidden sm:inline">{t("Download YAML")}</span>
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={!pdfUrl}
          title={t("Download PDF")}
          className="shrink-0 rounded bg-signal px-2.5 py-1 text-xs font-semibold text-signal-contrast transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:py-1.5 sm:text-sm"
        >
          <span className="sm:hidden">PDF</span>
          <span className="hidden sm:inline">{t("Download PDF")}</span>
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
