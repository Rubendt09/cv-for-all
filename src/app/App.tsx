/**
 * Main application component.
 *
 * Layout:
 *   Desktop: Header bar + split pane (Editor | Preview)
 *   Mobile: Header bar + tabs (Edit | Preview)
 */
import { useEffect, useCallback, useRef, useState } from "react";
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
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

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
    <div className="flex h-full flex-col bg-paper">
      <Header />
      {/* Mobile tab bar */}
      <div className="flex border-b border-line bg-paper-raised md:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("edit")}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            mobileTab === "edit"
              ? "border-b-2 border-signal text-ink"
              : "text-ink-soft"
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            mobileTab === "preview"
              ? "border-b-2 border-signal text-ink"
              : "text-ink-soft"
          }`}
        >
          Preview
        </button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel */}
        <div
          className={`flex w-full flex-col border-r border-line md:w-1/2 ${
            mobileTab === "edit" ? "flex" : "hidden md:flex"
          }`}
        >
          <YamlEditor value={yamlString} onChange={setYaml} />
          {errors.length > 0 && <ErrorPanel errors={errors} />}
        </div>
        {/* Preview panel */}
        <div
          className={`flex w-full flex-col md:w-1/2 ${
            mobileTab === "preview" ? "flex" : "hidden md:flex"
          }`}
        >
          <PdfPreview isCompiling={isCompiling} />
        </div>
      </div>
      <footer className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 border-t border-line bg-paper-raised px-3 py-1.5 font-mono text-[10px] text-ink-faint sm:px-4 sm:text-[11px]">
        <span># independent project, compatible with RenderCV YAML</span>
        <span aria-hidden="true">&middot;</span>
        <a
          href="https://github.com/rendercv/rendercv"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-ink"
        >
          RenderCV (MIT)
        </a>
        <span aria-hidden="true">&middot;</span>
        <a
          href="https://fontawesome.com"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-ink"
        >
          Icons © Fonticons, Inc. (CC BY 4.0)
        </a>
      </footer>
    </div>
  );
}
