/**
 * Model processor — prepares the CV model for Typst template rendering.
 *
 * Ported from RenderCV's model_processor.py, entry_templates_from_input.py,
 * connections.py, date.py, footer_and_top_note.py, and string_processor.py.
 *
 * This is the core transformation layer that converts the validated CV model
 * into processed data ready for the Typst template generators.
 */
import type {
  Cv,
  Design,
  Entry,
  EntryTypeName,
  Locale,
  RenderCVModel,
  RenderCVSection,
  Settings,
  SocialNetwork,
} from "@/types/cv";
import { getRenderCVSections } from "@/yaml/parser";
import { markdownToTypst } from "./markdown-to-typst";
import { cleanUrl } from "./string-utils";
import { svgIconPaths } from "./svg-icons";
import { translateSectionTitle } from "./section-translations";
import {
  resolveLocaleStrings,
  resolveMonthAbbreviations,
  resolveMonthNames,
} from "./locale-translations";

// =============================================================================
// Date utilities
// =============================================================================

/** Parse a date string (YYYY-MM-DD, YYYY-MM, YYYY) or "present" into a Date object. */
export function getDateObject(
  date: string | number,
  currentDate: Date = new Date(),
): Date {
  if (typeof date === "number") {
    return new Date(date, 0, 1);
  }
  const s = String(date);
  const fullDateMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (fullDateMatch) {
    return new Date(
      Number(fullDateMatch[1]),
      Number(fullDateMatch[2]) - 1,
      Number(fullDateMatch[3]),
    );
  }
  const yearMonthMatch = s.match(/^(\d{4})-(\d{2})$/);
  if (yearMonthMatch) {
    return new Date(Number(yearMonthMatch[1]), Number(yearMonthMatch[2]) - 1, 1);
  }
  if (/^\d{4}$/.test(s)) {
    return new Date(Number(s), 0, 1);
  }
  if (s === "present") {
    return currentDate;
  }
  throw new Error(`Invalid date: ${s}`);
}

/** Build date-related placeholders for templates. */
function buildDatePlaceholders(date: Date, locale: Locale): Record<string, string> {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const language = locale.language ?? "english";
  const monthNames = resolveMonthNames(locale.month_names, language);
  const monthAbbreviations = resolveMonthAbbreviations(locale.month_abbreviations, language);
  return {
    MONTH_NAME: monthNames[month - 1] ?? String(month),
    MONTH_ABBREVIATION: monthAbbreviations[month - 1] ?? String(month),
    MONTH: String(month),
    MONTH_IN_TWO_DIGITS: String(month).padStart(2, "0"),
    DAY: String(day),
    DAY_IN_TWO_DIGITS: String(day).padStart(2, "0"),
    YEAR: String(year),
    YEAR_IN_TWO_DIGITS: String(year % 100).padStart(2, "0"),
  };
}

/** Convert a Date object to a localized string using the single_date template. */
function dateObjectToString(
  date: Date,
  locale: Locale,
  singleDateTemplate: string,
): string {
  return substitutePlaceholders(
    singleDateTemplate,
    buildDatePlaceholders(date, locale),
  );
}

/** Format a date range using the date_range template. */
function formatDateRange(
  startDate: string | number,
  endDate: string | number,
  locale: Locale,
  singleDateTemplate: string,
  dateRangeTemplate: string,
): string {
  let startStr: string;
  if (typeof startDate === "number") {
    startStr = String(startDate);
  } else {
    const d = getDateObject(startDate);
    startStr = dateObjectToString(d, locale, singleDateTemplate);
  }

  let endStr: string;
  if (endDate === "present") {
    endStr = resolveLocaleStrings(locale).present;
  } else if (typeof endDate === "number") {
    endStr = String(endDate);
  } else {
    const d = getDateObject(endDate);
    endStr = dateObjectToString(d, locale, singleDateTemplate);
  }

  return substitutePlaceholders(dateRangeTemplate, {
    START_DATE: startStr,
    END_DATE: endStr,
  });
}

