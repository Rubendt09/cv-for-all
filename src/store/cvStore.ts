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

const STORAGE_KEY = "cv-for-all-yaml";

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

  loadExample: (yaml) => {
    set({ yamlString: yaml });
    get().saveToLocalStorage();
  },

  importYaml: (yaml) => {
    set({ yamlString: yaml });
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
        set({ yamlString: saved });
      }
    } catch {
      // Ignore localStorage errors
    }
  },
}));
