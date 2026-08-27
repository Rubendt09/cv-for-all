/**
 * Zod schema for the RenderCV-compatible YAML format.
 *
 * Ported from RenderCV's Pydantic models (src/rendercv/schema/models/).
 * Validates the cv / design / locale / settings structure with
 * user-friendly error messages.
 *
 * Note: Zod 4.x is used. Some API differences from Zod 3:
 * - `z.string().email()` → `z.email()`
 * - `z.string().url()` → `z.url()`
 */
import { z } from "zod";
import { getThemeDefaults } from "@/yaml/theme-defaults";
import type { ThemeName } from "@/types/cv";

// =============================================================================
// Helper: make a schema default to {} with inner defaults applied
// =============================================================================

/**
 * Wrap a Zod object schema so that undefined/missing values are treated as {}
 * and inner field defaults are applied. Zod 4's `.default({})` does NOT
 * re-parse the default value, so inner defaults are lost. This helper uses
 * `z.preprocess` to convert undefined → {} before parsing, ensuring inner
 * defaults fill in correctly.
 */
function withEmptyDefaults<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((v) => v ?? {}, schema);
}

// =============================================================================
// Date validation helpers
// =============================================================================

const exactDatePattern =
  /^(?:\d{4}-\d{2}-\d{2}|\d{4}-\d{2}|\d{4})$/;

const exactDateSchema = z
  .union([z.string(), z.number()])
  .refine(
    (val) => {
      const s = String(val);
      if (s === "present") return false; // "present" is handled separately
      return exactDatePattern.test(s);
    },
    {
      message:
        'Date must be in YYYY-MM-DD, YYYY-MM, or YYYY format (or "present" for end_date).',
    },
  );

const arbitraryDateSchema = z.union([z.string(), z.number()]);

// =============================================================================
// Social networks
// =============================================================================