/** Format a single date (or pass through custom text). */
function formatSingleDate(
  date: string | number,
  locale: Locale,
  singleDateTemplate: string,
): string {
  if (typeof date === "number") {
    return String(date);
  }
  if (date === "present") {
    return resolveLocaleStrings(locale).present;
  }
  try {
    const d = getDateObject(date);
    return dateObjectToString(d, locale, singleDateTemplate);
  } catch {
    // Custom date string like "Fall 2023"
    return String(date);
  }
}

/** Compute time span between two dates. */
function computeTimeSpanString(
  startDate: string | number,
  endDate: string | number,
  locale: Locale,
  currentDate: Date,
  timeSpanTemplate: string,
): string {
  if (typeof startDate === "number" || typeof endDate === "number") {
    const startYear = getDateObject(startDate, currentDate).getFullYear();
    const endYear = getDateObject(endDate, currentDate).getFullYear();
    const years = endYear - startYear;
    const howManyYears = years < 2 ? "1" : String(years);
    const tr = resolveLocaleStrings(locale);
    const localeYears = years < 2 ? tr.year : tr.years;
    return substitutePlaceholders(timeSpanTemplate, {
      HOW_MANY_YEARS: howManyYears,
      YEARS: localeYears,
      HOW_MANY_MONTHS: "",
      MONTHS: "",
    });
  }

  const endObj = getDateObject(endDate, currentDate);
  const startObj = getDateObject(startDate, currentDate);
  const totalDays = Math.floor(
    (endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24),
  );

  let howManyYears = Math.floor(totalDays / 365);
  let howManyMonths = Math.floor((totalDays % 365) / 30) + 1;
  howManyYears += Math.floor(howManyMonths / 12);
  howManyMonths %= 12;

  const tr = resolveLocaleStrings(locale);
  const localeYears =
    howManyYears === 0 ? "" : howManyYears === 1 ? tr.year : tr.years;
  const localeMonths =
    howManyMonths === 0 ? "" : howManyMonths === 1 ? tr.month : tr.months;

  return substitutePlaceholders(timeSpanTemplate, {
    HOW_MANY_YEARS: howManyYears === 0 ? "" : String(howManyYears),
    YEARS: localeYears,
    HOW_MANY_MONTHS: howManyMonths === 0 ? "" : String(howManyMonths),
    MONTHS: localeMonths,
  });
}

// =============================================================================
// String processing
// =============================================================================

/** Replace all placeholder occurrences with their values (longest-first). */
export function substitutePlaceholders(
  str: string,
  placeholders: Record<string, string>,
): string {
  if (!placeholders || Object.keys(placeholders).length === 0) return str;
  const sortedKeys = Object.keys(placeholders).sort((a, b) => b.length - a.length);
  let result = str;
  for (const key of sortedKeys) {
    result = result.replaceAll(key, placeholders[key]);
  }
  return result.trim();
}

/** Make keywords bold in a string (wrap in **). */
function makeKeywordsBold(str: string, keywords: string[]): string {
  if (!keywords.length) return str;
  const sorted = [...keywords].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    sorted.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
    "g",
  );
  return str.replace(pattern, (match) => `**${match}**`);
}

/** Apply string processors (keyword bolding + markdown→typst). */
function applyStringProcessors(
  str: string | null | undefined,
  keywords: string[],
  toTypst: boolean,
): string | null | undefined {
  if (str === null || str === undefined) return str;
  let result = str;
  if (keywords.length > 0) {
    result = makeKeywordsBold(result, keywords);
  }
  if (toTypst) {
    result = markdownToTypst(result);
  }
  return result;
}

// =============================================================================
// Connections
// =============================================================================

/**
 * FontAwesome icon names for connections.
 * These map to SVG files in public/icons/ that are converted to data URIs.
 */
