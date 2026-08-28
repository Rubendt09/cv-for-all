/**
 * Job Matcher panel — combines the input form and results display.
 *
 * Runs the matching pipeline locally whenever the user clicks "Analyze".
 */
import { useCallback } from "react";
import { useCvStore } from "@/store/cvStore";
import { matchJobDescription } from "@/utils/jobMatcher";
import { JobMatcherInput } from "./JobMatcherInput";
import { JobMatcherResults } from "./JobMatcherResults";

export function JobMatcherPanel() {
  const yamlString = useCvStore((s) => s.yamlString);
  const jobDescription = useCvStore((s) => s.jobDescription);
  const setJobDescription = useCvStore((s) => s.setJobDescription);
  const jobMatcherResults = useCvStore((s) => s.jobMatcherResults);
  const setJobMatcherResults = useCvStore((s) => s.setJobMatcherResults);

  const handleAnalyze = useCallback(() => {
    const desc = useCvStore.getState().jobDescription;
    if (!desc || !desc.trim()) return;
    const result = matchJobDescription(desc, yamlString);
    setJobMatcherResults(result);
  }, [yamlString, setJobMatcherResults]);

  const handleClear = useCallback(() => {
    setJobMatcherResults(null);
  }, [setJobMatcherResults]);

  return (
    <div className="flex h-full flex-col bg-paper">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-line bg-paper-raised px-4 py-2">
        <span className="font-mono text-sm text-ink-faint">
          # job matcher
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <JobMatcherInput
            value={jobDescription}
            onChange={setJobDescription}
            onAnalyze={handleAnalyze}
            onClear={handleClear}
          />

          {jobMatcherResults && (
            <div className="border-t border-line pt-4">
              <JobMatcherResults result={jobMatcherResults} />
            </div>
          )}

          {!jobMatcherResults && (
            <p className="font-mono text-sm text-ink-faint">
              # paste a job description and click Analyze to see how your CV
              matches.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
