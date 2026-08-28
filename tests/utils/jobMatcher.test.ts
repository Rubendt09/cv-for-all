import { describe, it, expect } from "vitest";
import {
  extractKeywordsFromText,
  extractKeywordsFromCv,
  calculateCompatibility,
  matchJobDescription,
} from "@/utils/jobMatcher";
import type { KeywordMatch } from "@/utils/jobMatcher";

const SAMPLE_CV = `
cv:
  name: Jane Developer
  headline: Senior Software Engineer
  location: Berlin, DE
  sections:
    Experience:
      - company: Tech Corp
        position: Senior Engineer
        start_date: 2021-06
        end_date: present
        highlights:
          - Built React frontend with TypeScript
          - Reduced API latency by 40% using Redis caching
      - company: Startup Inc
        position: Software Engineer
        start_date: 2018-01
        end_date: 2021-05
        highlights:
          - Built microservices with Go and PostgreSQL
          - Set up CI/CD pipeline with GitHub Actions
    Education:
      - institution: TU Berlin
        area: Computer Science
        degree: BSc
    Skills:
      - label: Languages
        details: Python, Go, TypeScript, Rust
      - label: Frameworks
        details: React, Node.js, FastAPI
      - label: Infrastructure
        details: Docker, Kubernetes, AWS
design:
  theme: classic
`;

const SAMPLE_JOB = `
Senior Frontend Engineer

Required:
- 5+ years of experience with React and TypeScript
- Strong knowledge of CSS and Tailwind CSS
- Experience with REST APIs and GraphQL
- Unit testing with Jest or Vitest

Nice to have:
- Experience with Docker and Kubernetes
- Familiarity with CI/CD pipelines
- Knowledge of AWS
- Experience with Playwright for e2e testing

We use GitHub for version control and Figma for design.
`;

describe("extractKeywordsFromText", () => {
  it("extracts known keywords from free text", () => {
    const keywords = extractKeywordsFromText(
      "We need React, TypeScript, and Docker experience.",
    );
    const names = keywords.map((k) => k.keyword);
    expect(names).toContain("React");
    expect(names).toContain("TypeScript");
    expect(names).toContain("Docker");
  });

  it("deduplicates keywords", () => {
    const keywords = extractKeywordsFromText(
      "React and React and more React",
    );
    expect(keywords.filter((k) => k.keyword === "React").length).toBe(1);
  });

  it("matches aliases", () => {
    const keywords = extractKeywordsFromText("We use TS and k8s");
    const names = keywords.map((k) => k.keyword);
    expect(names).toContain("TypeScript");
    expect(names).toContain("Kubernetes");
  });

  it("matches multi-word keywords", () => {
    const keywords = extractKeywordsFromText(
      "Experience with Amazon Web Services and CI/CD",
    );
    const names = keywords.map((k) => k.keyword);
    expect(names).toContain("AWS");
    expect(names).toContain("CI/CD");
  });

  it("returns empty array for text with no known keywords", () => {
    const keywords = extractKeywordsFromText("hello world foo bar");
    expect(keywords).toEqual([]);
  });
});

describe("extractKeywordsFromCv", () => {
  it("extracts keywords from CV sections", () => {
    const keywords = extractKeywordsFromCv(SAMPLE_CV);
    const names = keywords.map((k) => k.keyword);
    expect(names).toContain("React");
    expect(names).toContain("TypeScript");
    expect(names).toContain("Docker");
    expect(names).toContain("PostgreSQL");
  });

  it("tracks which sections keywords were found in", () => {
    const keywords = extractKeywordsFromCv(SAMPLE_CV);
    const react = keywords.find((k) => k.keyword === "React");
    expect(react?.foundIn).toBeDefined();
    expect(react?.foundIn?.length).toBeGreaterThan(0);
  });

  it("returns empty array for invalid YAML", () => {
    const keywords = extractKeywordsFromCv("not: valid: yaml: {{{");
    expect(keywords).toEqual([]);
  });
});

