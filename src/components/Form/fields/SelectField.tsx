/**
 * Select dropdown field. Controlled directly by props — discrete choices
 * don't suffer from the cursor-jump problem text inputs have.
 * If `value` is not among the options (e.g. an invalid value written in
 * the YAML), it is shown as a disabled option so nothing is hidden.
 */
interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly (string | { value: string; label: string })[];
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}

export function SelectField({
  value,
  onChange,
  options,
  label,
  hint,
  error,
  id,
}: SelectFieldProps) {
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  const isKnown = normalized.some((o) => o.value === value);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-[11px] font-medium uppercase tracking-wide text-ink-soft"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded border bg-paper px-1.5 py-1.5 text-sm text-ink outline-none transition focus:border-signal ${
          error ? "border-error" : "border-line"
        }`}
      >
        {!isKnown && (
          <option value={value} disabled>
            {value === "" ? "(unset)" : `${value} (invalid)`}
          </option>
        )}
        {normalized.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="text-[11px] text-error">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-ink-faint">{hint}</span>
      ) : null}
    </div>
  );
}
