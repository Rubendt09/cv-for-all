/**
 * Main application component.
 *
 * Layout:
 *   Desktop: Header bar + split pane (Editor | Preview)
 *   Mobile: Header bar + tabs (Edit | Preview)
 */
import { useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header/Header";
import { YamlEditor } from "@/components/Editor/YamlEditor";
import { ErrorPanel } from "@/components/Editor/ErrorPanel";
import { PdfPreview } from "@/components/Preview/PdfPreview";
import { useCvStore } from "@/store/cvStore";
import { parseAndValidate } from "@/yaml/parser";
import { generatePdfFromYaml } from "@/pdf/generator";
import exampleYaml from "@/examples/example-cv.yaml?raw";

export function App() {
  const yamlString = useCvStore((s) => s.yamlString);
  const setYaml = useCvStore((s) => s.setYaml);
  const setErrors = useCvStore((s) => s.setErrors);
  const setValid = useCvStore((s) => s.setValid);
  const setPdfUrl = useCvStore((s) => s.setPdfUrl);
  const setCompiling = useCvStore((s) => s.setCompiling);
  const setCompileError = useCvStore((s) => s.setCompileError);
  const setCompilerReady = useCvStore((s) => s.setCompilerReady);
  const loadFromLocalStorage = useCvStore((s) => s.loadFromLocalStorage);
  const isCompiling = useCvStore((s) => s.isCompiling);
  const errors = useCvStore((s) => s.errors);
  const compileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage or example on mount
  useEffect(() => {
    loadFromLocalStorage();
    const currentYaml = useCvStore.getState().yamlString;
    if (!currentYaml) {
      setYaml(exampleYaml);
    }
  }, [loadFromLocalStorage, setYaml]);

  // Validate YAML on change (debounced)
  useEffect(() => {
    if (!yamlString) return;

    const timer = setTimeout(() => {
      const result = parseAndValidate(yamlString);
      setErrors(result.errors);
      setValid(result.success);
    }, 300);

    return () => clearTimeout(timer);
  }, [yamlString, setErrors, setValid]);

  // Compile PDF when YAML is valid (debounced)
  const compilePdf = useCallback(
    async (yaml: string) => {
      setCompiling(true);
      setCompileError(null);

      try {
        const result = await generatePdfFromYaml(yaml);
        if (result.success && result.pdfUrl) {
          setPdfUrl(result.pdfUrl);
          setCompilerReady(true);
        } else if (result.compileError) {
          setCompileError(result.compileError);
        }
      } catch (err) {
        setCompileError(
          err instanceof Error ? err.message : "Unknown compilation error",
        );
      } finally {
        setCompiling(false);
      }
    },
    [setCompiling, setCompileError, setPdfUrl, setCompilerReady],
  );

  useEffect(() => {
    if (!yamlString) return;

    // Only compile if valid
    const result = parseAndValidate(yamlString);
    if (!result.success) return;

    if (compileTimerRef.current) {
      clearTimeout(compileTimerRef.current);
    }
    compileTimerRef.current = setTimeout(() => {
      compilePdf(yamlString);
    }, 1000);

    return () => {
      if (compileTimerRef.current) {
        clearTimeout(compileTimerRef.current);
      }
    };
  }, [yamlString, compilePdf]);

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel */}
        <div className="flex w-1/2 flex-col border-r border-slate-200 dark:border-slate-800">
          <YamlEditor value={yamlString} onChange={setYaml} />
          {errors.length > 0 && <ErrorPanel errors={errors} />}
        </div>
        {/* Preview panel */}
        <div className="flex w-1/2 flex-col">
          <PdfPreview isCompiling={isCompiling} />
        </div>
      </div>
      <footer className="flex flex-wrap items-center justify-center gap-x-2 border-t border-slate-200 bg-white px-4 py-1 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <span>Independent project compatible with RenderCV YAML.</span>
        <span aria-hidden="true">·</span>
        <a
          href="https://github.com/rendercv/rendercv"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-slate-700 dark:hover:text-slate-200"
        >
          RenderCV (MIT)
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="https://fontawesome.com"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-slate-700 dark:hover:text-slate-200"
        >
          Icons © Fonticons, Inc. (CC BY 4.0)
        </a>
      </footer>
    </div>
  );
}
