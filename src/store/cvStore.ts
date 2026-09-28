/**
 * Global CV store using Zustand.
 *
 * Manages the YAML editor content, validation state, PDF compilation,
 * and template selection. All CV data stays in the browser — nothing
 * is sent to a server.
 */
import { create } from "zustand";
import type { ParseError } from "@/yaml/parser";
import type { ThemeName } from "@/types/cv";
import type { JobMatcherResult } from "@/utils/jobMatcher";

const STORAGE_KEY = "cv-for-all-yaml";
const JOB_DESCRIPTION_KEY = "cv-for-all-job-description";
const EDITOR_MODE_KEY = "cv-for-all-editor-mode";
const LANGUAGE_KEY = "cv-for-all-language";

export type EditorMode = "form" | "yaml";

/** UI language. Same union as `Language` in @/i18n (declared inline to keep
 * this module free of runtime imports from the i18n layer). */
export type AppLanguage = "en" | "es";

/** Detect the UI language from the browser; defaults to English. */
function detectLanguage(): AppLanguage {
  if (
    typeof navigator !== "undefined" &&
    navigator.language?.toLowerCase().startsWith("es")
  ) {
    return "es";
  }
  return "en";
}

interface CvStoreState {
  /** Current YAML content in the editor. */
  yamlString: string;
  /** Validation errors (syntax + schema + entry). */
  errors: ParseError[];
  /** Whether the YAML is valid (no errors). */
  isValid: boolean;
  /** PDF blob URL for preview/download. */
  pdfUrl: string | null;
  /** Whether PDF compilation is in progress. */
  isCompiling: boolean;
  /** Compilation error message (if any). */
  compileError: string | null;
  /** Selected theme. */
  selectedTheme: ThemeName;
  /** Whether the compiler WASM has been loaded. */
  compilerReady: boolean;
  /** Generated Typst source (for debugging). */
  typstSource: string | null;
  /** Pasted job description for the Job Matcher feature. */
  jobDescription: string | null;
  /** Latest Job Matcher result (null if not yet analyzed). */
  jobMatcherResults: JobMatcherResult | null;
  /** Active editor mode: form or yaml. */
  editorMode: EditorMode;
  /** UI language (app chrome only — the PDF language comes from `locale:`). */
  language: AppLanguage;
  /** Whether the Job Matcher panel is collapsed (form mode uses the space). */
  matcherCollapsed: boolean;
  /**
   * Incremented whenever the YAML is replaced by an external source
   * (import, example, localStorage load). Form inputs use this to know
   * when to re-seed from the YAML even if they're not focused.
   */
  externalYamlRevision: number;

  // Actions
  setYaml: (yaml: string) => void;
  setErrors: (errors: ParseError[]) => void;
  setValid: (valid: boolean) => void;
  setPdfUrl: (url: string | null) => void;
  setCompiling: (compiling: boolean) => void;
  setCompileError: (error: string | null) => void;
  setTheme: (theme: ThemeName) => void;
  setCompilerReady: (ready: boolean) => void;
  setTypstSource: (source: string | null) => void;
  setJobDescription: (description: string | null) => void;
  setJobMatcherResults: (results: JobMatcherResult | null) => void;
  setEditorMode: (mode: EditorMode) => void;
  setLanguage: (language: AppLanguage) => void;
  setMatcherCollapsed: (collapsed: boolean) => void;
  loadExample: (yaml: string) => void;
  importYaml: (yaml: string) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

export const useCvStore = create<CvStoreState>((set, get) => ({
  yamlString: "",
  errors: [],
  isValid: false,
  pdfUrl: null,
  isCompiling: false,
  compileError: null,
  selectedTheme: "classic",
  compilerReady: false,
  typstSource: null,
  jobDescription: null,
  jobMatcherResults: null,
  editorMode: "form",
  language: detectLanguage(),
  matcherCollapsed: true,
  externalYamlRevision: 0,

  setYaml: (yaml) => {
    set({ yamlString: yaml });
    // Auto-save to localStorage (debounced by caller)
    get().saveToLocalStorage();
  },

  setErrors: (errors) => set({ errors }),
  setValid: (valid) => set({ isValid: valid }),
  setPdfUrl: (url) => {
    const prevUrl = get().pdfUrl;
    if (prevUrl) URL.revokeObjectURL(prevUrl);
    set({ pdfUrl: url });
  },
  setCompiling: (compiling) => set({ isCompiling: compiling }),
  setCompileError: (error) => set({ compileError: error }),
  setTheme: (theme) => set({ selectedTheme: theme }),
  setCompilerReady: (ready) => set({ compilerReady: ready }),
  setTypstSource: (source) => set({ typstSource: source }),

  setJobDescription: (description) => {
    set({ jobDescription: description });
    try {
      if (description) {
        localStorage.setItem(JOB_DESCRIPTION_KEY, description);
      } else {
        localStorage.removeItem(JOB_DESCRIPTION_KEY);
      }
    } catch {
      // Ignore localStorage errors
    }
  },

  setJobMatcherResults: (results) => set({ jobMatcherResults: results }),

  setEditorMode: (mode) => {
    // Auto-collapse the Matcher in form mode (editor widens to 1/2);
    // expand it again in YAML mode (back to 1/3 each).
    set({ editorMode: mode, matcherCollapsed: mode === "form" });
    try {
      localStorage.setItem(EDITOR_MODE_KEY, mode);
    } catch {
      // Ignore localStorage errors
    }
  },

  setLanguage: (language) => {
    set({ language });
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      // Ignore localStorage errors
    }
  },

  setMatcherCollapsed: (collapsed) => set({ matcherCollapsed: collapsed }),

  loadExample: (yaml) => {
    set({ yamlString: yaml, externalYamlRevision: get().externalYamlRevision + 1 });
    get().saveToLocalStorage();
  },

  importYaml: (yaml) => {
    set({ yamlString: yaml, externalYamlRevision: get().externalYamlRevision + 1 });
    get().saveToLocalStorage();
  },

  saveToLocalStorage: () => {
    try {
      localStorage.setItem(STORAGE_KEY, get().yamlString);
    } catch {
      // localStorage might be full or unavailable; silently ignore
    }
  },

  loadFromLocalStorage: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        set({
          yamlString: saved,
          externalYamlRevision: get().externalYamlRevision + 1,
        });
      }
      const savedJob = localStorage.getItem(JOB_DESCRIPTION_KEY);
      if (savedJob) {
        set({ jobDescription: savedJob });
      }
      const savedMode = localStorage.getItem(EDITOR_MODE_KEY);
      if (savedMode === "form" || savedMode === "yaml") {
        set({ editorMode: savedMode, matcherCollapsed: savedMode === "form" });
      }
      const savedLang = localStorage.getItem(LANGUAGE_KEY);
      if (savedLang === "en" || savedLang === "es") {
        set({ language: savedLang });
      }
    } catch {
      // Ignore localStorage errors
    }
  },
}));
