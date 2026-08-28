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
    <div className="flex h-full flex-col bg-paper-sunken">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-line bg-paper-raised px-4 py-2">
        <span className="font-mono text-sm text-ink-faint"># preview</span>
        {isCompiling && (
          <span className="flex items-center gap-2 font-mono text-sm text-signal">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-signal border-t-transparent" />
            compiling&hellip;
          </span>
        )}
      </div>

      {/* PDF display area */}
      <div className="flex-1 overflow-auto">
        {compileError ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="max-w-md rounded border border-error/30 bg-error-soft p-6">
              <h3 className="mb-2 font-mono font-semibold text-error">
                # compilation error
              </h3>
              <pre className="whitespace-pre-wrap font-mono text-sm text-error">
                {compileError}
              </pre>
            </div>
          </div>
        ) : errors.length > 0 && !pdfUrl ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              <p className="font-mono text-sm text-ink-faint">
                # fix YAML errors to see the preview
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
                <p className="font-mono text-sm text-ink-faint">
                  # loading typst compiler, first load may take a few
                  seconds&hellip;
                </p>
              ) : (
                <p className="font-mono text-sm text-ink-faint">
                  # your cv preview will appear here
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
