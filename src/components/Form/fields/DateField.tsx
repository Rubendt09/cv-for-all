/**
 * Date input — same as TextField but with date-specific hint and `present`
 * allowed for end dates.
 */
import { useEffect, useRef, useState } from "react";
import { useCvStore } from "@/store/cvStore";

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
  allowPresent?: boolean;
}

export function DateField({
  value,
  onChange,
  label,
  hint,
  error,
  id,
  allowPresent = false,
}: DateFieldProps) {
  const externalRevision = useCvStore((s) => s.externalYamlRevision);
  const [local, setLocal] = useState(value);
  const [focused, setFocused] = useState(false);
  const lastEmittedRef = useRef(value);

  useEffect(() => {
    if (!focused || lastEmittedRef.current !== value) {
      setLocal(value);
      lastEmittedRef.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, externalRevision]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setLocal(next);
    lastEmittedRef.current = next;
    onChange(next);
  };

  const fullHint = allowPresent
    ? `${hint ?? "YYYY | YYYY-MM | YYYY-MM-DD"} · "present" for current`
    : hint;

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
      <input
        id={id}
        type="text"
        value={local}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setLocal(value);
        }}
        placeholder="2024"
        className={`w-full rounded border bg-paper px-2 py-1.5 font-mono text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-signal ${
          error ? "border-error" : "border-line"
        }`}
      />
      {error ? (
        <span className="text-[11px] text-error">{error}</span>
      ) : fullHint ? (
        <span className="text-[11px] text-ink-faint">{fullHint}</span>
      ) : null}
    </div>
  );
}
