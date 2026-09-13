/**
 * Multi-line text input with local state synced from props.
 */
import { useEffect, useRef, useState } from "react";
import { useCvStore } from "@/store/cvStore";

interface TextAreaFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  label?: string;
  id?: string;
  rows?: number;
}

export function TextAreaField({
  value,
  onChange,
  placeholder,
  hint,
  error,
  label,
  id,
  rows = 3,
}: TextAreaFieldProps) {
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setLocal(next);
    lastEmittedRef.current = next;
    onChange(next);
  };

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
      <textarea
        id={id}
        rows={rows}
        value={local}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setLocal(value);
        }}
        placeholder={placeholder}
        className={`w-full resize-y rounded border bg-paper px-2 py-1.5 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-signal ${
          error ? "border-error" : "border-line"
        }`}
      />
      {error ? (
        <span className="text-[11px] text-error">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-ink-faint">{hint}</span>
      ) : null}
    </div>
  );
}
