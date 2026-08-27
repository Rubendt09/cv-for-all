/**
 * PDF preview component — renders the compiled PDF in an iframe.
 */
import { useCvStore } from "@/store/cvStore";

interface PdfPreviewProps {
  isCompiling: boolean;
}

export function PdfPreview({ isCompiling }: PdfPreviewProps) {
  const pdfUrl = useCvStore((s) => s.pdfUrl);
  const compileError = useCvStore((s) => s.compileError);
  const errors = useCvStore((s) => s.errors);

  return (
    <div className="flex h-full flex-col bg-slate-200 dark:bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-300 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Preview
        </span>
        {isCompiling && (
          <span className="flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-sky-600 border-t-transparent dark:border-sky-400 dark:border-t-transparent" />
            Compiling...
          </span>
        )}
      </div>

      {/* PDF display area */}
      <div className="flex-1 overflow-auto">
        {compileError ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/50">
              <h3 className="mb-2 font-semibold text-red-700 dark:text-red-400">
                Compilation Error
              </h3>
              <pre className="whitespace-pre-wrap text-sm text-red-600 dark:text-red-400">
                {compileError}
              </pre>
            </div>
          </div>
        ) : errors.length > 0 && !pdfUrl ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Fix YAML errors to see the preview.
              </p>
            </div>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="CV Preview"
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              {isCompiling ? (
                <p className="text-slate-500 dark:text-slate-400">
                  Loading Typst compiler (first load may take a few seconds)...
                </p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">
                  Your CV preview will appear here.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
