/**
 * TypeScript model for the RenderCV-compatible CV format.
 *
 * Ported from RenderCV's Pydantic models (src/rendercv/schema/models/).
 * These interfaces represent the validated CV data model used throughout
 * the application. The Zod schema in yaml/schema.ts validates against
 * these shapes.
 */

// =============================================================================
// CV entries
// =============================================================================

/** Date in YYYY-MM-DD, YYYY-MM, or YYYY format, or "present". */
export type ExactDate = string;

/** Date that can be YYYY-MM-DD, YYYY-MM, YYYY, or arbitrary text like "Fall 2023". */
export type ArbitraryDate = string | number;

/** Base fields shared by all entry types with complex fields. */
export interface BaseEntryWithComplexFields {
  start_date?: ExactDate | null;
  end_date?: ExactDate | "present" | null;
  /** Single date (overrides start_date/end_date if provided). */
  date?: ArbitraryDate | null;
  location?: string | null;
  summary?: string | null;
  highlights?: string[] | null;
  /** Allows arbitrary extra keys for template placeholders. */
  [key: string]: unknown;
}

/** Base fields shared by entries with a single date field. */
export interface BaseEntryWithDate {
  date?: ArbitraryDate | null;
  [key: string]: unknown;
}

export interface ExperienceEntry extends BaseEntryWithComplexFields {
  company: string;
  position: string;
}

export interface EducationEntry extends BaseEntryWithComplexFields {
  institution: string;
  area: string;
  degree?: string | null;
}

export interface NormalEntry extends BaseEntryWithComplexFields {
  name: string;
}

export interface PublicationEntry extends BaseEntryWithDate {
  title: string;
  authors: string[];
  summary?: string | null;
  doi?: string | null;
  url?: string | null;
  journal?: string | null;
  date?: ArbitraryDate | null;
}

export interface BulletEntry {
  bullet: string;
  [key: string]: unknown;
}

export interface OneLineEntry {
  label: string;
  details: string;
  [key: string]: unknown;
}

export interface NumberedEntry {
  number: string;
  [key: string]: unknown;
}

export interface ReversedNumberedEntry {
  reversed_number: string;
  [key: string]: unknown;
}

/** A plain string entry (text-based section). */
export type TextEntry = string;

/** Union of all entry model types. */
export type EntryModel =
  | ExperienceEntry
  | EducationEntry
  | NormalEntry
  | PublicationEntry
  | BulletEntry
  | OneLineEntry
  | NumberedEntry
  | ReversedNumberedEntry;

/** Any entry, including plain text strings. */
export type Entry = EntryModel | TextEntry;

/** Entry type names as strings. */
export type EntryTypeName =
  | "ExperienceEntry"
  | "EducationEntry"
  | "NormalEntry"
  | "PublicationEntry"
  | "BulletEntry"
  | "OneLineEntry"
  | "NumberedEntry"
  | "ReversedNumberedEntry"
  | "TextEntry";

// =============================================================================
// CV header
// =============================================================================

export type SocialNetworkName =
  | "LinkedIn"
  | "GitHub"
  | "GitLab"
  | "IMDB"
  | "Instagram"
  | "ORCID"
  | "Mastodon"
  | "StackOverflow"
  | "ResearchGate"
  | "YouTube"
  | "Google Scholar"
  | "Telegram"
  | "WhatsApp"
  | "Leetcode"
  | "X"
  | "Bluesky"
  | "Reddit";

export interface SocialNetwork {
  network: SocialNetworkName;
  username: string;
}

export interface CustomConnection {
  fontawesome_icon: string;
  placeholder: string;
  url?: string | null;
}

/** Sections are a dict where keys are titles and values are lists of entries. */
export type Sections = Record<string, Entry[]>;

export interface Cv {
  name?: string | null;
  headline?: string | null;
  location?: string | null;
  email?: string | string[] | null;
  photo?: string | null;
  phone?: string | string[] | null;
  website?: string | string[] | null;
  social_networks?: SocialNetwork[] | null;
  custom_connections?: CustomConnection[] | null;
  sections?: Sections | null;
}

// =============================================================================
// Design
// =============================================================================

export type ThemeName =
  | "classic"
  | "moderncv"
  | "sb2nov"
  | "engineeringresumes"
  | "engineeringclassic"
  | "harvard"
  | "ink"
  | "opal"
  | "ember";

export type PageSize = "a4" | "a5" | "us-letter" | "us-executive";

/** A Typst dimension string like "0.7in", "10pt", "1.4em", "0.5cm". */
export type TypstDimension = string;

export interface Page {
  size?: PageSize;
  top_margin?: TypstDimension;
  bottom_margin?: TypstDimension;
  left_margin?: TypstDimension;
  right_margin?: TypstDimension;
  show_footer?: boolean;
  show_top_note?: boolean;
}

/** Color string: name, hex, rgb(), or hsl(). */
export type Color = string;

export interface Colors {
  body?: Color;
  name?: Color;
  headline?: Color;
  connections?: Color;
  section_titles?: Color;
  links?: Color;
  footer?: Color;
  top_note?: Color;
}

export type FontFamilyString = string;

export interface FontFamily {
  body?: FontFamilyString;
  name?: FontFamilyString;
  headline?: FontFamilyString;
  connections?: FontFamilyString;
  section_titles?: FontFamilyString;
}

export interface FontSize {
  body?: TypstDimension;
  name?: TypstDimension;
  headline?: TypstDimension;
  connections?: TypstDimension;
  section_titles?: TypstDimension;
}

