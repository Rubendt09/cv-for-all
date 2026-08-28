/**
 * Job Matcher results — displays compatibility percentage, matched and
 * missing keywords, and actionable suggestions.
 */
import { useState } from "react";
import type { JobMatcherResult, KeywordMatch } from "@/utils/jobMatcher";
import type { KeywordCategory } from "@/utils/keywordDatabase";

interface JobMatcherResultsProps {
  result: JobMatcherResult;
}

const CATEGORY_LABELS: Record<KeywordCategory, string> = {
  language: "Languages",
  framework: "Frameworks",
  database: "Databases",
  infrastructure: "Infrastructure",
  tool: "Tools",
  methodology: "Methodologies",
  "soft-skill": "Soft Skills",
};

function groupByCategory(
  keywords: KeywordMatch[],
): Record<KeywordCategory, KeywordMatch[]> {
  const groups: Record<KeywordCategory, KeywordMatch[]> = {
    language: [],
    framework: [],
    database: [],
    infrastructure: [],
    tool: [],
    methodology: [],
    "soft-skill": [],
  };
  for (const kw of keywords) {
    groups[kw.category].push(kw);
  }
  return groups;
}

function KeywordList({ keywords }: { keywords: KeywordMatch[] }) {
  if (keywords.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {keywords.map((kw) => (
        <li
          key={kw.keyword}
          className="rounded border border-line bg-paper-raised px-2 py-0.5 text-xs font-medium text-ink"
          title={
            kw.foundIn && kw.foundIn.length > 0
              ? `Found in: ${kw.foundIn.join(", ")}`
              : undefined
          }
        >
          {kw.keyword}
        </li>
      ))}
    </ul>
  );
}

function CategoryGroup({
  label,
  keywords,
  color,
}: {
  label: string;
  keywords: KeywordMatch[];
  color: "success" | "error";
}) {
  if (keywords.length === 0) return null;
  return (
    <div className="space-y-1">
      <p
        className={`font-mono text-xs font-semibold ${
          color === "success" ? "text-success" : "text-error"
        }`}
      >
        {label} ({keywords.length})
      </p>
      <KeywordList keywords={keywords} />
    </div>
  );
}

export function JobMatcherResults({ result }: JobMatcherResultsProps) {
  const [copied, setCopied] = useState(false);
  const matchedGroups = groupByCategory(result.matched);
  const missingGroups = groupByCategory(result.missing);

  const handleCopyMissing = async () => {
    const text = result.missing.map((m) => m.keyword).join(", ");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; ignore silently
    }
  };

  const percentageColor =
    result.compatibilityPercentage >= 75
      ? "text-success"
      : result.compatibilityPercentage >= 50
        ? "text-signal"
        : "text-error";

  return (
    <div className="flex flex-col gap-4">
      {/* Compatibility score */}
      <div className="rounded border border-line bg-paper-raised p-4">
        <p className="font-mono text-xs text-ink-faint">
          # compatibility
        </p>
        <p className={`text-3xl font-bold ${percentageColor}`}>
          {result.compatibilityPercentage}%
        </p>
        <p className="mt-1 font-mono text-xs text-ink-faint">
          {result.matchedCount} of {result.totalKeywordsInJob} keywords matched
        </p>
      </div>

      {/* Matched */}
      {result.matched.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-sm font-semibold text-success">
            ✓ Matched ({result.matched.length})
          </p>
          {Object.entries(matchedGroups).map(([cat, kws]) => (
            <CategoryGroup
              key={cat}
              label={CATEGORY_LABELS[cat as KeywordCategory]}
              keywords={kws}
              color="success"
            />
          ))}
        </div>
      )}

      {/* Missing */}
      {result.missing.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm font-semibold text-error">
              ✗ Missing ({result.missing.length})
            </p>
            <button
              type="button"
              onClick={handleCopyMissing}
              className="rounded border border-line px-2 py-0.5 text-xs font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink"
            >
              {copied ? "Copied!" : "Copy missing"}
            </button>
          </div>
          {Object.entries(missingGroups).map(([cat, kws]) => (
            <CategoryGroup
              key={cat}
              label={CATEGORY_LABELS[cat as KeywordCategory]}
              keywords={kws}
              color="error"
            />
          ))}
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-sm font-semibold text-signal">
            # suggestions
          </p>
          <ul className="space-y-1.5">
            {result.suggestions.map((s) => (
              <li
                key={s.keyword}
                className="rounded border border-signal/30 bg-signal-soft px-3 py-2 text-sm text-ink"
              >
                <span className="font-medium">{s.reason}</span>
                <span className="ml-1 font-mono text-xs text-ink-faint">
                  → {s.suggestedSection}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {result.totalKeywordsInJob === 0 && (
        <p className="font-mono text-sm text-ink-faint">
          # no recognizable keywords found in the job description. Try pasting a
          more detailed description.
        </p>
      )}
    </div>
  );
}