const fontAwesomeIconNames: Record<string, string> = {
  LinkedIn: "linkedin",
  GitHub: "github",
  GitLab: "gitlab",
  IMDB: "imdb",
  Instagram: "instagram",
  Mastodon: "mastodon",
  ORCID: "orcid",
  StackOverflow: "stack-overflow",
  ResearchGate: "researchgate",
  YouTube: "youtube",
  "Google Scholar": "graduation-cap",
  Telegram: "telegram",
  WhatsApp: "whatsapp",
  Leetcode: "code",
  X: "x-twitter",
  Bluesky: "bluesky",
  Reddit: "reddit",
  location: "location-dot",
  email: "envelope",
  phone: "phone",
  website: "link",
};

/** Social network URL prefixes. */
const socialNetworkUrls: Record<string, string> = {
  LinkedIn: "https://linkedin.com/in/",
  GitHub: "https://github.com/",
  GitLab: "https://gitlab.com/",
  IMDB: "https://imdb.com/name/",
  Instagram: "https://instagram.com/",
  ORCID: "https://orcid.org/",
  StackOverflow: "https://stackoverflow.com/users/",
  ResearchGate: "https://researchgate.net/profile/",
  YouTube: "https://youtube.com/@",
  "Google Scholar": "https://scholar.google.com/citations?user=",
  Telegram: "https://t.me/",
  WhatsApp: "https://wa.me/",
  Leetcode: "https://leetcode.com/u/",
  X: "https://x.com/",
  Bluesky: "https://bsky.app/profile/",
  Reddit: "https://reddit.com/user/",
};

/** Generate the URL for a social network entry. */
export function getSocialNetworkUrl(sn: SocialNetwork): string {
  if (sn.network === "Mastodon") {
    const parts = sn.username.split("@");
    // parts: ["", username, domain]
    const username = parts[1];
    const domain = parts[2];
    return `https://${domain}/@${username}`;
  }
  const prefix = socialNetworkUrls[sn.network];
  return prefix + sn.username;
}

interface Connection {
  icon: string;
  url: string | null;
  body: string;
}

/** Extract connections from the CV in user-defined key order. */
function parseConnections(
  cv: Cv,
  design: Design,
): Connection[] {
  const connections: Connection[] = [];
  const displayUrls = design.header?.connections?.display_urls_instead_of_usernames ?? false;

  // We don't have _key_order in TS, so use a fixed order:
  // location, email, phone, website, social_networks, custom_connections

  if (cv.location) {
    connections.push({
      icon: fontAwesomeIconNames.location,
      url: null,
      body: cv.location,
    });
  }

  if (cv.email) {
    const emails = Array.isArray(cv.email) ? cv.email : [cv.email];
    for (const email of emails) {
      connections.push({
        icon: fontAwesomeIconNames.email,
        url: `mailto:${email}`,
        body: email,
      });
    }
  }

  if (cv.phone) {
    const phones = Array.isArray(cv.phone) ? cv.phone : [cv.phone];
    for (const phone of phones) {
      connections.push({
        icon: fontAwesomeIconNames.phone,
        url: String(phone),
        body: String(phone),
      });
    }
  }

  if (cv.website) {
    const websites = Array.isArray(cv.website) ? cv.website : [cv.website];
    for (const website of websites) {
      const url = String(website);
      connections.push({
        icon: fontAwesomeIconNames.website,
        url,
        body: cleanUrl(url),
      });
    }
  }

  if (cv.social_networks) {
    for (const sn of cv.social_networks) {
      const url = getSocialNetworkUrl(sn);
      const body =
        displayUrls ? cleanUrl(url) :
        sn.network === "Google Scholar" ? "Google Scholar" :
        sn.username;
      connections.push({
        icon: fontAwesomeIconNames[sn.network] ?? "link",
        url,
        body,
      });
    }
  }

  if (cv.custom_connections) {
    for (const cc of cv.custom_connections) {
      connections.push({
        // Use the user-provided icon name as-is (could be an emoji or text)
        icon: cc.fontawesome_icon,
        url: cc.url ? String(cc.url) : null,
        body: cc.placeholder,
      });
    }
  }

  return connections;
}