export interface SmallCaps {
  name?: boolean;
  headline?: boolean;
  connections?: boolean;
  section_titles?: boolean;
}

export interface Bold {
  name?: boolean;
  headline?: boolean;
  connections?: boolean;
  section_titles?: boolean;
}

export type BodyAlignment =
  | "left"
  | "justified"
  | "justified-with-no-hyphenation";

export type Alignment = "left" | "center" | "right";

export interface Typography {
  line_spacing?: TypstDimension;
  alignment?: BodyAlignment;
  date_and_location_column_alignment?: Alignment;
  font_family?: FontFamily | FontFamilyString;
  font_size?: FontSize;
  small_caps?: SmallCaps;
  bold?: Bold;
}

export interface Links {
  underline?: boolean;
  show_external_link_icon?: boolean;
}

export type PhoneNumberFormat = "national" | "international" | "E164";

export interface Connections {
  phone_number_format?: PhoneNumberFormat;
  hyperlink?: boolean;
  show_icons?: boolean;
  display_urls_instead_of_usernames?: boolean;
  separator?: string;
  space_between_connections?: TypstDimension;
}

export interface Header {
  alignment?: Alignment;
  photo_width?: TypstDimension;
  photo_position?: "left" | "right";
  photo_space_left?: TypstDimension;
  photo_space_right?: TypstDimension;
  space_below_name?: TypstDimension;
  space_below_headline?: TypstDimension;
  space_below_connections?: TypstDimension;
  connections?: Connections;
}

export type SectionTitleType =
  | "with_partial_line"
  | "with_full_line"
  | "without_line"
  | "moderncv"
  | "centered_without_line"
  | "centered_with_partial_line"
  | "centered_with_centered_partial_line"
  | "centered_with_full_line";

export interface SectionTitles {
  type?: SectionTitleType;
  line_thickness?: TypstDimension;
  space_above?: TypstDimension;
  space_below?: TypstDimension;
}

export interface SectionsDesign {
  allow_page_break?: boolean;
  space_between_regular_entries?: TypstDimension;
  space_between_text_based_entries?: TypstDimension;
  show_time_spans_in?: string[];
}

export type Bullet = "●" | "•" | "◦" | "-" | "◆" | "★" | "■" | "—" | "○";

export interface Summary {
  space_above?: TypstDimension;
  space_left?: TypstDimension;
}

export interface Highlights {
  bullet?: Bullet;
  nested_bullet?: Bullet;
  space_left?: TypstDimension;
  space_above?: TypstDimension;
  space_between_items?: TypstDimension;
  space_between_bullet_and_text?: TypstDimension;
}

export interface Entries {
  date_and_location_width?: TypstDimension;
  side_space?: TypstDimension;
  space_between_columns?: TypstDimension;
  allow_page_break?: boolean;
  short_second_row?: boolean;
  degree_width?: TypstDimension;
  summary?: Summary;
  highlights?: Highlights;
}

export interface OneLineEntryTemplate {
  main_column?: string;
}

export interface EducationEntryTemplate {
  main_column?: string;
  degree_column?: string | null;
  date_and_location_column?: string;
}

export interface NormalEntryTemplate {
  main_column?: string;
  date_and_location_column?: string;
}

export interface ExperienceEntryTemplate {
  main_column?: string;
  date_and_location_column?: string;
}

export interface PublicationEntryTemplate {
  main_column?: string;
  date_and_location_column?: string;
}

export interface Templates {
  footer?: string;
  top_note?: string;
  single_date?: string;
  date_range?: string;
  time_span?: string;
  one_line_entry?: OneLineEntryTemplate;
  education_entry?: EducationEntryTemplate;
  normal_entry?: NormalEntryTemplate;
  experience_entry?: ExperienceEntryTemplate;
  publication_entry?: PublicationEntryTemplate;
}

export interface Design {
  theme: ThemeName;
  page?: Page;
  colors?: Colors;
  typography?: Typography;
  links?: Links;
  header?: Header;
  section_titles?: SectionTitles;
  sections?: SectionsDesign;
  entries?: Entries;
  templates?: Templates;
}

// =============================================================================
// Locale
// =============================================================================

export interface Phrases {
  degree_with_area?: string;
}

export interface Locale {
  language: string;
  last_updated?: string;
  month?: string;
  months?: string;
  year?: string;
  years?: string;
  present?: string;
  phrases?: Phrases;
  month_abbreviations?: string[];
  month_names?: string[];
}

// =============================================================================
// Settings
// =============================================================================

export interface RenderCommand {
  output_folder?: string;
  design?: string | null;
  locale?: string | null;
  typst_path?: string;
  pdf_path?: string;
  markdown_path?: string;
  html_path?: string;
  png_path?: string;
  dont_generate_markdown?: boolean;
  dont_generate_html?: boolean;
  dont_generate_typst?: boolean;
  dont_generate_pdf?: boolean;
  dont_generate_png?: boolean;
}

export interface Settings {
  current_date?: string | "today";
  render_command?: RenderCommand;
  bold_keywords?: string[];
  pdf_title?: string;
}

// =============================================================================
// Top-level model
// =============================================================================

export interface RenderCVModel {
  cv: Cv;
  design: Design;
  locale: Locale;
  settings: Settings;
}

// =============================================================================
// Processed section (after type detection)
// =============================================================================

export interface RenderCVSection {
  title: string;
  entry_type: EntryTypeName;
  entries: Entry[];
}

/** Snake_case version of the title for template attribute lookup. */
export function snakeCaseTitle(title: string): string {
  return title.toLowerCase().replace(/ /g, "_");
}
