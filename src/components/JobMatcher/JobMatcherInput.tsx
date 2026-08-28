/**
 * Job Matcher input — textarea for pasting a job description.
 */
import { useState } from "react";

interface JobMatcherInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onAnalyze: () => void;
  onClear: () => void;
}

export function JobMatcherInput({
  value,
  onChange,
  onAnalyze,
  onClear,
}: JobMatcherInputProps) {
  const [text, setText] = useState(value ?? "");

  const handleAnalyze = () => {
    if (!text.trim()) return;
    onChange(text);
    onAnalyze();
  };

  const handleClear = () => {
    setText("");
    onChange(null);
    onClear();
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="job-description"
        className="font-mono text-sm text-ink-faint"
      >
        # paste job description
      </label>
      <textarea
        id="job-description"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the full job description here..."
        className="h-48 w-full resize-y rounded border border-line bg-paper-raised p-3 font-mono text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-signal/40"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!text.trim()}
          className="rounded bg-signal px-4 py-1.5 text-sm font-semibold text-signal-contrast transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Analyze
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={!text.trim()}
          className="rounded border border-line px-4 py-1.5 text-sm font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
