/**
 * Locale string translations.
 *
 * RenderCV's locale fields (last_updated, present, month/year units, etc.)
 * default to English in the Zod schema. This module provides translations so
 * that switching `locale.language` localizes these strings automatically.
 *
 * A translation is only applied when the user has NOT set the field
 * explicitly in the YAML — i.e. when the value still equals the English
 * schema default. This preserves any explicit user override.
 */

/** English schema defaults (must match `localeSchema` in yaml/schema.ts). */
export const LOCALE_ENGLISH_DEFAULTS = {
  last_updated: "Last updated in",
  month: "month",
  months: "months",
  year: "year",
  years: "years",
  present: "present",
} as const;

/** English schema defaults for month arrays (must match `localeSchema`). */
export const LOCALE_ENGLISH_MONTH_ABBREVIATIONS = [
  "Jan", "Feb", "Mar", "Apr", "May", "June",
  "July", "Aug", "Sept", "Oct", "Nov", "Dec",
];
export const LOCALE_ENGLISH_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type LocaleField = keyof typeof LOCALE_ENGLISH_DEFAULTS;

/** Per-language translations of the default locale strings. */
const localeTranslations: Record<string, Record<LocaleField, string>> = {
  spanish: {
    last_updated: "Actualizado en",
    month: "mes",
    months: "meses",
    year: "año",
    years: "años",
    present: "presente",
  },
};

/** Per-language month abbreviations (must be 12 entries). */
const monthAbbreviationTranslations: Record<string, string[]> = {
  spanish: [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sept", "oct", "nov", "dic",
  ],
};

/** Per-language month names (must be 12 entries). */
const monthNameTranslations: Record<string, string[]> = {
  spanish: [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ],
};

/**
 * Translate a locale field for the given language, but only if the current
 * value still equals the English default (i.e. the user did not override it).
 * Returns the original value unchanged when no translation applies.
 */
export function translateLocaleField(
  field: LocaleField,
  currentValue: string,
  language: string,
): string {
  const map = localeTranslations[language];
  if (!map) return currentValue;
  // Only translate if the user did not override the default.
  if (currentValue !== LOCALE_ENGLISH_DEFAULTS[field]) return currentValue;
  return map[field];
}

/**
 * Resolve the locale's translatable string fields for the given language,
 * applying translations only where the user did not override the default.
 */
export function resolveLocaleStrings(locale: {
  language?: string;
  last_updated?: string;
  month?: string;
  months?: string;
  year?: string;
  years?: string;
  present?: string;
}): {
  last_updated: string;
  month: string;
  months: string;
  year: string;
  years: string;
  present: string;
} {
  const language = locale.language ?? "english";
  return {
    last_updated: translateLocaleField(
      "last_updated",
      locale.last_updated ?? LOCALE_ENGLISH_DEFAULTS.last_updated,
      language,
    ),
    month: translateLocaleField(
      "month",
      locale.month ?? LOCALE_ENGLISH_DEFAULTS.month,
      language,
    ),
    months: translateLocaleField(
      "months",
      locale.months ?? LOCALE_ENGLISH_DEFAULTS.months,
      language,
    ),
    year: translateLocaleField(
      "year",
      locale.year ?? LOCALE_ENGLISH_DEFAULTS.year,
      language,
    ),
    years: translateLocaleField(
      "years",
      locale.years ?? LOCALE_ENGLISH_DEFAULTS.years,
      language,
    ),
    present: translateLocaleField(
      "present",
      locale.present ?? LOCALE_ENGLISH_DEFAULTS.present,
      language,
    ),
  };
}

/**
 * Resolve the locale's month abbreviations, applying translations only when
 * the user did not override the English default.
 */
export function resolveMonthAbbreviations(
  monthAbbreviations: string[] | undefined,
  language: string,
): string[] {
  const current = monthAbbreviations ?? LOCALE_ENGLISH_MONTH_ABBREVIATIONS;
  // Only translate if the user did not override the default.
  if (
    current.length === LOCALE_ENGLISH_MONTH_ABBREVIATIONS.length &&
    current.every((v, i) => v === LOCALE_ENGLISH_MONTH_ABBREVIATIONS[i])
  ) {
    return monthAbbreviationTranslations[language] ?? current;
  }
  return current;
}

/**
 * Resolve the locale's month names, applying translations only when the user
 * did not override the English default.
 */
export function resolveMonthNames(
  monthNames: string[] | undefined,
  language: string,
): string[] {
  const current = monthNames ?? LOCALE_ENGLISH_MONTH_NAMES;
  if (
    current.length === LOCALE_ENGLISH_MONTH_NAMES.length &&
    current.every((v, i) => v === LOCALE_ENGLISH_MONTH_NAMES[i])
  ) {
    return monthNameTranslations[language] ?? current;
  }
  return current;
}
