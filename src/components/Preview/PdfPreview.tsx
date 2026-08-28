/**
 * PDF preview component — renders the compiled PDF using pdf.js canvases.
 *
 * We render with pdf.js instead of an <iframe src="blob:..."> because
 * Chrome on Android has no built-in PDF viewer plugin for iframes, so
 * blob PDFs there fall back to a bare "Open" download prompt instead of
 * rendering inline. pdf.js gives us consistent rendering across all
 * browsers/devices.
 */
import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useCvStore } from "@/store/cvStore";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

interface PdfPreviewProps {
  isCompiling: boolean;
}

export function PdfPreview({ isCompiling }: PdfPreviewProps) {
  const pdfUrl = useCvStore((s) => s.pdfUrl);
  const compileError = useCvStore((s) => s.compileError);
  const errors = useCvStore((s) => s.errors);
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfUrl) return;
    const viewportEl = viewportRef.current;
    const container = containerRef.current;
    if (!viewportEl || !container) return;

    let destroyed = false;
    let doc: PDFDocumentProxy | null = null;
    const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
    let activeRenderTasks: RenderTask[] = [];
    let renderGeneration = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    setRenderError(null);

    const cancelActiveRenders = () => {
      activeRenderTasks.forEach((task) => task.cancel());
      activeRenderTasks = [];
    };

    // Re-draws all pages at the given container width, reusing the already
    // loaded document. Cancels any in-flight renders from a previous call
    // (e.g. triggered by a resize) instead of tearing down the document.
    const renderPages = async (width: number) => {
      if (!doc || destroyed) return;
      const myGeneration = ++renderGeneration;
      cancelActiveRenders();
      container.innerHTML = "";
      const dpr = window.devicePixelRatio || 1;

      for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
        if (destroyed || myGeneration !== renderGeneration) return;

        let page;
        try {
          page = await doc.getPage(pageNum);
        } catch {
          return;
        }
        if (destroyed || myGeneration !== renderGeneration) return;

        // Fit page width to container, leaving a small side margin,
        // and cap scale at 1.5 so it never renders oversized on desktop.
        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(width - 16, 80);
        const scale = Math.min(1.5, availableWidth / baseViewport.width);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.className = "mx-auto mb-3 block max-w-full shadow-sm";
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        container.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.scale(dpr, dpr);

        const task = page.render({ canvas, canvasContext: ctx, viewport });
        activeRenderTasks.push(task);
        try {
          await task.promise;
        } catch (err) {
          if (destroyed || myGeneration !== renderGeneration) return;
          const message = err instanceof Error ? err.message : String(err);
          if (!/cancel/i.test(message)) {
            setRenderError(message);
          }
          return;
        }
      }
    };

    const loadDocument = async () => {
      try {
        doc = await loadingTask.promise;
        if (destroyed) return;
        renderPages(viewportEl.clientWidth);
      } catch (err) {
        if (!destroyed) {
          setRenderError(
            err instanceof Error ? err.message : "Failed to load PDF.",
          );
        }
      }
    };

    loadDocument();

    // Track the width we last rendered at so we only re-render when the
    // viewport actually changes width (not when our own canvases change
    // the (scrollable) content height, which would otherwise re-trigger
    // the observer and cause a clear/redraw flicker while scrolling).
    let lastWidth = viewportEl.clientWidth;

    const handleResize = () => {
      const width = viewportEl.clientWidth;
      if (width === lastWidth) return;
      lastWidth = width;
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderPages(width);
      }, 120);
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(viewportEl);
    } else {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      destroyed = true;
      if (resizeTimer) clearTimeout(resizeTimer);
      cancelActiveRenders();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      loadingTask.destroy();
    };
  }, [pdfUrl]);

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
      <div ref={viewportRef} className="flex-1 overflow-auto">
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
          <>
            {renderError && (
              <div className="p-4">
                <p className="font-mono text-sm text-error">
                  # failed to render preview: {renderError}
                </p>
              </div>
            )}
            <div ref={containerRef} className="p-3" />
          </>
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
