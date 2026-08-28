/**
 * Template selector dropdown.
 */
import type { ThemeName } from "@/types/cv";

const THEMES: { value: ThemeName; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "moderncv", label: "ModernCV" },
  { value: "sb2nov", label: "Sb2nov" },
  { value: "engineeringresumes", label: "Engineering Resumes" },
  { value: "engineeringclassic", label: "Engineering Classic" },
  { value: "harvard", label: "Harvard" },
  { value: "ink", label: "Ink" },
  { value: "opal", label: "Opal" },
  { value: "ember", label: "Ember" },
];

interface TemplateSelectorProps {
  value: ThemeName;
  onChange: (theme: ThemeName) => void;
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <label
        htmlFor="template-select"
        className="hidden font-mono text-sm text-ink-faint sm:block"
      >
        theme:
      </label>
      <select
        id="template-select"
        value={value}
        onChange={(e) => onChange(e.target.value as ThemeName)}
        className="rounded border border-line bg-paper-raised px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink focus:outline-none focus:ring-2 focus:ring-signal/40"
      >
        {THEMES.map((theme) => (
          <option key={theme.value} value={theme.value}>
            {theme.label}
          </option>
        ))}
      </select>
    </div>
  );
}
