/**
 * Job Matcher — compares a pasted job description against the current CV
 * and produces a compatibility report.
 *
 * Everything runs locally. No data leaves the browser.
 */
import { load } from "js-yaml";
import {
  lookupKeyword,
  normalizeKeyword,
  type KeywordCategory,
  type KeywordLookupEntry,
} from "./keywordDatabase";
import type { RenderCVModel } from "@/types/cv";

// =============================================================================
// Public types
// =============================================================================

export interface KeywordMatch {
  keyword: string;
  category: KeywordCategory;
  /** Sections in the CV where the keyword was found (CV extraction only). */
  foundIn?: string[];
}

export interface Suggestion {
  keyword: string;
  category: KeywordCategory;
  suggestedSection: string;
  reason: string;
}

export interface JobMatcherResult {
  compatibilityPercentage: number;
  matched: KeywordMatch[];
  missing: KeywordMatch[];
  totalKeywordsInJob: number;
  matchedCount: number;
  suggestions: Suggestion[];
}

// =============================================================================
// Text helpers
// =============================================================================

/**
 * Tokenize text into normalized word n-grams (1, 2, and 3 word sequences)
 * so multi-word keywords like "CI/CD" or "Amazon Web Services" can match.
 */
function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  if (!normalized) return [];

  const words = normalized.split(" ");
  const tokens = new Set<string>();

  for (let i = 0; i < words.length; i++) {
    // 1-gram
    tokens.add(words[i]);
    // 2-gram
    if (i + 1 < words.length) tokens.add(`${words[i]} ${words[i + 1]}`);
    // 3-gram
    if (i + 2 < words.length)
      tokens.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return [...tokens];
}

/**
 * Extract known keywords from arbitrary free text (e.g. a job description).
 * Returns deduplicated matches in order of first appearance.
 */
export function extractKeywordsFromText(
  text: string,
): KeywordMatch[] {
  const tokens = tokenize(text);
  const seen = new Set<string>();
  const matches: KeywordMatch[] = [];

  for (const token of tokens) {
    const entry: KeywordLookupEntry | undefined = lookupKeyword(token);
    if (!entry) continue;
    const key = normalizeKeyword(entry.name);
    if (seen.has(key)) continue;
    seen.add(key);
    matches.push({ keyword: entry.name, category: entry.category });
  }
  return matches;
}

// =============================================================================
// CV extraction
// =============================================================================

interface ParsedCv {
  model: RenderCVModel | null;
  /** Flat text per section title, for keyword scanning. */
  sectionTexts: Record<string, string>;
  /** Top-level CV text (name, headline, etc.) for keyword scanning. */
  headerText: string;
  /** Whether a Skills-like section exists. */
  hasSkillsSection: boolean;
  /** Whether an Experience-like section exists. */
  hasExperienceSection: boolean;
  /** Whether a Projects-like section exists. */
  hasProjectsSection: boolean;
}

/**
 * Parse the YAML string into a lightweight structure we can scan.
 * Tolerates invalid YAML by returning an empty result.
 */
function parseCvForMatching(yamlString: string): ParsedCv {
  let data: unknown = null;
  try {
    data = load(yamlString);
  } catch {
    return {
      model: null,
      sectionTexts: {},
      headerText: "",
      hasSkillsSection: false,
      hasExperienceSection: false,
      hasProjectsSection: false,
    };
  }

  const root = data as {
    cv?: {
      name?: string;
      headline?: string;
      location?: string;
      sections?: Record<string, unknown[]>;
    };
  };
  const cv = root?.cv ?? {};
  const sections = cv.sections ?? {};

  const sectionTexts: Record<string, string> = {};
  for (const [title, entries] of Object.entries(sections)) {
    sectionTexts[title] = entriesToText(entries);
  }

  const headerText = [
    cv.name ?? "",
    cv.headline ?? "",
    cv.location ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const sectionTitles = Object.keys(sections).map((t) => t.toLowerCase());
  const hasSkillsSection = sectionTitles.some((t) => /skill/.test(t));
  const hasExperienceSection = sectionTitles.some(
    (t) => /experience|employment|work/.test(t),
  );
  const hasProjectsSection = sectionTitles.some((t) => /project/.test(t));

  return {
    model: null,
    sectionTexts,
    headerText,
    hasSkillsSection,
    hasExperienceSection,
    hasProjectsSection,
  };
}

/**
 * Convert an array of entries (which may be strings or objects with
 * arbitrary fields) into a single flat string for keyword scanning.
 */
function entriesToText(entries: unknown[]): string {
  const parts: string[] = [];
  for (const entry of entries) {
    if (typeof entry === "string") {
      parts.push(entry);
      continue;
    }
    if (entry && typeof entry === "object") {
      for (const value of Object.values(entry as Record<string, unknown>)) {
        if (typeof value === "string") {
          parts.push(value);
        } else if (Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === "string") parts.push(item);
          }
        }
      }
    }
  }
  return parts.join(" ");
}

