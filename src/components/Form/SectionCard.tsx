/**
 * Card for a single section: rename, move up/down, delete, and list its
 * entries with add / delete / duplicate / move.
 */
import { useMemo, useState } from "react";
import { useCvStore } from "@/store/cvStore";
import {
  loadDoc,
  getSections,
  readEntryFields,
  renameSection,
  deleteSection,
  moveSection,
  addSection,
  addEntry,
  deleteEntry,
  duplicateEntry,
  moveEntry,
} from "@/yaml/doc-editor";
import type { EntryTypeName } from "@/types/cv";
import { ENTRY_TYPE_LABELS, SELECTABLE_ENTRY_TYPES } from "./entry-fields";
import { EntryEditor } from "./EntryEditor";
import { Card } from "./Card";

interface SectionCardProps {
  sectionIndex: number;
}

export function SectionCard({ sectionIndex }: SectionCardProps) {
  const yamlString = useCvStore((s) => s.yamlString);
  const setYaml = useCvStore((s) => s.setYaml);

  const sections = useMemo(() => {
    const { doc } = loadDoc(yamlString);
    if (!doc) return [];
    return getSections(doc);
  }, [yamlString]);

  const section = sections[sectionIndex];
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section?.title ?? "");

  if (!section) return null;

  const canMoveUp = sectionIndex > 0;
  const canMoveDown = sectionIndex < sections.length - 1;

  const doRename = (newTitle: string) => {
    const next = renameSection(yamlString, section.title, newTitle);
    if (next !== null) setYaml(next);
    setRenaming(false);
  };

  return (
    <Card
      title={section.title}
      badge={`${section.entryCount} ${section.entryCount === 1 ? "entry" : "entries"}`}
      defaultOpen={sectionIndex === 0}
      actions={
        <>
          <button
            type="button"
            onClick={() => {
              const next = moveSection(yamlString, sectionIndex, sectionIndex - 1);
              if (next !== null) setYaml(next);
            }}
            disabled={!canMoveUp}
            title="Move section up"
            className="rounded border border-line px-1.5 text-[10px] text-ink-soft transition hover:border-ink-faint hover:text-ink disabled:opacity-30"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => {
              const next = moveSection(yamlString, sectionIndex, sectionIndex + 1);
              if (next !== null) setYaml(next);
            }}
            disabled={!canMoveDown}
            title="Move section down"
            className="rounded border border-line px-1.5 text-[10px] text-ink-soft transition hover:border-ink-faint hover:text-ink disabled:opacity-30"
          >
            ▼
          </button>
          <button
            type="button"
            onClick={() => {
              setTitleDraft(section.title);
              setRenaming(true);
            }}
            title="Rename section"
            className="rounded border border-line px-1.5 text-[10px] text-ink-soft transition hover:border-ink-faint hover:text-ink"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete section "${section.title}"?`)) {
                const next = deleteSection(yamlString, section.title);
                if (next !== null) setYaml(next);
              }
            }}
            title="Delete section"
            className="rounded border border-line px-1.5 text-[10px] text-ink-soft transition hover:border-error hover:text-error"
          >
            ×
          </button>
        </>
      }
    >
      {renaming && (
        <div className="mb-3 flex gap-1">
          <input
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doRename(titleDraft.trim());
              if (e.key === "Escape") setRenaming(false);
            }}
            autoFocus
            className="flex-1 rounded border border-signal bg-paper px-2 py-1.5 text-sm text-ink outline-none"
          />
          <button
            type="button"
            onClick={() => doRename(titleDraft.trim())}
            className="rounded bg-signal px-2 py-1 text-xs font-semibold text-signal-contrast"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setRenaming(false)}
            className="rounded border border-line px-2 py-1 text-xs text-ink-soft"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="mb-2 text-[10px] font-mono text-ink-faint">
        type: {section.entryType}
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: section.entryCount }).map((_, i) => (
          <EntryBlock
            key={i}
            sectionTitle={section.title}
            index={i}
            entryType={section.entryType}
            total={section.entryCount}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          const next = addEntry(yamlString, section.title, section.entryType);
          if (next !== null) setYaml(next);
        }}
        className="mt-3 w-full rounded border border-dashed border-line px-2 py-1.5 text-[11px] text-ink-soft transition hover:border-signal hover:text-signal"
      >
        + Add entry
      </button>
    </Card>
  );
}

/**
 * A single entry block within a section, with its own collapse state and
 * per-entry actions (move / duplicate / delete).
 */
function EntryBlock({
  sectionTitle,
  index,
  entryType,
  total,
}: {
  sectionTitle: string;
  index: number;
  entryType: EntryTypeName;
  total: number;
}) {
  const yamlString = useCvStore((s) => s.yamlString);
  const setYaml = useCvStore((s) => s.setYaml);
  const [open, setOpen] = useState(index === 0);

  // Preview: first scalar field for the collapsed summary
  const preview = useMemo(() => {
    const { doc } = loadDoc(yamlString);
    if (!doc) return "";
    const fields = readEntryFields(doc, sectionTitle, index);
    // Pick the first non-empty string value as a preview
    for (const v of Object.values(fields)) {
      if (typeof v === "string" && v.trim() !== "") return v;
    }
    return "";
  }, [yamlString, sectionTitle, index]);

  return (
    <div className="rounded border border-line bg-paper">
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex-1 text-left"
        >
          <span
            className="mr-1.5 text-[10px] text-ink-faint"
            style={{
              transform: open ? "rotate(90deg)" : "none",
              display: "inline-block",
            }}
          >
            ▶
          </span>
          <span className="text-xs text-ink-soft">
            #{index + 1}
            {preview && (
              <span className="ml-2 text-ink">{preview.slice(0, 50)}</span>
            )}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            const next = moveEntry(yamlString, sectionTitle, index, index - 1);
            if (next !== null) setYaml(next);
          }}
          disabled={index === 0}
          title="Move up"
          className="rounded border border-line px-1 text-[10px] text-ink-soft transition hover:border-ink-faint hover:text-ink disabled:opacity-30"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => {
            const next = moveEntry(yamlString, sectionTitle, index, index + 1);
            if (next !== null) setYaml(next);
          }}
          disabled={index === total - 1}
          title="Move down"
          className="rounded border border-line px-1 text-[10px] text-ink-soft transition hover:border-ink-faint hover:text-ink disabled:opacity-30"
        >
          ▼
        </button>
        <button
          type="button"
          onClick={() => {
            const next = duplicateEntry(yamlString, sectionTitle, index);
            if (next !== null) setYaml(next);
          }}
          title="Duplicate"
          className="rounded border border-line px-1 text-[10px] text-ink-soft transition hover:border-ink-faint hover:text-ink"
        >
          ⧉
        </button>
        <button
          type="button"
          onClick={() => {
            const next = deleteEntry(yamlString, sectionTitle, index);
            if (next !== null) setYaml(next);
          }}
          title="Delete"
          className="rounded border border-line px-1 text-[10px] text-ink-soft transition hover:border-error hover:text-error"
        >
          ×
        </button>
      </div>
      {open && (
        <div className="border-t border-line px-2 py-2">
          <EntryEditor
            sectionTitle={sectionTitle}
            index={index}
            entryType={entryType}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Top-level sections list with "add section" controls.
 */
export function SectionsCard() {
  const yamlString = useCvStore((s) => s.yamlString);
  const setYaml = useCvStore((s) => s.setYaml);

  const sections = useMemo(() => {
    const { doc } = loadDoc(yamlString);
    if (!doc) return [];
    return getSections(doc);
  }, [yamlString]);

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<EntryTypeName>("ExperienceEntry");

  const doAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    const next = addSection(yamlString, title, newType);
    if (next !== null) {
      setYaml(next);
      setNewTitle("");
      setAdding(false);
    } else {
      alert(`A section named "${title}" already exists.`);
    }
  };

  return (
    <Card title="Sections" badge={`${sections.length}`} defaultOpen>
      <div className="flex flex-col gap-2">
        {sections.map((_, i) => (
          <SectionCard key={i} sectionIndex={i} />
        ))}

        {adding ? (
          <div className="flex flex-col gap-2 rounded border border-signal bg-paper p-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") doAdd();
                if (e.key === "Escape") setAdding(false);
              }}
              autoFocus
              placeholder="Section title (e.g. Experience)"
              className="w-full rounded border border-line bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-signal"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as EntryTypeName)}
              className="w-full rounded border border-line bg-paper px-1.5 py-1.5 text-xs text-ink outline-none focus:border-signal"
            >
              {SELECTABLE_ENTRY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ENTRY_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={doAdd}
                className="flex-1 rounded bg-signal px-2 py-1 text-xs font-semibold text-signal-contrast"
              >
                Add section
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded border border-line px-2 py-1 text-xs text-ink-soft"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full rounded border border-dashed border-line px-2 py-1.5 text-[11px] text-ink-soft transition hover:border-signal hover:text-signal"
          >
            + Add section
          </button>
        )}
      </div>
    </Card>
  );
}
