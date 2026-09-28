/**
 * Minimal gettext-style i18n for the app UI (English + Spanish).
 *
 * English source strings are the keys; `translate`/`useT` look them up in
 * the active language dictionary and interpolate `{placeholder}` params.
 * Missing keys fall back to the English source.
 *
 * NOTE: this only translates the UI chrome. The generated PDF's language
 * is controlled by the `locale:` section of the YAML — unrelated to this.
 */
import { useCallback } from "react";
import { useCvStore } from "@/store/cvStore";
import { es } from "./es";

export type Language = "en" | "es";

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
];

const dictionaries: Record<Language, Record<string, string>> = { en: {}, es };

/**
 * Translate `message` into `lang`, interpolating `{name}` placeholders
 * from `params`. Falls back to the English source when no translation
 * exists.
 */
export function translate(
  lang: Language,
  message: string,
  params?: Record<string, string | number>,
): string {
  let out = dictionaries[lang][message] ?? message;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      out = out.replaceAll(`{${k}}`, String(v));
    }
  }
  return out;
}

/**
 * React hook returning a `t(message, params?)` function bound to the
 * current UI language. Re-renders the caller when the language changes.
 */
export function useT() {
  const language = useCvStore((s) => s.language);
  return useCallback(
    (message: string, params?: Record<string, string | number>) =>
      translate(language, message, params),
    [language],
  );
}
