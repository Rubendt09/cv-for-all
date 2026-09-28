/**
 * Checkbox field for boolean options (e.g. `show_footer`, `underline`).
 * Controlled directly by props.
 */
interface CheckboxFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
  error?: string;
  id?: string;
}

export function CheckboxField({
  checked,
  onChange,
  label,
  hint,
  error,
  id,
}: CheckboxFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-2 py-0.5"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-3.5 w-3.5 accent-signal"
        />
        <span className="text-sm text-ink">{label}</span>
      </label>
      {error ? (
        <span className="text-[11px] text-error">{error}</span>
      ) : hint ? (
        <span className="pl-5 text-[11px] text-ink-faint">{hint}</span>
      ) : null}
    </div>
  );
}
