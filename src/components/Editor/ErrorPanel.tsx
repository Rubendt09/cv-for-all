/**
 * Error panel — displays validation errors with line/column info.
 */
import type { ParseError } from "@/yaml/parser";

interface ErrorPanelProps {
  errors: ParseError[];
}

export function ErrorPanel({ errors }: ErrorPanelProps) {
  if (errors.length === 0) return null;

  return (
    <div className="max-h-48 overflow-y-auto border-t border-line bg-error-soft px-4 py-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-error">
          # {errors.length} {errors.length === 1 ? "error" : "errors"}
        </span>
      </div>
      <ul className="space-y-1">
        {errors.map((error, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-error"
          >
            <span className="mt-0.5 flex-shrink-0 rounded border border-error/30 px-1.5 py-0.5 font-mono text-xs font-medium text-error">
              {error.kind}
            </span>
            <span>
              {error.line !== undefined && (
                <span className="font-mono text-xs text-error/70">
                  L{error.line}
                  {error.column !== undefined ? `:${error.column}` : ""}
                  {" — "}
                </span>
              )}
              {error.message}
              {error.path && (
                <span className="ml-1 font-mono text-xs text-error/70">
                  ({error.path})
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
