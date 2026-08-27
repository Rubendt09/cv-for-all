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
    <div className="max-h-48 overflow-y-auto border-t border-red-200 bg-red-50 px-4 py-2 dark:border-red-900 dark:bg-red-950/50">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm font-semibold text-red-700 dark:text-red-400">
          {errors.length} {errors.length === 1 ? "error" : "errors"}
        </span>
      </div>
      <ul className="space-y-1">
        {errors.map((error, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400"
          >
            <span className="mt-0.5 flex-shrink-0 rounded bg-red-200 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
              {error.kind}
            </span>
            <span>
              {error.line !== undefined && (
                <span className="font-mono text-xs text-red-500 dark:text-red-500">
                  L{error.line}
                  {error.column !== undefined ? `:${error.column}` : ""}
                  {" — "}
                </span>
              )}
              {error.message}
              {error.path && (
                <span className="ml-1 font-mono text-xs text-red-400 dark:text-red-600">
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
