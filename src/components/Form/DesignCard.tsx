/**
 * Card for the `design:` section of the YAML — the PDF appearance options.
 *
 * Each field shows the effective value (theme defaults merged with whatever
 * is written in the YAML, resolved through `designSchema`). Editing a field
 * writes an explicit value into `design:` via the surgical doc editor, so
 * the YAML only contains what the user actually overrode.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { z } from "zod";
import { useCvStore } from "@/store/cvStore";
import {
  loadDoc,
  getDesign,
  hasAliasesInDesign,
  setScalar,
  setStringList,
  setFontFamily,
} from "@/yaml/doc-editor";
import { designSchema } from "@/yaml/schema";
import type { ThemeName } from "@/types/cv";
import { Card } from "./Card";
import { TextField } from "./fields/TextField";
import { TextAreaField } from "./fields/TextAreaField";
import { SelectField } from "./fields/SelectField";
import { CheckboxField } from "./fields/CheckboxField";
import { ColorField } from "./fields/ColorField";
import { StringListField } from "./fields/StringListField";

type ResolvedDesign = z.infer<typeof designSchema>;
type FontArea = keyof ResolvedDesign["typography"]["font_family"];

// =============================================================================
// Option tables (mirror the enums in src/yaml/schema.ts)
// =============================================================================

const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "moderncv", label: "ModernCV" },
  { value: "sb2nov", label: "Sb2nov" },
  { value: "engineeringresumes", label: "Engineering Resumes" },
  { value: "engineeringclassic", label: "Engineering Classic" },
  { value: "harvard", label: "Harvard" },
  { value: "ink", label: "Ink" },
  { value: "opal", label: "Opal" },
  { value: "ember", label: "Ember" },
];

const PAGE_SIZES = ["a4", "a5", "us-letter", "us-executive"];
const ALIGNMENTS = ["left", "center", "right"];
const PHOTO_POSITIONS = ["left", "right"];
const BODY_ALIGNMENTS = [
  "left",
  "justified",
  "justified-with-no-hyphenation",
];
const SECTION_TITLE_TYPES = [
  "with_partial_line",
  "with_full_line",
  "without_line",
  "moderncv",
  "centered_without_line",
  "centered_with_partial_line",
  "centered_with_centered_partial_line",
  "centered_with_full_line",
];
const BULLETS = ["●", "•", "◦", "-", "◆", "★", "■", "—", "○"];
const PHONE_FORMATS = ["national", "international", "E164"];

const FONT_AREAS: { key: FontArea; label: string }[] = [
  { key: "body", label: "Body" },
  { key: "name", label: "Name" },
  { key: "headline", label: "Headline" },
  { key: "connections", label: "Connections" },
  { key: "section_titles", label: "Section titles" },
];

const TYPOGRAPHY_AREAS = [
  { key: "name", label: "Name" },
  { key: "headline", label: "Headline" },
  { key: "connections", label: "Connections" },
  { key: "section_titles", label: "Section titles" },
] as const;

const COLOR_FIELDS = [
  { key: "name", label: "Name" },
  { key: "headline", label: "Headline" },
  { key: "section_titles", label: "Section titles" },
  { key: "connections", label: "Connections" },
  { key: "links", label: "Links" },
  { key: "body", label: "Body text" },
  { key: "footer", label: "Footer" },
  { key: "top_note", label: "Top note" },
] as const;

const ENTRY_TEMPLATES = [
  {
    key: "experience_entry",
    label: "Experience",
    fields: ["main_column", "date_and_location_column"],
  },
  {
    key: "education_entry",
    label: "Education",
    fields: ["main_column", "degree_column", "date_and_location_column"],
  },
  {
    key: "normal_entry",
    label: "Normal",
    fields: ["main_column", "date_and_location_column"],
  },
  {
    key: "publication_entry",
    label: "Publication",
    fields: ["main_column", "date_and_location_column"],
  },
  { key: "one_line_entry", label: "One-line", fields: ["main_column"] },
] as const;

// =============================================================================
// Helpers
// =============================================================================

/** Read a raw sub-map; scalars/arrays/missing values become {}. */
function rawObj(v: unknown): Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