const socialNetworkNames = [
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

const socialNetworkSchema = z
  .object({
    network: z.enum(socialNetworkNames),
    username: z.string().min(1, "Username is required."),
  })
  .superRefine((data, ctx) => {
    const { network, username } = data;
    const validators: Record<string, { test: (v: string) => boolean; message: string }> = {
      Mastodon: {
        test: (v) => /^@[^@]+@[^@]+$/.test(v),
        message: 'Mastodon username should be in the format "@username@domain".',
      },
      StackOverflow: {
        test: (v) => /^\d+\/[^/]+$/.test(v),
        message: 'StackOverflow username should be in the format "user_id/username".',
      },
      YouTube: {
        test: (v) => !v.startsWith("@"),
        message: 'YouTube username should not start with "@". Remove "@" from the beginning.',
      },
      ORCID: {
        test: (v) => /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(v),
        message: "ORCID username should be in the format 'XXXX-XXXX-XXXX-XXX'.",
      },
      IMDB: {
        test: (v) => /^nm\d{7}$/.test(v),
        message: "IMDB name should be in the format 'nmXXXXXXX'.",
      },
      Bluesky: {
        test: (v) =>
          /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(v),
        message: "Bluesky username should be a valid handle with no '@' (e.g., 'username.bsky.social').",
      },
      Reddit: {
        test: (v) => /^[a-zA-Z0-9_-]{3,23}$/.test(v),
        message: "Reddit username should be 3-23 chars of letters, numbers, underscores, and hyphens.",
      },
    };

    const validator = validators[network];
    if (validator && !validator.test(username)) {
      ctx.addIssue({
        code: "custom",
        message: validator.message,
        path: ["username"],
      });
    }
  });

const customConnectionSchema = z.object({
  fontawesome_icon: z.string().min(1, "Font Awesome icon name is required."),
  placeholder: z.string().min(1, "Placeholder text is required."),
  url: z.url("A valid URL is required.").nullish(),
});

// =============================================================================
// Entry types
// =============================================================================

/** Fields shared by entries with complex fields (dates, location, summary, highlights). */
const baseEntryWithComplexFieldsSchema = z.looseObject({
  start_date: exactDateSchema.nullish(),
  end_date: z
    .union([exactDateSchema, z.literal("present")])
    .nullish(),
  date: arbitraryDateSchema.nullish(),
  location: z.string().nullish(),
  summary: z.string().nullish(),
  highlights: z
    .array(z.unknown())
    .transform((vals) =>
      vals.map((v) => (typeof v === "string" ? v : JSON.stringify(v))),
    )
    .nullish(),
});

const baseEntryWithDateSchema = z.looseObject({
  date: arbitraryDateSchema.nullish(),
});

export const experienceEntrySchema = baseEntryWithComplexFieldsSchema.extend({
  company: z.string().min(1, "Company is required."),
  position: z.string().min(1, "Position is required."),
});

export const educationEntrySchema = baseEntryWithComplexFieldsSchema.extend({
  institution: z.string().min(1, "Institution is required."),
  area: z.string().min(1, "Area (field of study) is required."),
  degree: z.string().nullish(),
});

export const normalEntrySchema = baseEntryWithComplexFieldsSchema.extend({
  name: z.string().min(1, "Name is required."),
});

export const publicationEntrySchema = baseEntryWithDateSchema.extend({
  title: z.string().min(1, "Title is required."),
  authors: z
    .array(z.string())
    .min(1, "At least one author is required."),
  summary: z.string().nullish(),
  doi: z
    .string()
    .regex(/\b10\..*/, "DOI must start with '10.'")
    .nullish(),
  url: z.url("A valid URL is required.").nullish(),
  journal: z.string().nullish(),
});

export const bulletEntrySchema = z.looseObject({
  bullet: z.string().min(1, "Bullet text is required."),
});

export const oneLineEntrySchema = z.looseObject({
  label: z.string().min(1, "Label is required."),
  details: z.string().min(1, "Details are required."),
});

export const numberedEntrySchema = z.looseObject({
  number: z.string().min(1, "Number/text is required."),
});

export const reversedNumberedEntrySchema = z.looseObject({
  reversed_number: z.string().min(1, "Text is required."),
});

/** Text entries are plain strings. */
export const textEntrySchema = z.string();

// =============================================================================
// CV
// =============================================================================

const emailOrList = z.union([z.email("Invalid email address."), z.array(z.email())]);
const urlOrList = z.union([z.url("Invalid URL."), z.array(z.url())]);
const phoneOrList = z.union([z.string().min(1), z.array(z.string().min(1))]);

const cvSchema = z.object({
  name: z.string().nullish(),
  headline: z.string().nullish(),
  location: z.string().nullish(),
  email: emailOrList.nullish(),
  photo: z.union([z.string(), z.url()]).nullish(),
  phone: phoneOrList.nullish(),
  website: urlOrList.nullish(),
  social_networks: z.array(socialNetworkSchema).nullish(),
  custom_connections: z.array(customConnectionSchema).nullish(),
  // Sections are validated separately via entry-detection logic.
  // We accept any record of arrays here, then validate entries per-section.
  sections: z
    .record(z.string(), z.array(z.union([z.string(), z.record(z.string(), z.unknown())])))
    .nullish(),
});

// =============================================================================
// Design
// =============================================================================

const themeNames = [
  "classic",
  "moderncv",
  "sb2nov",
  "engineeringresumes",
  "engineeringclassic",
  "harvard",
  "ink",
  "opal",
  "ember",
] as const;

const pageSizeValues = ["a4", "a5", "us-letter", "us-executive"] as const;
const alignmentValues = ["left", "center", "right"] as const;
const bodyAlignmentValues = [
  "left",
  "justified",
  "justified-with-no-hyphenation",
] as const;
const sectionTitleTypes = [
  "with_partial_line",
  "with_full_line",
  "without_line",
  "moderncv",
  "centered_without_line",
  "centered_with_partial_line",
  "centered_with_centered_partial_line",
  "centered_with_full_line",
] as const;
const bulletValues = ["●", "•", "◦", "-", "◆", "★", "■", "—", "○"] as const;
const phoneNumberFormats = ["national", "international", "E164"] as const;

const typstDimension = z.string().min(1);
const colorSchema = z.string().min(1);

const pageSchema = z.object({
  size: z.enum(pageSizeValues).default("us-letter"),
  top_margin: typstDimension.default("0.7in"),
  bottom_margin: typstDimension.default("0.7in"),
  left_margin: typstDimension.default("0.7in"),
  right_margin: typstDimension.default("0.7in"),
  show_footer: z.boolean().default(true),
  show_top_note: z.boolean().default(true),
});

const colorsSchema = z.object({
  body: colorSchema.default("rgb(0, 0, 0)"),
  name: colorSchema.default("rgb(0, 79, 144)"),
  headline: colorSchema.default("rgb(0, 79, 144)"),
  connections: colorSchema.default("rgb(0, 79, 144)"),
  section_titles: colorSchema.default("rgb(0, 79, 144)"),
  links: colorSchema.default("rgb(0, 79, 144)"),
  footer: colorSchema.default("rgb(128, 128, 128)"),
  top_note: colorSchema.default("rgb(128, 128, 128)"),
});

const fontFamilySchema = z.object({
  body: z.string().default("Libertinus Serif"),
  name: z.string().default("Libertinus Serif"),
  headline: z.string().default("Libertinus Serif"),
  connections: z.string().default("Libertinus Serif"),
  section_titles: z.string().default("Libertinus Serif"),
});

const fontSizeSchema = z.object({
  body: typstDimension.default("10pt"),
  name: typstDimension.default("30pt"),
  headline: typstDimension.default("10pt"),
  connections: typstDimension.default("10pt"),
  section_titles: typstDimension.default("1.4em"),
});

const smallCapsSchema = z.object({
  name: z.boolean().default(false),
  headline: z.boolean().default(false),
  connections: z.boolean().default(false),
  section_titles: z.boolean().default(false),
});

const boldSchema = z.object({
  name: z.boolean().default(true),
  headline: z.boolean().default(false),
  connections: z.boolean().default(false),
  section_titles: z.boolean().default(true),
});

const typographySchema = z.object({
  line_spacing: typstDimension.default("0.6em"),
  alignment: z.enum(bodyAlignmentValues).default("justified"),
  date_and_location_column_alignment: z.enum(alignmentValues).default("right"),
  font_family: z
    .union([fontFamilySchema, z.string()])
    .transform((val) =>
      typeof val === "string"
        ? {
            body: val,
            name: val,
            headline: val,
            connections: val,
            section_titles: val,
          }
        : val,
    )
    .default(() => ({
      body: "Libertinus Serif",
      name: "Libertinus Serif",
      headline: "Libertinus Serif",
      connections: "Libertinus Serif",
      section_titles: "Libertinus Serif",
    })),
  font_size: withEmptyDefaults(fontSizeSchema),
  small_caps: withEmptyDefaults(smallCapsSchema),
  bold: withEmptyDefaults(boldSchema),
});

const linksSchema = z.object({
  underline: z.boolean().default(false),
  show_external_link_icon: z.boolean().default(false),
});

const connectionsSchema = z.object({
  phone_number_format: z.enum(phoneNumberFormats).default("national"),
  hyperlink: z.boolean().default(true),
  show_icons: z.boolean().default(true),
  display_urls_instead_of_usernames: z.boolean().default(false),
  separator: z.string().default(""),
  space_between_connections: typstDimension.default("0.5cm"),
});

const headerSchema = z.object({
  alignment: z.enum(alignmentValues).default("center"),
  photo_width: typstDimension.default("3.5cm"),
  photo_position: z.enum(["left", "right"]).default("left"),
  photo_space_left: typstDimension.default("0.4cm"),
  photo_space_right: typstDimension.default("0.4cm"),
  space_below_name: typstDimension.default("0.7cm"),
  space_below_headline: typstDimension.default("0.7cm"),
  space_below_connections: typstDimension.default("0.7cm"),
  connections: withEmptyDefaults(connectionsSchema),
});

const sectionTitlesSchema = z.object({
  type: z.enum(sectionTitleTypes).default("with_partial_line"),
  line_thickness: typstDimension.default("0.5pt"),
  space_above: typstDimension.default("0.5cm"),
  space_below: typstDimension.default("0.3cm"),
});

const sectionsDesignSchema = z.object({
  allow_page_break: z.boolean().default(true),
  space_between_regular_entries: typstDimension.default("1.2em"),
  space_between_text_based_entries: typstDimension.default("0.3em"),
  show_time_spans_in: z
    .array(z.string())
    .default(["experience"])
    .transform((vals) =>
      vals.map((s) => s.toLowerCase().replace(/ /g, "_")),
    ),
});

const summarySchema = z.object({
  space_above: typstDimension.default("0cm"),
  space_left: typstDimension.default("0cm"),
});

const highlightsSchema = z.object({
  bullet: z.enum(bulletValues).default("•"),
  nested_bullet: z.enum(bulletValues).default("•"),
  space_left: typstDimension.default("0.15cm"),
  space_above: typstDimension.default("0cm"),
  space_between_items: typstDimension.default("0cm"),
  space_between_bullet_and_text: typstDimension.default("0.5em"),
});

const entriesSchema = z.object({
  date_and_location_width: typstDimension.default("4.15cm"),
  side_space: typstDimension.default("0.2cm"),
  space_between_columns: typstDimension.default("0.1cm"),
  allow_page_break: z.boolean().default(false),
  short_second_row: z.boolean().default(true),
  degree_width: typstDimension.default("1cm"),
  summary: withEmptyDefaults(summarySchema),
  highlights: withEmptyDefaults(highlightsSchema),
});

const oneLineEntryTemplateSchema = z.object({
  main_column: z.string().default("**LABEL:** DETAILS"),
});

const educationEntryTemplateSchema = z.object({
  main_column: z.string().default("**INSTITUTION**, AREA\nSUMMARY\nHIGHLIGHTS"),
  degree_column: z.string().nullish().default("**DEGREE**"),
  date_and_location_column: z.string().default("LOCATION\nDATE"),
});

const normalEntryTemplateSchema = z.object({
  main_column: z.string().default("**NAME**\nSUMMARY\nHIGHLIGHTS"),
  date_and_location_column: z.string().default("LOCATION\nDATE"),
});

const experienceEntryTemplateSchema = z.object({
  main_column: z.string().default("**COMPANY**, POSITION\nSUMMARY\nHIGHLIGHTS"),
  date_and_location_column: z.string().default("LOCATION\nDATE"),
});

const publicationEntryTemplateSchema = z.object({
  main_column: z
    .string()
    .default("**TITLE**\nSUMMARY\nAUTHORS\nURL (JOURNAL)"),
  date_and_location_column: z.string().default("DATE"),
});

const templatesSchema = z.object({
  footer: z.string().default("*NAME -- PAGE_NUMBER/TOTAL_PAGES*"),
  top_note: z.string().default("*LAST_UPDATED CURRENT_DATE*"),
  single_date: z.string().default("MONTH_ABBREVIATION YEAR"),
  date_range: z.string().default("START_DATE – END_DATE"),
  time_span: z
    .string()
    .default("HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS"),
  one_line_entry: z.preprocess((v) => v ?? {}, oneLineEntryTemplateSchema),
  education_entry: z.preprocess((v) => v ?? {}, educationEntryTemplateSchema),
  normal_entry: z.preprocess((v) => v ?? {}, normalEntryTemplateSchema),
  experience_entry: z.preprocess((v) => v ?? {}, experienceEntryTemplateSchema),
  publication_entry: z.preprocess((v) => v ?? {}, publicationEntryTemplateSchema),
});

/**
 * Deep-merge theme defaults with user-provided design values.
 * User values take precedence over theme defaults.
 */
function deepMergeDesign(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMergeDesign(
        result[key] as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export const designSchema = z.preprocess((input) => {
  // Determine the theme from input (or default to classic)
  const inputObj =
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>)
      : {};
  const theme = (inputObj.theme as ThemeName) ?? "classic";

  // Get theme defaults and deep-merge with user input
  const themeDefaults = getThemeDefaults(theme);
  return deepMergeDesign(themeDefaults, inputObj);
}, z.object({
  theme: z.enum(themeNames).default("classic"),
  page: z.preprocess((v) => v ?? {}, pageSchema),
  colors: z.preprocess((v) => v ?? {}, colorsSchema),
  typography: z.preprocess((v) => v ?? {}, typographySchema),
  links: z.preprocess((v) => v ?? {}, linksSchema),
  header: z.preprocess((v) => v ?? {}, headerSchema),
  section_titles: z.preprocess((v) => v ?? {}, sectionTitlesSchema),
  sections: z.preprocess((v) => v ?? {}, sectionsDesignSchema),
  entries: z.preprocess((v) => v ?? {}, entriesSchema),
  templates: z.preprocess((v) => v ?? {}, templatesSchema),
}));

// =============================================================================
// Locale
// =============================================================================

const phrasesSchema = z.object({
  degree_with_area: z.string().default("DEGREE in AREA"),
});

const monthArray = z.array(z.string()).length(12, "Must have exactly 12 entries.");

export const localeSchema = z.object({
  language: z.string().default("english"),
  last_updated: z.string().default("Last updated in"),
  month: z.string().default("month"),
  months: z.string().default("months"),
  year: z.string().default("year"),
  years: z.string().default("years"),
  present: z.string().default("present"),
  phrases: withEmptyDefaults(phrasesSchema),
  month_abbreviations: monthArray.default(() => [
    "Jan", "Feb", "Mar", "Apr", "May", "June",
    "July", "Aug", "Sept", "Oct", "Nov", "Dec",
  ]),
  month_names: monthArray.default(() => [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]),
});

// =============================================================================
// Settings
// =============================================================================

const renderCommandSchema = z.object({
  output_folder: z.string().default("rendercv_output"),
  design: z.string().nullish(),
  locale: z.string().nullish(),
  typst_path: z.string().default("OUTPUT_FOLDER/NAME_IN_SNAKE_CASE_CV.typ"),
  pdf_path: z.string().default("OUTPUT_FOLDER/NAME_IN_SNAKE_CASE_CV.pdf"),
  markdown_path: z.string().default("OUTPUT_FOLDER/NAME_IN_SNAKE_CASE_CV.md"),
  html_path: z.string().default("OUTPUT_FOLDER/NAME_IN_SNAKE_CASE_CV.html"),
  png_path: z.string().default("OUTPUT_FOLDER/NAME_IN_SNAKE_CASE_CV.png"),
  dont_generate_markdown: z.boolean().default(false),
  dont_generate_html: z.boolean().default(false),
  dont_generate_typst: z.boolean().default(false),
  dont_generate_pdf: z.boolean().default(false),
  dont_generate_png: z.boolean().default(false),
});

export const settingsSchema = z.object({
  current_date: z.union([z.string(), z.iso.date()]).default("today"),
  render_command: withEmptyDefaults(renderCommandSchema),
  bold_keywords: z
    .array(z.string())
    .default([])
    .transform((vals) => [...new Set(vals)]),
  pdf_title: z.string().default("NAME - CV"),
});

// =============================================================================
// Top-level model
// =============================================================================

export const renderCVModelSchema = z.object({
  cv: cvSchema,
  design: withEmptyDefaults(designSchema),
  locale: withEmptyDefaults(localeSchema),
  settings: withEmptyDefaults(settingsSchema),
});

export type RenderCVModelInput = z.input<typeof renderCVModelSchema>;
export type RenderCVModelParsed = z.output<typeof renderCVModelSchema>;
