/**
 * Language selector dropdown — switches the app UI between English and
 * Spanish. Only affects UI chrome; the PDF language is `locale:` in YAML.
 */
import { useCvStore } from "@/store/cvStore";
import { useT, LANGUAGES, type Language } from "@/i18n";

interface LanguageSelectorProps {
  id?: string;
}

export function LanguageSelector({ id = "language-select" }: LanguageSelectorProps) {
  const language = useCvStore((s) => s.language);
  const setLanguage = useCvStore((s) => s.setLanguage);
  const t = useT();

  return (
    <div className="flex items-center gap-1.5">
      <label
        htmlFor={id}
        className="hidden font-mono text-sm text-ink-faint sm:block"
      >
        {t("Language").toLowerCase()}:
      </label>
      <select
        id={id}
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        title={t("Language")}
        className="rounded border border-line bg-paper-raised px-2 py-1 text-xs font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink focus:outline-none focus:ring-2 focus:ring-signal/40 sm:px-2.5 sm:py-1.5 sm:text-sm"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