/** Compute connections as Typst-formatted strings for the header. */
function computeConnectionsForTypst(
  cv: Cv,
  design: Design,
): string[] {
  const connections = parseConnections(cv, design);
  const showIcons = design.header?.connections?.show_icons ?? true;
  const hyperlink = design.header?.connections?.hyperlink ?? true;

  return connections.map((conn) => {
    const body = markdownToTypst(conn.body);
    let placeholder = body;

    if (showIcons) {
      const iconPath = svgIconPaths[conn.icon];
      if (iconPath) {
        // Render SVG icon from virtual filesystem with proper sizing and alignment
        // Use box() to align the icon vertically with the text baseline
        placeholder = `#box(baseline: 25%, image("${iconPath}", width: 0.75em)) #h(0.1em) ${body}`;
      }
    }

    if (conn.url && hyperlink) {
      return `#link("${conn.url}", icon: false, if-underline: false, if-color: false)[${placeholder}]`;
    }
    return placeholder;
  });
}

// =============================================================================
// Entry template processing
// =============================================================================

const uppercaseWordPattern = /\b[A-Z_]+\b/g;

/** Process highlights list into Markdown bullet list. */
function processHighlights(highlights: unknown[]): string {
  return highlights
    .map((h) => {
      const text = typeof h === "string" ? h : String(h);
      return `- ${text.replace(" - ", "\n  - ")}`;
    })
    .join("\n");
}

/** Process authors list into comma-separated string. */
function processAuthors(authors: string[]): string {
  return authors.join(", ");
}

/** Process date fields into formatted string. */
function processDate(
  entry: Record<string, unknown>,
  locale: Locale,
  showTimeSpan: boolean,
  currentDate: Date,
  templates: Design["templates"],
): string {
  const date = entry.date as string | number | null | undefined;
  const startDate = entry.start_date as string | number | null | undefined;
  const endDate = entry.end_date as string | number | null | undefined;

  const singleDateTemplate = templates?.single_date ?? "MONTH_ABBREVIATION YEAR";
  const dateRangeTemplate = templates?.date_range ?? "START_DATE – END_DATE";
  const timeSpanTemplate = templates?.time_span ?? "HOW_MANY_YEARS YEARS HOW_MANY_MONTHS MONTHS";

  if (date && !startDate && !endDate) {
    return formatSingleDate(date, locale, singleDateTemplate);
  }
  if (startDate && endDate) {
    const range = formatDateRange(
      startDate,
      endDate,
      locale,
      singleDateTemplate,
      dateRangeTemplate,
    );
    if (showTimeSpan) {
      const timeSpan = computeTimeSpanString(
        startDate,
        endDate,
        locale,
        currentDate,
        timeSpanTemplate,
      );
      return `${range}\n\n${timeSpan}`;
    }
    return range;
  }
  return "";
}

/** Process URL field into Markdown link. */
function processUrl(entry: Record<string, unknown>): string {
  if (entry.doi) {
    return `[${entry.doi}](https://doi.org/${entry.doi})`;
  }
  if (entry.url) {
    const url = String(entry.url);
    return `[${cleanUrl(url)}](${url})`;
  }
  return "";
}

/** Process summary into Typst #summary[...] block.
 *
 * RenderCV uses Markdown admonition syntax (!!! summary) which its markdown
 * parser converts to #summary[...]. We skip the Markdown intermediate and
 * emit the Typst directly, since our markdown-to-typst converter does not
 * support admonitions.
 */
function processSummary(summary: string): string {
  // Join lines with Typst line break (\\ ) so the summary renders as a
  // single block, matching RenderCV's behavior.
  const content = summary
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(" \\ ");
  return `#summary[${content}]`;
}

