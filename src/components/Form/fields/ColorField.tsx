/**
 * Color field: text input for any Typst/RenderCV color expression
 * (e.g. `rgb(0, 79, 144)`, `luma(20)`, named colors) plus a native color
 * picker swatch that writes `rgb(r, g, b)`.
 *
 * The swatch shows the current color when it can be parsed as rgb() or
 * #rrggbb; otherwise it falls back to black.
 */
import { useEffect, useRef, useState } from "react";
import { useCvStore } from "@/store/cvStore";

interface ColorFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}

/** Parse `rgb(r, g, b)` or `#rrggbb` into a `#rrggbb` string for the picker. */
function toHex(value: string): string | null {
  const v = value.trim();
  const rgb = v.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (rgb) {
    return (
      "#" +
      [rgb[1], rgb[2], rgb[3]]
        .map((n) => Math.min(255, Number(n)).toString(16).padStart(2, "0"))
        .join("")
    );
  }
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    return "#" + v.slice(1).split("").map((c) => c + c).join("").toLowerCase();
  }
  return null;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

export function ColorField({
  value,
  onChange,
  label,
  hint,
  error,
  id,
}: ColorFieldProps) {
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

  const emit = (next: string) => {
    setLocal(next);
    lastEmittedRef.current = next;
    onChange(next);
  };

  const hex = toHex(local);

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
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={hex ?? "#000000"}
          onChange={(e) => emit(hexToRgb(e.target.value))}
          title="Pick a color"
          className="h-8 w-9 shrink-0 cursor-pointer rounded border border-line bg-paper p-0.5"
        />
        <input
          id={id}
          type="text"
          value={local}
          onChange={(e) => emit(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setLocal(value);
          }}
          placeholder="rgb(0, 79, 144)"
          className={`w-full min-w-0 rounded border bg-paper px-2 py-1.5 font-mono text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-signal ${
            error ? "border-error" : "border-line"
          }`}
        />
      </div>
      {error ? (
        <span className="text-[11px] text-error">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-ink-faint">{hint}</span>
      ) : null}
    </div>
  );
}