/** Display value for a text field: raw YAML scalar wins, else resolved default. */
function strVal(raw: unknown, resolved: unknown): string {
  if (typeof raw === "string") return raw;
  if (typeof raw === "number" || typeof raw === "boolean") return String(raw);
  return resolved == null ? "" : String(resolved);
}

/** Display value for a checkbox: raw YAML boolean wins, else resolved default. */
function boolVal(raw: unknown, resolved: unknown): boolean {
  if (typeof raw === "boolean") return raw;
  return resolved === true;
}

/** Collapsible sub-group inside the design card. */
function DesignGroup({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded border border-line bg-paper">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-2 py-1.5 text-left"
      >
        <span
          className="inline-block text-[9px] text-ink-faint transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
        >
          ▶
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
          {title}
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-2.5 border-t border-line px-2 py-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function DesignCard() {
  const yamlString = useCvStore((s) => s.yamlString);
  const setYaml = useCvStore((s) => s.setYaml);
  const selectedTheme = useCvStore((s) => s.selectedTheme);
  const setTheme = useCvStore((s) => s.setTheme);
  const errors = useCvStore((s) => s.errors);

  const { raw, resolved, hasAliases } = useMemo(() => {
    const { doc } = loadDoc(yamlString);
    if (!doc) {
      return { raw: {}, resolved: null, hasAliases: false };
    }
    const raw = getDesign(doc);
    const parsed = designSchema.safeParse(raw);
    let resolved: ResolvedDesign | null = parsed.success
      ? parsed.data
      : null;
    if (!resolved) {
      // Invalid user values somewhere — fall back to defaults for the
      // (possibly invalid) theme so the form still renders.
      const retry = designSchema.safeParse({
        theme: typeof raw.theme === "string" ? raw.theme : undefined,
      });
      resolved = retry.success ? retry.data : designSchema.parse({});
    }
    return { raw, resolved, hasAliases: hasAliasesInDesign(doc) };
  }, [yamlString]);

  // Keep the header theme selector in sync with design.theme in the YAML.
  const resolvedTheme = resolved?.theme;
  useEffect(() => {
    if (resolvedTheme && resolvedTheme !== selectedTheme) {
      setTheme(resolvedTheme);
    }
  }, [resolvedTheme, selectedTheme, setTheme]);

  if (!resolved) return null;

  const errorFor = (path: string) =>
    errors.find((e) => e.path === path)?.message;

  const update = (
    path: (string | number)[],
    value: string | boolean | number,
  ) => {
    const next = setScalar(yamlString, path, value);
    if (next !== null) setYaml(next);
  };

  const updateFont = (area: FontArea, v: string) => {
    const next = setFontFamily(yamlString, area, v);
    if (next !== null) setYaml(next);
  };

  // Raw sub-objects (what is literally written in the YAML)
  const rPage = rawObj(raw.page);
  const rColors = rawObj(raw.colors);
  const rTypo = rawObj(raw.typography);
  const rFontSize = rawObj(rTypo.font_size);
  const rSmallCaps = rawObj(rTypo.small_caps);
  const rBold = rawObj(rTypo.bold);
  const rLinks = rawObj(raw.links);
  const rHeader = rawObj(raw.header);
  const rConn = rawObj(rHeader.connections);
  const rSecTitles = rawObj(raw.section_titles);
  const rSections = rawObj(raw.sections);
  const rEntries = rawObj(raw.entries);
  const rSummary = rawObj(rEntries.summary);
  const rHighlights = rawObj(rEntries.highlights);
  const rTemplates = rawObj(raw.templates);
  const rawFF = rTypo.font_family; // scalar or map per the schema
  const rawFontAt = (area: FontArea): unknown =>
    typeof rawFF === "string" ? rawFF : rawObj(rawFF)[area];

  const onThemeChange = (v: string) => {
    const next = setScalar(yamlString, ["design", "theme"], v);
    if (next !== null) {
      setYaml(next);
      setTheme(v as ThemeName);
    }
  };

  return (
    <Card title="PDF Design">
      {hasAliases ? (
        <div className="rounded border border-error bg-error-soft px-3 py-2 text-xs text-error">
          The design: section uses anchors/aliases. Edit it in the YAML
          editor.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <SelectField
            label="Theme"
            value={strVal(raw.theme, resolved.theme)}
            onChange={onThemeChange}
            options={THEME_OPTIONS}
            error={errorFor("design.theme")}
          />

          {/* ============================== Page ============================== */}
          <DesignGroup title="Page" defaultOpen>
            <SelectField
              label="Page size"
              value={strVal(rPage.size, resolved.page.size)}
              onChange={(v) => update(["design", "page", "size"], v)}
              options={PAGE_SIZES}
              error={errorFor("design.page.size")}
            />
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
              <TextField
                label="Top margin"
                value={strVal(rPage.top_margin, resolved.page.top_margin)}
                onChange={(v) => update(["design", "page", "top_margin"], v)}
                monospace
              />
              <TextField
                label="Bottom margin"
                value={strVal(rPage.bottom_margin, resolved.page.bottom_margin)}
                onChange={(v) => update(["design", "page", "bottom_margin"], v)}
                monospace
              />
              <TextField
                label="Left margin"
                value={strVal(rPage.left_margin, resolved.page.left_margin)}
                onChange={(v) => update(["design", "page", "left_margin"], v)}
                monospace
              />
              <TextField
                label="Right margin"
                value={strVal(rPage.right_margin, resolved.page.right_margin)}
                onChange={(v) => update(["design", "page", "right_margin"], v)}
                monospace
              />
            </div>
            <div className="grid grid-cols-2 gap-x-2">
              <CheckboxField
                label="Show footer"
                checked={boolVal(rPage.show_footer, resolved.page.show_footer)}
                onChange={(v) => update(["design", "page", "show_footer"], v)}
              />
              <CheckboxField
                label="Show top note"
                checked={boolVal(rPage.show_top_note, resolved.page.show_top_note)}
                onChange={(v) => update(["design", "page", "show_top_note"], v)}
              />
            </div>
          </DesignGroup>

          {/* ============================= Colors ============================= */}
          <DesignGroup title="Colors">
            <div className="grid grid-cols-1 gap-x-2 gap-y-2.5 sm:grid-cols-2">
              {COLOR_FIELDS.map(({ key, label }) => (
                <ColorField
                  key={key}
                  label={label}
                  value={strVal(rColors[key], resolved.colors[key])}
                  onChange={(v) => update(["design", "colors", key], v)}
                  error={errorFor(`design.colors.${key}`)}
                />
              ))}
            </div>
          </DesignGroup>

          {/* =========================== Typography =========================== */}
          <DesignGroup title="Typography">
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
              <SelectField
                label="Body alignment"
                value={strVal(rTypo.alignment, resolved.typography.alignment)}
                onChange={(v) => update(["design", "typography", "alignment"], v)}
                options={BODY_ALIGNMENTS}
                error={errorFor("design.typography.alignment")}
              />
              <SelectField
                label="Date/location align"
                value={strVal(
                  rTypo.date_and_location_column_alignment,
                  resolved.typography.date_and_location_column_alignment,
                )}
                onChange={(v) =>
                  update(
                    ["design", "typography", "date_and_location_column_alignment"],
                    v,
                  )
                }
                options={ALIGNMENTS}
                error={errorFor(
                  "design.typography.date_and_location_column_alignment",
                )}
              />
              <TextField
                label="Line spacing"
                value={strVal(rTypo.line_spacing, resolved.typography.line_spacing)}
                onChange={(v) =>
                  update(["design", "typography", "line_spacing"], v)
                }
                monospace
              />
            </div>

            <div>
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                Font family
              </span>
              <div className="grid grid-cols-1 gap-x-2 gap-y-2.5 sm:grid-cols-2">
                {FONT_AREAS.map(({ key, label }) => (
                  <TextField
                    key={key}
                    label={label}
                    value={strVal(
                      rawFontAt(key),
                      resolved.typography.font_family[key],
                    )}
                    onChange={(v) => updateFont(key, v)}
                    error={errorFor(`design.typography.font_family.${key}`)}
                  />
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                Font size
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 sm:grid-cols-3">
                {FONT_AREAS.map(({ key, label }) => (
                  <TextField
                    key={key}
                    label={label}
                    value={strVal(
                      rFontSize[key],
                      resolved.typography.font_size[key],
                    )}
                    onChange={(v) =>
                      update(["design", "typography", "font_size", key], v)
                    }
                    monospace
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:grid-cols-2">
              <div>
                <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                  Bold
                </span>
                {TYPOGRAPHY_AREAS.map(({ key, label }) => (
                  <CheckboxField
                    key={key}
                    label={label}
                    checked={boolVal(
                      rBold[key],
                      resolved.typography.bold[key],
                    )}
                    onChange={(v) =>
                      update(["design", "typography", "bold", key], v)
                    }
                  />
                ))}
              </div>
              <div>
                <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                  Small caps
                </span>
                {TYPOGRAPHY_AREAS.map(({ key, label }) => (
                  <CheckboxField
                    key={key}
                    label={label}
                    checked={boolVal(
                      rSmallCaps[key],
                      resolved.typography.small_caps[key],
                    )}
                    onChange={(v) =>
                      update(["design", "typography", "small_caps", key], v)
                    }
                  />
                ))}
              </div>
            </div>
          </DesignGroup>

          {/* ============================= Header ============================= */}
          <DesignGroup title="Header layout">
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
              <SelectField
                label="Alignment"
                value={strVal(rHeader.alignment, resolved.header.alignment)}
                onChange={(v) => update(["design", "header", "alignment"], v)}
                options={ALIGNMENTS}
              />
              <SelectField
                label="Photo position"
                value={strVal(
                  rHeader.photo_position,
                  resolved.header.photo_position,
                )}
                onChange={(v) =>
                  update(["design", "header", "photo_position"], v)
                }
                options={PHOTO_POSITIONS}
              />
              <TextField
                label="Photo width"
                value={strVal(rHeader.photo_width, resolved.header.photo_width)}
                onChange={(v) => update(["design", "header", "photo_width"], v)}
                monospace
              />
              <TextField
                label="Photo space left"
                value={strVal(
                  rHeader.photo_space_left,
                  resolved.header.photo_space_left,
                )}
                onChange={(v) =>
                  update(["design", "header", "photo_space_left"], v)
                }
                monospace
              />
              <TextField
                label="Photo space right"
                value={strVal(
                  rHeader.photo_space_right,
                  resolved.header.photo_space_right,
                )}
                onChange={(v) =>
                  update(["design", "header", "photo_space_right"], v)
                }
                monospace
              />
              <TextField
                label="Space below name"
                value={strVal(
                  rHeader.space_below_name,
                  resolved.header.space_below_name,
                )}
                onChange={(v) =>
                  update(["design", "header", "space_below_name"], v)
                }
                monospace
              />
              <TextField
                label="Space below headline"
                value={strVal(
                  rHeader.space_below_headline,
                  resolved.header.space_below_headline,
                )}
                onChange={(v) =>
                  update(["design", "header", "space_below_headline"], v)
                }
                monospace
              />
              <TextField
                label="Space below connections"
                value={strVal(
                  rHeader.space_below_connections,
                  resolved.header.space_below_connections,
                )}
                onChange={(v) =>
                  update(["design", "header", "space_below_connections"], v)
                }
                monospace
              />
            </div>

            <div>
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                Connections
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
                <SelectField
                  label="Phone format"
                  value={strVal(
                    rConn.phone_number_format,
                    resolved.header.connections.phone_number_format,
                  )}
                  onChange={(v) =>
                    update(
                      ["design", "header", "connections", "phone_number_format"],
                      v,
                    )
                  }
                  options={PHONE_FORMATS}
                />
                <TextField
                  label="Separator"
                  value={strVal(
                    rConn.separator,
                    resolved.header.connections.separator,
                  )}
                  onChange={(v) =>
                    update(["design", "header", "connections", "separator"], v)
                  }
                  hint="Empty = theme default separator"
                />
                <TextField
                  label="Space between"
                  value={strVal(
                    rConn.space_between_connections,
                    resolved.header.connections.space_between_connections,
                  )}
                  onChange={(v) =>
                    update(
                      [
                        "design",
                        "header",
                        "connections",
                        "space_between_connections",
                      ],
                      v,
                    )
                  }
                  monospace
                />
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-x-2">
                <CheckboxField
                  label="Show icons"
                  checked={boolVal(
                    rConn.show_icons,
                    resolved.header.connections.show_icons,
                  )}
                  onChange={(v) =>
                    update(["design", "header", "connections", "show_icons"], v)
                  }
                />
                <CheckboxField
                  label="Hyperlink"
                  checked={boolVal(
                    rConn.hyperlink,
                    resolved.header.connections.hyperlink,
                  )}
                  onChange={(v) =>
                    update(["design", "header", "connections", "hyperlink"], v)
                  }
                />
                <CheckboxField
                  label="Show URLs instead of usernames"
                  checked={boolVal(
                    rConn.display_urls_instead_of_usernames,
                    resolved.header.connections
                      .display_urls_instead_of_usernames,
                  )}
                  onChange={(v) =>
                    update(
                      [
                        "design",
                        "header",
                        "connections",
                        "display_urls_instead_of_usernames",
                      ],
                      v,
                    )
                  }
                />
              </div>
            </div>
          </DesignGroup>

          {/* ========================= Section titles ========================= */}
          <DesignGroup title="Section titles">
            <SelectField
              label="Style"
              value={strVal(rSecTitles.type, resolved.section_titles.type)}
              onChange={(v) => update(["design", "section_titles", "type"], v)}
              options={SECTION_TITLE_TYPES}
              error={errorFor("design.section_titles.type")}
            />
            <div className="grid grid-cols-3 gap-x-2 gap-y-2.5">
              <TextField
                label="Line thickness"
                value={strVal(
                  rSecTitles.line_thickness,
                  resolved.section_titles.line_thickness,
                )}
                onChange={(v) =>
                  update(["design", "section_titles", "line_thickness"], v)
                }
                monospace
              />
              <TextField
                label="Space above"
                value={strVal(
                  rSecTitles.space_above,
                  resolved.section_titles.space_above,
                )}
                onChange={(v) =>
                  update(["design", "section_titles", "space_above"], v)
                }
                monospace
              />
              <TextField
                label="Space below"
                value={strVal(
                  rSecTitles.space_below,
                  resolved.section_titles.space_below,
                )}
                onChange={(v) =>
                  update(["design", "section_titles", "space_below"], v)
                }
                monospace
              />
            </div>
          </DesignGroup>

          {/* ============================ Sections ============================ */}
          <DesignGroup title="Sections">
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
              <TextField
                label="Space between entries"
                value={strVal(
                  rSections.space_between_regular_entries,
                  resolved.sections.space_between_regular_entries,
                )}
                onChange={(v) =>
                  update(
                    ["design", "sections", "space_between_regular_entries"],
                    v,
                  )
                }
                monospace
              />
              <TextField
                label="Space between text entries"
                value={strVal(
                  rSections.space_between_text_based_entries,
                  resolved.sections.space_between_text_based_entries,
                )}
                onChange={(v) =>
                  update(
                    ["design", "sections", "space_between_text_based_entries"],
                    v,
                  )
                }
                monospace
              />
            </div>
            <CheckboxField
              label="Allow page break inside sections"
              checked={boolVal(
                rSections.allow_page_break,
                resolved.sections.allow_page_break,
              )}
              onChange={(v) =>
                update(["design", "sections", "allow_page_break"], v)
              }
            />
            <StringListField
              label="Show time spans in"
              values={
                Array.isArray(rSections.show_time_spans_in)
                  ? rSections.show_time_spans_in.map(String)
                  : resolved.sections.show_time_spans_in
              }
              onChange={(vals) => {
                const next = setStringList(
                  yamlString,
                  ["design", "sections", "show_time_spans_in"],
                  vals,
                );
                if (next !== null) setYaml(next);
              }}
              placeholder="e.g. experience"
              hint="Section keys whose entries show a duration"
              minItems={0}
            />
          </DesignGroup>

          {/* ============================= Entries ============================ */}
          <DesignGroup title="Entries">
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
              <TextField
                label="Date/location width"
                value={strVal(
                  rEntries.date_and_location_width,
                  resolved.entries.date_and_location_width,
                )}
                onChange={(v) =>
                  update(["design", "entries", "date_and_location_width"], v)
                }
                monospace
              />
              <TextField
                label="Side space"
                value={strVal(rEntries.side_space, resolved.entries.side_space)}
                onChange={(v) => update(["design", "entries", "side_space"], v)}
                monospace
              />
              <TextField
                label="Space between columns"
                value={strVal(
                  rEntries.space_between_columns,
                  resolved.entries.space_between_columns,
                )}
                onChange={(v) =>
                  update(["design", "entries", "space_between_columns"], v)
                }
                monospace
              />
              <TextField
                label="Degree column width"
                value={strVal(
                  rEntries.degree_width,
                  resolved.entries.degree_width,
                )}
                onChange={(v) =>
                  update(["design", "entries", "degree_width"], v)
                }
                monospace
              />
            </div>
            <div className="grid grid-cols-2 gap-x-2">
              <CheckboxField
                label="Allow page break inside entries"
                checked={boolVal(
                  rEntries.allow_page_break,
                  resolved.entries.allow_page_break,
                )}
                onChange={(v) =>
                  update(["design", "entries", "allow_page_break"], v)
                }
              />
              <CheckboxField
                label="Short second row"
                checked={boolVal(
                  rEntries.short_second_row,
                  resolved.entries.short_second_row,
                )}
                onChange={(v) =>
                  update(["design", "entries", "short_second_row"], v)
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
              <TextField
                label="Summary space above"
                value={strVal(
                  rSummary.space_above,
                  resolved.entries.summary.space_above,
                )}
                onChange={(v) =>
                  update(["design", "entries", "summary", "space_above"], v)
                }
                monospace
              />
              <TextField
                label="Summary space left"
                value={strVal(
                  rSummary.space_left,
                  resolved.entries.summary.space_left,
                )}
                onChange={(v) =>
                  update(["design", "entries", "summary", "space_left"], v)
                }
                monospace
              />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                Highlights
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
                <SelectField
                  label="Bullet"
                  value={strVal(
                    rHighlights.bullet,
                    resolved.entries.highlights.bullet,
                  )}
                  onChange={(v) =>
                    update(["design", "entries", "highlights", "bullet"], v)
                  }
                  options={BULLETS}
                />
                <SelectField
                  label="Nested bullet"
                  value={strVal(
                    rHighlights.nested_bullet,
                    resolved.entries.highlights.nested_bullet,
                  )}
                  onChange={(v) =>
                    update(
                      ["design", "entries", "highlights", "nested_bullet"],
                      v,
                    )
                  }
                  options={BULLETS}
                />
                <TextField
                  label="Space left"
                  value={strVal(
                    rHighlights.space_left,
                    resolved.entries.highlights.space_left,
                  )}
                  onChange={(v) =>
                    update(
                      ["design", "entries", "highlights", "space_left"],
                      v,
                    )
                  }
                  monospace
                />
                <TextField
                  label="Space above"
                  value={strVal(
                    rHighlights.space_above,
                    resolved.entries.highlights.space_above,
                  )}
                  onChange={(v) =>
                    update(
                      ["design", "entries", "highlights", "space_above"],
                      v,
                    )
                  }
                  monospace
                />
                <TextField
                  label="Between items"
                  value={strVal(
                    rHighlights.space_between_items,
                    resolved.entries.highlights.space_between_items,
                  )}
                  onChange={(v) =>
                    update(
                      ["design", "entries", "highlights", "space_between_items"],
                      v,
                    )
                  }
                  monospace
                />
                <TextField
                  label="Bullet ↔ text"
                  value={strVal(
                    rHighlights.space_between_bullet_and_text,
                    resolved.entries.highlights.space_between_bullet_and_text,
                  )}
                  onChange={(v) =>
                    update(
                      [
                        "design",
                        "entries",
                        "highlights",
                        "space_between_bullet_and_text",
                      ],
                      v,
                    )
                  }
                  monospace
                />
              </div>
            </div>
          </DesignGroup>

          {/* ============================== Links ============================= */}
          <DesignGroup title="Links">
            <div className="grid grid-cols-2 gap-x-2">
              <CheckboxField
                label="Underline links"
                checked={boolVal(rLinks.underline, resolved.links.underline)}
                onChange={(v) => update(["design", "links", "underline"], v)}
              />
              <CheckboxField
                label="External link icon"
                checked={boolVal(
                  rLinks.show_external_link_icon,
                  resolved.links.show_external_link_icon,
                )}
                onChange={(v) =>
                  update(["design", "links", "show_external_link_icon"], v)
                }
              />
            </div>
          </DesignGroup>

          {/* ============================ Templates =========================== */}
          <DesignGroup title="Templates">
            <p className="text-[11px] text-ink-faint">
              Placeholders like NAME, DATE, PAGE_NUMBER. Empty resets to the
              theme default.
            </p>
            <div className="grid grid-cols-1 gap-y-2.5">
              <TextField
                label="Footer"
                value={strVal(rTemplates.footer, resolved.templates.footer)}
                onChange={(v) => update(["design", "templates", "footer"], v)}
                monospace
              />
              <TextField
                label="Top note"
                value={strVal(rTemplates.top_note, resolved.templates.top_note)}
                onChange={(v) => update(["design", "templates", "top_note"], v)}
                monospace
              />
              <div className="grid grid-cols-3 gap-x-2">
                <TextField
                  label="Single date"
                  value={strVal(
                    rTemplates.single_date,
                    resolved.templates.single_date,
                  )}
                  onChange={(v) =>
                    update(["design", "templates", "single_date"], v)
                  }
                  monospace
                />
                <TextField
                  label="Date range"
                  value={strVal(
                    rTemplates.date_range,
                    resolved.templates.date_range,
                  )}
                  onChange={(v) =>
                    update(["design", "templates", "date_range"], v)
                  }
                  monospace
                />
                <TextField
                  label="Time span"
                  value={strVal(
                    rTemplates.time_span,
                    resolved.templates.time_span,
                  )}
                  onChange={(v) =>
                    update(["design", "templates", "time_span"], v)
                  }
                  monospace
                />
              </div>
            </div>

            {ENTRY_TEMPLATES.map(({ key, label, fields }) => (
              <div key={key}>
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                  {label} entry
                </span>
                <div className="flex flex-col gap-2">
                  {fields.map((field) => (
                    <TextAreaField
                      key={field}
                      label={field.replace(/_/g, " ")}
                      rows={2}
                      value={strVal(
                        rawObj(rTemplates[key])[field],
                        (resolved.templates[key] as Record<string, unknown>)[
                          field
                        ],
                      )}
                      onChange={(v) =>
                        update(["design", "templates", key, field], v)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </DesignGroup>
        </div>
      )}
    </Card>
  );
}
