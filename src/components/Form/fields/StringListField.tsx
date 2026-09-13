/**
 * String list editor — add / remove / reorder string items.
 *
 * Used for `highlights`, `authors`, and the list-valued connection fields
 * (`email`, `phone`, `website`).
 */
import { useEffect, useRef, useState } from "react";
import { useCvStore } from "@/store/cvStore";

interface StringListFieldProps {
  values: string[];
  onChange: (values: string[]) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  id?: string;
  /** Minimum number of items to always show (default 1). */
  minItems?: number;
}

export function StringListField({
  values,
  onChange,
  label,
  placeholder,
  error,
  id,
  minItems = 1,
}: StringListFieldProps) {
  const externalRevision = useCvStore((s) => s.externalYamlRevision);
  // Local copy so typing doesn't fight with re-serialization
  const [local, setLocal] = useState<string[]>(values);
  const focusedIndexRef = useRef<number | null>(null);
  const lastEmittedRef = useRef<string>(JSON.stringify(values));

  useEffect(() => {
    const emitted = JSON.stringify(values);
    if (focusedIndexRef.current === null || lastEmittedRef.current !== emitted) {
      setLocal(values);
      lastEmittedRef.current = emitted;
    }
  }, [values, externalRevision]);

  // Ensure there are always at least minItems rows visible
  const rows = local.length >= minItems ? local : [...local, ...Array(minItems - local.length).fill("")];

  const emit = (next: string[]) => {
    setLocal(next);
    lastEmittedRef.current = JSON.stringify(next);
    onChange(next);
  };

  const updateItem = (i: number, value: string) => {
    const next = [...rows];
    next[i] = value;
    emit(next);
  };

  const removeItem = (i: number) => {
    const next = rows.filter((_, idx) => idx !== i);
    emit(next);
  };

  const moveItem = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    emit(next);
  };

  const addItem = () => {
    emit([...rows, ""]);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
          {label}
        </span>
      )}
      <div className="flex flex-col gap-1">
        {rows.map((value, i) => (
          <div key={i} className="flex items-start gap-1">
            <input
              id={i === 0 ? id : undefined}
              type="text"
              value={value}
              onChange={(e) => updateItem(i, e.target.value)}
              onFocus={() => (focusedIndexRef.current = i)}
              onBlur={() => {
                focusedIndexRef.current = null;
                setLocal(values);
              }}
              placeholder={placeholder}
              className={`flex-1 rounded border bg-paper px-2 py-1.5 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-signal ${
                error ? "border-error" : "border-line"
              }`}
            />
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => moveItem(i, -1)}
                disabled={i === 0}
                title="Move up"
                className="rounded border border-line px-1.5 text-[10px] leading-4 text-ink-soft transition hover:border-ink-faint hover:text-ink disabled:opacity-30"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => moveItem(i, 1)}
                disabled={i === rows.length - 1}
                title="Move down"
                className="rounded border border-line px-1.5 text-[10px] leading-4 text-ink-soft transition hover:border-ink-faint hover:text-ink disabled:opacity-30"
              >
                ▼
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeItem(i)}
              title="Remove"
              className="rounded border border-line px-1.5 py-0.5 text-xs text-ink-soft transition hover:border-error hover:text-error"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="self-start rounded border border-dashed border-line px-2 py-1 text-[11px] text-ink-soft transition hover:border-signal hover:text-signal"
      >
        + Add item
      </button>
      {error && <span className="text-[11px] text-error">{error}</span>}
    </div>
  );
}