/** Remove placeholders for missing fields from templates. */
function removeNotProvidedPlaceholders(
  templates: Record<string, string>,
  fields: Record<string, string>,
): Record<string, string> {
  const usedPlaceholders = new Set<string>();
  for (const template of Object.values(templates)) {
    const matches = template.matchAll(uppercaseWordPattern);
    for (const m of matches) {
      usedPlaceholders.add(m[0]);
    }
  }

  const notProvided = new Set(
    [...usedPlaceholders].filter((p) => !(p in fields)),
  );

  if (notProvided.size === 0) return templates;

  const sortedPlaceholders = [...notProvided].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    `\\S*\\b(?:${sortedPlaceholders.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b\\S*`,
    "g",
  );

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(templates)) {
    let cleaned = value.replace(pattern, "");
    // Clean up double spaces and trailing punctuation
    cleaned = cleaned.replace(/ {2,}/g, " ");
    // Remove empty lines and trailing non-alphanumeric chars
    const lines = cleaned.split("\n");
    const cleanLines = lines
      .map((line) => line.replace(/[^A-Za-z0-9.!?[\]()*_%]+$/, "").trim())
      .filter((line) => line !== "");
    result[key] = cleanLines.join("\n");
  }
  return result;
}

/** Render entry templates by substituting placeholders. */
function renderEntryTemplates(
  entry: Record<string, unknown>,
  entryType: EntryTypeName,
  templates: Design["templates"],
  locale: Locale,
  showTimeSpan: boolean,
  currentDate: Date,
): Record<string, unknown> {
  if (entryType === "TextEntry" || !templates) {
    return entry;
  }

  // Get the template for this entry type
  const templateKey = entryType
    .replace(/Entry$/, "_entry")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase();

  const entryTemplate = (templates as unknown as Record<string, unknown>)[templateKey] as
    | Record<string, string | null>
    | undefined;

  if (!entryTemplate) return entry;

  // Build entry templates dict (exclude null values)
  let entryTemplates: Record<string, string> = {};
  for (const [k, v] of Object.entries(entryTemplate)) {
    if (v !== null && v !== undefined) {
      entryTemplates[k] = v;
    }
  }

  // Build entry fields (uppercase keys)
  const entryFields: Record<string, string> = {};
  for (const [k, v] of Object.entries(entry)) {
    if (v === null || v === undefined || v === "") continue;
    if (typeof v === "string") {
      entryFields[k.toUpperCase()] = v;
    } else if (Array.isArray(v)) {
      // Will be processed specially below
    } else {
      entryFields[k.toUpperCase()] = String(v);
    }
  }

  // Expand locale phrases
  const phrases = locale.phrases;
  if (phrases) {
    for (const [phraseName, phraseTemplate] of Object.entries(phrases)) {
      const placeholder = phraseName.toUpperCase();
      const updatedTemplates: Record<string, string> = {};
      for (const [k, v] of Object.entries(entryTemplates)) {
        updatedTemplates[k] = v.replaceAll(placeholder, phraseTemplate);
      }
      entryTemplates = updatedTemplates;
    }
  }

  // Handle special placeholders
  if ("HIGHLIGHTS" in entryFields || entry.highlights) {
    const highlights = entry.highlights as string[] | null | undefined;
    if (highlights) {
      entryFields["HIGHLIGHTS"] = processHighlights(highlights);
    }
  }

  if ("AUTHORS" in entryFields || entry.authors) {
    const authors = entry.authors as string[] | null | undefined;
    if (authors) {
      entryFields["AUTHORS"] = processAuthors(authors);
    }
  }

  if (
    entry.date !== undefined ||
    entry.start_date !== undefined ||
    entry.end_date !== undefined
  ) {
    entryFields["DATE"] = processDate(
      entry,
      locale,
      showTimeSpan,
      currentDate,
      templates,
    );
  }

  if (entry.start_date) {
    entryFields["START_DATE"] = formatSingleDate(
      entry.start_date as string | number,
      locale,
      templates.single_date ?? "MONTH_ABBREVIATION YEAR",
    );
  }

  if (entry.end_date) {
    entryFields["END_DATE"] = formatSingleDate(
      entry.end_date as string | number,
      locale,
      templates.single_date ?? "MONTH_ABBREVIATION YEAR",
    );
  }

  if (entry.url || entry.doi) {
    entryFields["URL"] = processUrl(entry);
    if (entry.doi) {
      entryFields["DOI"] = String(entry.doi);
    }
  }

  // Process summary if it's standalone in template
  if ("SUMMARY" in entryFields) {
    const summaryIsStandalone = Object.values(entryTemplates).some((template) =>
      template.split("\n").some((line) => line.trim() === "SUMMARY"),
    );
    if (summaryIsStandalone) {
      entryFields["SUMMARY"] = processSummary(entryFields["SUMMARY"]);
    }
  }

  // Remove placeholders for missing fields
  const cleanedTemplates = removeNotProvidedPlaceholders(entryTemplates, entryFields);

  // Substitute placeholders in templates and set as entry fields
  const result = { ...entry };
  for (const [templateName, template] of Object.entries(cleanedTemplates)) {
    result[templateName] = substitutePlaceholders(template, entryFields);
  }
  for (const [fieldName, fieldValue] of Object.entries(entryFields)) {
    if (!(fieldName.toLowerCase() in result)) {
      result[fieldName.toLowerCase()] = fieldValue;
    }
  }

  return result;
}

