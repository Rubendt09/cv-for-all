/**
 * Declarative field descriptors per entry type.
 *
 * Drives the form UI: which fields to render, their labels, kinds, and
 * whether they're required. Aligned with the Zod schemas in
 * `src/yaml/schema.ts` so labels and required-ness match validation.
 */
import type { EntryTypeName } from "@/types/cv";

export type FieldKind =
  | "text"
  | "textarea"
  | "date"
  | "end-date"
  | "string-list";

export interface FieldDescriptor {
  key: string;
  label: string;
  kind: FieldKind;
  required: boolean;
  placeholder?: string;
  hint?: string;
}

/**
 * Fields per entry type. TextEntry is handled separately (single textarea).
 */
export const ENTRY_FIELDS: Record<
  Exclude<EntryTypeName, "TextEntry">,
  FieldDescriptor[]
> = {
  ExperienceEntry: [
    { key: "company", label: "Company", kind: "text", required: true },
    { key: "position", label: "Position", kind: "text", required: true },
    { key: "start_date", label: "Start date", kind: "date", required: false, hint: "YYYY | YYYY-MM | YYYY-MM-DD" },
    { key: "end_date", label: "End date", kind: "end-date", required: false, hint: "YYYY | YYYY-MM | YYYY-MM-DD | present" },
    { key: "date", label: "Date (single)", kind: "text", required: false, hint: "Overrides start/end" },
    { key: "location", label: "Location", kind: "text", required: false },
    { key: "summary", label: "Summary", kind: "textarea", required: false },
    { key: "highlights", label: "Highlights", kind: "string-list", required: false },
  ],
  EducationEntry: [
    { key: "institution", label: "Institution", kind: "text", required: true },
    { key: "area", label: "Area (field of study)", kind: "text", required: true },
    { key: "degree", label: "Degree", kind: "text", required: false },
    { key: "start_date", label: "Start date", kind: "date", required: false, hint: "YYYY | YYYY-MM | YYYY-MM-DD" },
    { key: "end_date", label: "End date", kind: "end-date", required: false, hint: "YYYY | YYYY-MM | YYYY-MM-DD | present" },
    { key: "date", label: "Date (single)", kind: "text", required: false, hint: "Overrides start/end" },
    { key: "location", label: "Location", kind: "text", required: false },
    { key: "summary", label: "Summary", kind: "textarea", required: false },
    { key: "highlights", label: "Highlights", kind: "string-list", required: false },
  ],
  NormalEntry: [
    { key: "name", label: "Name", kind: "text", required: true },
    { key: "start_date", label: "Start date", kind: "date", required: false, hint: "YYYY | YYYY-MM | YYYY-MM-DD" },
    { key: "end_date", label: "End date", kind: "end-date", required: false, hint: "YYYY | YYYY-MM | YYYY-MM-DD | present" },
    { key: "date", label: "Date (single)", kind: "text", required: false, hint: "Overrides start/end" },
    { key: "location", label: "Location", kind: "text", required: false },
    { key: "summary", label: "Summary", kind: "textarea", required: false },
    { key: "highlights", label: "Highlights", kind: "string-list", required: false },
  ],
  PublicationEntry: [
    { key: "title", label: "Title", kind: "text", required: true },
    { key: "authors", label: "Authors", kind: "string-list", required: true },
    { key: "date", label: "Date", kind: "text", required: false },
    { key: "summary", label: "Summary", kind: "textarea", required: false },
    { key: "doi", label: "DOI", kind: "text", required: false, hint: "Must start with '10.'" },
    { key: "url", label: "URL", kind: "text", required: false },
    { key: "journal", label: "Journal", kind: "text", required: false },
  ],
  BulletEntry: [
    { key: "bullet", label: "Bullet text", kind: "textarea", required: true },
  ],
  OneLineEntry: [
    { key: "label", label: "Label", kind: "text", required: true },
    { key: "details", label: "Details", kind: "text", required: true },
  ],
  NumberedEntry: [
    { key: "number", label: "Number / text", kind: "text", required: true },
  ],
  ReversedNumberedEntry: [
    { key: "reversed_number", label: "Text", kind: "text", required: true },
  ],
};

/**
 * Human-readable labels for entry types, used in the "add section" / "add
 * entry" selectors.
 */
export const ENTRY_TYPE_LABELS: Record<EntryTypeName, string> = {
  ExperienceEntry: "Experience (company + position)",
  EducationEntry: "Education (institution + area)",
  NormalEntry: "Normal (name)",
  PublicationEntry: "Publication (title + authors)",
  BulletEntry: "Bullet (single bullet)",
  OneLineEntry: "One-line (label + details)",
  NumberedEntry: "Numbered (number)",
  ReversedNumberedEntry: "Reversed numbered",
  TextEntry: "Text (plain strings)",
};

/**
 * Entry types selectable when creating a new section.
 * TextEntry is excluded from the selector — it's the fallback.
 */
export const SELECTABLE_ENTRY_TYPES: EntryTypeName[] = [
  "ExperienceEntry",
  "EducationEntry",
  "NormalEntry",
  "PublicationEntry",
  "OneLineEntry",
  "BulletEntry",
  "NumberedEntry",
  "ReversedNumberedEntry",
  "TextEntry",
];

/**
 * Social network names supported by the schema (mirrors schema.ts).
 */
export const SOCIAL_NETWORK_NAMES = [
  "LinkedIn",
  "GitHub",
  "GitLab",
  "IMDB",
  "Instagram",
  "ORCID",
  "Mastodon",
  "StackOverflow",
  "ResearchGate",
  "YouTube",
  "Google Scholar",
  "Telegram",
  "WhatsApp",
  "Leetcode",
  "X",
  "Bluesky",
  "Reddit",
] as const;
