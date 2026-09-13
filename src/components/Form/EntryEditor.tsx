/**
 * Editor for a single entry within a section. Renders fields based on the
 * entry type's descriptor table. TextEntry is a single textarea.
 */
import { useMemo } from "react";
import { useCvStore } from "@/store/cvStore";
import type { EntryTypeName } from "@/types/cv";
import {
  loadDoc,
  readEntryFields,
  setEntryField,
  setEntryListField,
} from "@/yaml/doc-editor";
import { ENTRY_FIELDS } from "./entry-fields";
import { TextField } from "./fields/TextField";
import { TextAreaField } from "./fields/TextAreaField";
import { DateField } from "./fields/DateField";
import { StringListField } from "./fields/StringListField";

interface EntryEditorProps {
  sectionTitle: string;
  index: number;
  entryType: EntryTypeName;
}

export function EntryEditor({ sectionTitle, index, entryType }: EntryEditorProps) {
  const yamlString = useCvStore((s) => s.yamlString);
  const setYaml = useCvStore((s) => s.setYaml);
  const errors = useCvStore((s) => s.errors);

  const fields = useMemo(() => {
    if (entryType === "TextEntry") return null;
    return ENTRY_FIELDS[entryType];
  }, [entryType]);

  const values = useMemo(() => {
    const { doc } = loadDoc(yamlString);
    if (!doc) return {};
    return readEntryFields(doc, sectionTitle, index);
  }, [yamlString, sectionTitle, index]);

  const errorFor = (field: string) =>
    errors.find(
      (e) =>
        e.path === `cv.sections.${sectionTitle}[${index}].${field}` ||
        e.path === `cv.sections.${sectionTitle}[${index}]`,
    )?.message;

  const updateField = (field: string, value: string) => {
    const next = setEntryField(yamlString, sectionTitle, index, field, value);
    if (next !== null) setYaml(next);
  };

  const updateList = (field: string, items: string[]) => {
    const next = setEntryListField(yamlString, sectionTitle, index, field, items);
    if (next !== null) setYaml(next);
  };

  // TextEntry: single textarea bound to the whole entry
  if (!fields) {
    const value = typeof values[""] === "string" ? values[""] : "";
    return (
      <TextAreaField
        value={value}
        onChange={(v) => updateField("", v)}
        placeholder="Plain text entry…"
        rows={2}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {fields.map((f) => {
        const v = values[f.key];
        const strValue = typeof v === "string" ? v : "";
        const listValue = Array.isArray(v) ? v : [];
        const err = errorFor(f.key);

        switch (f.kind) {
          case "textarea":
            return (
              <TextAreaField
                key={f.key}
                label={f.label}
                value={strValue}
                onChange={(val) => updateField(f.key, val)}
                placeholder={f.placeholder}
                hint={f.hint}
                error={err}
                rows={2}
              />
            );
          case "date":
            return (
              <DateField
                key={f.key}
                label={f.label}
                value={strValue}
                onChange={(val) => updateField(f.key, val)}
                hint={f.hint}
                error={err}
              />
            );
          case "end-date":
            return (
              <DateField
                key={f.key}
                label={f.label}
                value={strValue}
                onChange={(val) => updateField(f.key, val)}
                hint={f.hint}
                error={err}
                allowPresent
              />
            );
          case "string-list":
            return (
              <StringListField
                key={f.key}
                label={f.label}
                values={listValue}
                onChange={(items) => updateList(f.key, items)}
                placeholder={f.placeholder}
                error={err}
              />
            );
          case "text":
          default:
            return (
              <TextField
                key={f.key}
                label={f.label}
                value={strValue}
                onChange={(val) => updateField(f.key, val)}
                placeholder={f.placeholder}
                hint={f.hint}
                error={err}
              />
            );
        }
      })}
    </div>
  );
}