/** Apply string processors to all entry fields. */
function processFields(
  entry: Entry,
  keywords: string[],
): Entry {
  const skipped = new Set(["start_date", "end_date", "doi", "url"]);

  if (typeof entry === "string") {
    const processed = applyStringProcessors(entry, keywords, true);
    return processed ?? "";
  }

  const result = { ...(entry as Record<string, unknown>) };
  for (const [field, value] of Object.entries(result)) {
    if (skipped.has(field) || field.startsWith("_")) continue;

    if (typeof value === "string") {
      result[field] = applyStringProcessors(value, keywords, true);
    } else if (Array.isArray(value)) {
      result[field] = value.map((v) =>
        typeof v === "string" ? (applyStringProcessors(v, keywords, true) ?? "") : v,
      );
    }
  }
  return result as unknown as Entry;
}

// =============================================================================
// Footer and top note
// =============================================================================

function renderTopNote(
  topNoteTemplate: string,
  locale: Locale,
  currentDate: Date,
  name: string | null,
  singleDateTemplate: string,
  keywords: string[],
): string {
  const placeholders: Record<string, string> = {
    CURRENT_DATE: dateObjectToString(currentDate, locale, singleDateTemplate),
    LAST_UPDATED: resolveLocaleStrings(locale).last_updated,
    NAME: name ?? "",
    ...buildDatePlaceholders(currentDate, locale),
  };
  const substituted = substitutePlaceholders(topNoteTemplate, placeholders);
  return applyStringProcessors(substituted, keywords, true) ?? "";
}

function renderFooter(
  footerTemplate: string,
  locale: Locale,
  currentDate: Date,
  name: string | null,
  singleDateTemplate: string,
  keywords: string[],
): string {
  const placeholders: Record<string, string> = {
    CURRENT_DATE: dateObjectToString(currentDate, locale, singleDateTemplate),
    NAME: name ?? "",
    PAGE_NUMBER: "#str(here().page())",
    TOTAL_PAGES: "#str(counter(page).final().first())",
    ...buildDatePlaceholders(currentDate, locale),
  };
  const substituted = substitutePlaceholders(footerTemplate, placeholders);
  const processed = applyStringProcessors(substituted, keywords, true) ?? "";
  return `context { [${processed}] }`;
}

// =============================================================================
// Main model processor
// =============================================================================