/**
 * Extract known keywords from the CV, tracking which sections each
 * keyword was found in.
 */
export function extractKeywordsFromCv(
  yamlString: string,
): KeywordMatch[] {
  const parsed = parseCvForMatching(yamlString);
  const seen = new Map<string, KeywordMatch>();

  const scan = (text: string, section: string) => {
    const tokens = tokenize(text);
    for (const token of tokens) {
      const entry = lookupKeyword(token);
      if (!entry) continue;
      const key = normalizeKeyword(entry.name);
      const existing = seen.get(key);
      if (existing) {
        if (!existing.foundIn?.includes(section)) {
          existing.foundIn = [...(existing.foundIn ?? []), section];
        }
      } else {
        seen.set(key, {
          keyword: entry.name,
          category: entry.category,
          foundIn: [section],
        });
      }
    }
  };

  scan(parsed.headerText, "Header");
  for (const [title, text] of Object.entries(parsed.sectionTexts)) {
    scan(text, title);
  }

  return [...seen.values()];
}

// =============================================================================
// Compatibility calculation
// =============================================================================

/**
 * Compare CV keywords against job-description keywords and produce
 * a compatibility report.
 */
export function calculateCompatibility(
  cvKeywords: KeywordMatch[],
  jobKeywords: KeywordMatch[],
  yamlString: string,
): JobMatcherResult {
  const cvSet = new Set(cvKeywords.map((k) => normalizeKeyword(k.keyword)));

  const matched: KeywordMatch[] = [];
  const missing: KeywordMatch[] = [];

  for (const job of jobKeywords) {
    const key = normalizeKeyword(job.keyword);
    if (cvSet.has(key)) {
      const cvMatch = cvKeywords.find(
        (k) => normalizeKeyword(k.keyword) === key,
      );
      matched.push({
        keyword: job.keyword,
        category: job.category,
        foundIn: cvMatch?.foundIn,
      });
    } else {
      missing.push({ keyword: job.keyword, category: job.category });
    }
  }

  const total = jobKeywords.length;
  const matchedCount = matched.length;
  const compatibilityPercentage =
    total === 0 ? 0 : Math.round((matchedCount / total) * 100);

  const parsed = parseCvForMatching(yamlString);
  const suggestions = generateSuggestions(missing, parsed);

  return {
    compatibilityPercentage,
    matched,
    missing,
    totalKeywordsInJob: total,
    matchedCount,
    suggestions,
  };
}

// =============================================================================
// Suggestions
// =============================================================================

/**
 * Generate actionable suggestions for each missing keyword, based on
 * which sections the CV already has.
 */
export function generateSuggestions(
  missing: KeywordMatch[],
  parsed: ParsedCv,
): Suggestion[] {
  return missing.map((m) => {
    let suggestedSection: string;
    let reason: string;

    if (isTechnicalKeyword(m.category)) {
      if (parsed.hasSkillsSection) {
        suggestedSection = "Skills";
        reason = `Add "${m.keyword}" to your Skills section.`;
      } else if (parsed.hasExperienceSection) {
        suggestedSection = "Experience";
        reason = `Mention "${m.keyword}" in a highlight under your Experience section.`;
      } else if (parsed.hasProjectsSection) {
        suggestedSection = "Projects";
        reason = `Reference "${m.keyword}" in a project description.`;
      } else {
        suggestedSection = "Skills";
        reason = `Create a Skills section and add "${m.keyword}".`;
      }
    } else {
      // soft-skill / methodology
      if (parsed.hasExperienceSection) {
        suggestedSection = "Experience";
        reason = `Demonstrate "${m.keyword}" through a concrete achievement in your Experience section.`;
      } else {
        suggestedSection = "Summary";
        reason = `Mention "${m.keyword}" in a summary or objective statement.`;
      }
    }

    return {
      keyword: m.keyword,
      category: m.category,
      suggestedSection,
      reason,
    };
  });
}

function isTechnicalKeyword(category: KeywordCategory): boolean {
  return (
    category === "language" ||
    category === "framework" ||
    category === "database" ||
    category === "infrastructure" ||
    category === "tool"
  );
}

// =============================================================================
// Top-level entry point
// =============================================================================

/**
 * Run the full matching pipeline: extract keywords from the job
 * description and the CV, then compute compatibility.
 */
export function matchJobDescription(
  jobDescription: string,
  yamlString: string,
): JobMatcherResult {
  const jobKeywords = extractKeywordsFromText(jobDescription);
  const cvKeywords = extractKeywordsFromCv(yamlString);
  return calculateCompatibility(cvKeywords, jobKeywords, yamlString);
}
