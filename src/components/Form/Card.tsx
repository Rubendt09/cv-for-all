/**
 * Collapsible card with a header toggle. Used by all form sections.
 */
import { useState, type ReactNode } from "react";

interface CardProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  /** Optional badge shown next to the title (e.g. entry count). */
  badge?: string;
  /** Optional actions shown on the right of the header. */
  actions?: ReactNode;
}

export function Card({ title, defaultOpen = false, children, badge, actions }: CardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded border border-line bg-paper-raised">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span
            className="text-[10px] text-ink-faint transition-transform"
            style={{ transform: open ? "rotate(90deg)" : "none" }}
          >
            ▶
          </span>
          <span className="text-sm font-semibold text-ink">{title}</span>
          {badge && (
            <span className="rounded bg-paper-sunken px-1.5 py-0.5 text-[10px] font-mono text-ink-soft">
              {badge}
            </span>
          )}
        </button>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>
      {open && (
        <div className="border-t border-line px-3 py-3">{children}</div>
      )}
    </div>
  );
}
