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
    <div className="flex items-center gap-2">
      <label
        htmlFor="template-select"
        className="hidden text-sm text-slate-600 dark:text-slate-400 sm:block"
      >
        Template:
      </label>
      <select
        id="template-select"
        value={value}
        onChange={(e) => onChange(e.target.value as ThemeName)}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
