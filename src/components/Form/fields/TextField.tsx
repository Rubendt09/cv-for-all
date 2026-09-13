/**
 * Single-line text input with local state synced from props.
 *
 * To avoid cursor jumps when the YAML is re-serialized on every keystroke,
 * the input keeps local state and only re-seeds from props when not focused
 * (or when the external revision changes).
 */
import { useEffect, useRef, useState } from "react";
import { useCvStore } from "@/store/cvStore";

interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  label?: string;
  id?: string;
  monospace?: boolean;
}

export function TextField({
  value,
  onChange,
  placeholder,
  hint,
  error,
  label,
  id,
  monospace,
}: TextFieldProps) {
  const externalRevision = useCvStore((s) => s.externalYamlRevision);
  const [local, setLocal] = useState(value);
  const [focused, setFocused] = useState(false);
  const lastEmittedRef = useRef(value);

  // Re-seed from props when not focused or when external revision changes
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
          // Flush: re-seed from props to reconcile any normalization
          setLocal(value);
        }}
        placeholder={placeholder}
        className={`w-full rounded border bg-paper px-2 py-1.5 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-signal ${
          error ? "border-error" : "border-line"
        } ${monospace ? "font-mono" : ""}`}
      />
      {error ? (
        <span className="text-[11px] text-error">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-ink-faint">{hint}</span>
      ) : null}
    </div>
  );
}