describe("calculateCompatibility", () => {
  it("calculates percentage correctly", () => {
    const cvKeywords: KeywordMatch[] = [
      { keyword: "React", category: "framework" },
      { keyword: "TypeScript", category: "language" },
      { keyword: "Docker", category: "infrastructure" },
    ];
    const jobKeywords: KeywordMatch[] = [
      { keyword: "React", category: "framework" },
      { keyword: "TypeScript", category: "language" },
      { keyword: "Docker", category: "infrastructure" },
      { keyword: "Kubernetes", category: "infrastructure" },
    ];
    const result = calculateCompatibility(
      cvKeywords,
      jobKeywords,
      SAMPLE_CV,
    );
    expect(result.compatibilityPercentage).toBe(75);
    expect(result.matchedCount).toBe(3);
    expect(result.totalKeywordsInJob).toBe(4);
  });

  it("identifies missing keywords", () => {
    const cvKeywords: KeywordMatch[] = [
      { keyword: "React", category: "framework" },
    ];
    const jobKeywords: KeywordMatch[] = [
      { keyword: "React", category: "framework" },
      { keyword: "Vue", category: "framework" },
    ];
    const result = calculateCompatibility(cvKeywords, jobKeywords, SAMPLE_CV);
    expect(result.missing.map((m) => m.keyword)).toContain("Vue");
  });

  it("returns 0% when no keywords match", () => {
    const cvKeywords: KeywordMatch[] = [];
    const jobKeywords: KeywordMatch[] = [
      { keyword: "React", category: "framework" },
    ];
    const result = calculateCompatibility(cvKeywords, jobKeywords, SAMPLE_CV);
    expect(result.compatibilityPercentage).toBe(0);
  });

  it("returns 0% when job has no keywords", () => {
    const cvKeywords: KeywordMatch[] = [
      { keyword: "React", category: "framework" },
    ];
    const result = calculateCompatibility(cvKeywords, [], SAMPLE_CV);
    expect(result.compatibilityPercentage).toBe(0);
    expect(result.totalKeywordsInJob).toBe(0);
  });

  it("generates suggestions for missing keywords", () => {
    const cvKeywords: KeywordMatch[] = [];
    const jobKeywords: KeywordMatch[] = [
      { keyword: "Docker", category: "infrastructure" },
      { keyword: "Communication", category: "soft-skill" },
    ];
    const result = calculateCompatibility(cvKeywords, jobKeywords, SAMPLE_CV);
    expect(result.suggestions.length).toBe(2);
    const dockerSuggestion = result.suggestions.find(
      (s) => s.keyword === "Docker",
    );
    expect(dockerSuggestion).toBeDefined();
    expect(dockerSuggestion?.suggestedSection).toBe("Skills");
  });
});

describe("matchJobDescription", () => {
  it("runs the full pipeline end-to-end", () => {
    const result = matchJobDescription(SAMPLE_JOB, SAMPLE_CV);
    expect(result.totalKeywordsInJob).toBeGreaterThan(0);
    expect(result.matched.length).toBeGreaterThan(0);
    expect(result.compatibilityPercentage).toBeGreaterThan(0);
    expect(result.compatibilityPercentage).toBeLessThanOrEqual(100);
  });

  it("matches React and TypeScript from the sample CV", () => {
    const result = matchJobDescription(SAMPLE_JOB, SAMPLE_CV);
    const matchedNames = result.matched.map((m) => m.keyword);
    expect(matchedNames).toContain("React");
    expect(matchedNames).toContain("TypeScript");
    expect(matchedNames).toContain("Docker");
    expect(matchedNames).toContain("Kubernetes");
    expect(matchedNames).toContain("AWS");
  });

  it("identifies missing keywords from the sample job", () => {
    const result = matchJobDescription(SAMPLE_JOB, SAMPLE_CV);
    const missingNames = result.missing.map((m) => m.keyword);
    // Tailwind CSS and GraphQL are in the job but not in the sample CV
    expect(missingNames).toContain("Tailwind CSS");
    expect(missingNames).toContain("GraphQL");
  });
});