export interface ProcessedModel {
  cv: Cv;
  design: Design;
  locale: Locale;
  settings: Settings;
  /** Processed sections ready for template rendering. */
  sections: RenderCVSection[];
  /** Plain name (before markdown processing). */
  plainName: string;
  /** Processed name (after markdown→typst). */
  processedName: string | null;
  /** Connections as Typst strings. */
  connections: string[];
  /** Top note as Typst string. */
  topNote: string;
  /** Footer as Typst context block. */
  footer: string;
  /** Resolved current date. */
  currentDate: Date;
  /** PDF title with placeholders substituted. */
  pdfTitle: string;
}

/**
 * Process the validated RenderCVModel for Typst template rendering.
 *
 * Mirrors RenderCV's `process_model`. Applies markdown→typst conversion,
 * keyword bolding, connection formatting, date rendering, and entry
 * template expansion.
 */
export function processModel(model: RenderCVModel): ProcessedModel {
  const currentDate =
    model.settings.current_date === "today" || !model.settings.current_date
      ? new Date()
      : new Date(model.settings.current_date);

  const keywords = model.settings.bold_keywords ?? [];
  const design = model.design;
  const locale = model.locale;

  const plainName = model.cv.name ?? "";
  const processedName = applyStringProcessors(model.cv.name, keywords, true) ?? null;
  const processedHeadline = applyStringProcessors(model.cv.headline, keywords, true) ?? null;

  const connections = computeConnectionsForTypst(model.cv, design);

  const topNote = renderTopNote(
    design.templates?.top_note ?? "*LAST_UPDATED CURRENT_DATE*",
    locale,
    currentDate,
    plainName,
    design.templates?.single_date ?? "MONTH_ABBREVIATION YEAR",
    keywords,
  );

  const footer = renderFooter(
    design.templates?.footer ?? "*NAME -- PAGE_NUMBER/TOTAL_PAGES*",
    locale,
    currentDate,
    plainName,
    design.templates?.single_date ?? "MONTH_ABBREVIATION YEAR",
    keywords,
  );

  // PDF title
  const pdfTitlePlaceholders: Record<string, string> = {
    CURRENT_DATE: dateObjectToString(
      currentDate,
      locale,
      design.templates?.single_date ?? "MONTH_ABBREVIATION YEAR",
    ),
    NAME: plainName,
    ...buildDatePlaceholders(currentDate, locale),
  };
  const pdfTitle = substitutePlaceholders(
    model.settings.pdf_title ?? "NAME - CV",
    pdfTitlePlaceholders,
  );

  // Process sections
  const rawSections = getRenderCVSections(model.cv.sections ?? null);
  const showTimeSpansIn = design.sections?.show_time_spans_in ?? ["experience"];

  const processedSections: RenderCVSection[] = rawSections.map((section) => {
    const showTimeSpan = showTimeSpansIn.includes(
      section.title.toLowerCase().replace(/ /g, "_"),
    );

    const processedEntries = section.entries.map((entry) => {
      if (typeof entry === "string") {
        return processFields(entry, keywords);
      }
      const rendered = renderEntryTemplates(
        entry as Record<string, unknown>,
        section.entry_type,
        design.templates,
        locale,
        showTimeSpan,
        currentDate,
      );
      return processFields(rendered as Entry, keywords);
    });

    const processedTitle =
      applyStringProcessors(section.title, keywords, true) ?? section.title;
    const localizedTitle = translateSectionTitle(
      processedTitle,
      locale.language ?? "english",
    );

    return {
      ...section,
      title: localizedTitle,
      entries: processedEntries,
    };
  });

  return {
    cv: {
      ...model.cv,
      name: processedName,
      headline: processedHeadline,
    },
    design,
    locale,
    settings: model.settings,
    sections: processedSections,
    plainName,
    processedName,
    connections,
    topNote,
    footer,
    currentDate,
    pdfTitle,
  };
}
