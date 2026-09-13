/**
 * Surgical YAML document editor.
 *
 * Reads and writes the YAML document using the `yaml` package's `Document`
 * API so that comments, key order and formatting are preserved when the
 * form edits the CV. `js-yaml` is still used for the read/validate pipeline
 * (`parser.ts`); this module is the only writer.
 *
 * All writers take the current YAML string and return a new YAML string.
 * They never throw on user-data problems — callers (the form) decide what
 * to do with `null` results.
 */
import {
  Document,
  YAMLMap,
  YAMLSeq,
  isMap,
  isSeq,
  isScalar,
  isPair,
  isAlias,
  Pair,
  Scalar,
} from "yaml";
import { parseDocument } from "yaml";
import { detectSectionEntryType } from "./entry-detection";
import type { EntryTypeName } from "@/types/cv";

// =============================================================================
// Types
// =============================================================================

export interface LoadResult {
  doc: Document | null;
  error?: string;
}

export interface CvBasics {
  name: string;
  headline: string;
  location: string;
  email: string[];
  phone: string[];
  website: string[];
  photo: string;
}

export interface SocialNetworkEntry {
  network: string;
  username: string;
}

export interface CustomConnectionEntry {
  fontawesome_icon: string;
  placeholder: string;
  url: string;
}

export interface SectionInfo {
  title: string;
  entryType: EntryTypeName;
  entryCount: number;
}

// =============================================================================
// Load
// =============================================================================

const TO_STRING_OPTIONS = {
  lineWidth: 0,
  defaultStringType: "PLAIN" as const,
  defaultKeyType: "PLAIN" as const,
};

/**
 * Parse a YAML string into a Document, preserving comments and order.
 * Returns an error message instead of throwing.
 */
export function loadDoc(yaml: string): LoadResult {
  if (yaml.trim() === "") {
    // Empty document — start fresh
    const doc = new Document({});
    return { doc };
  }
  try {
    const doc = parseDocument(yaml, { prettyErrors: true });
    if (doc.errors.length > 0) {
      return { doc: null, error: doc.errors[0].message };
    }
    return { doc };
  } catch (err) {
    return {
      doc: null,
      error: err instanceof Error ? err.message : "Failed to parse YAML",
    };
  }
}

/**
 * Serialize a Document back to a YAML string with stable options.
 */
export function docToString(doc: Document): string {
  return doc.toString(TO_STRING_OPTIONS);
}

// =============================================================================
// Node helpers
// =============================================================================

function ensureRootMap(doc: Document): YAMLMap {
  if (!isMap(doc.contents)) {
    doc.contents = doc.createNode({}) as YAMLMap;
  }
  return doc.contents as YAMLMap;
}

/**
 * Get (or lazily create) a nested map at the given path of keys.
 * Missing intermediate maps are created; the final key is returned as a
 * YAMLMap reference (created if absent).
 */
function ensureMapIn(doc: Document, path: (string | number)[]): YAMLMap | null {
  let current: YAMLMap = ensureRootMap(doc);
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    const existing = current.get(key, true);
    if (existing === undefined || existing === null) {
      const newMap = new YAMLMap();
      current.set(key, newMap);
      current = newMap;
    } else if (isMap(existing)) {
      current = existing;
    } else {
      // Existing value is not a map — cannot descend
      return null;
    }
  }
  return current;
}

/**
 * Get a nested map at the path, or null if any segment is missing or not a map.
 */
function getMapIn(doc: Document, path: (string | number)[]): YAMLMap | null {
  let current: unknown = doc.contents;
  for (const key of path) {
    if (!isMap(current)) return null;
    current = (current as YAMLMap).get(key, true);
  }
  return isMap(current) ? current : null;
}

/**
 * Get a nested sequence at the path, or null.
 */
function getSeqIn(doc: Document, path: (string | number)[]): YAMLSeq | null {
  let current: unknown = doc.contents;
  for (const key of path) {
    if (!isMap(current)) return null;
    current = (current as YAMLMap).get(key, true);
  }
  return isSeq(current) ? current : null;
}

function scalarToString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (isScalar(value)) return String((value as Scalar).value);
  return null;
}

function nodeToValue(node: unknown): unknown {
  if (node === undefined || node === null) return null;
  if (isScalar(node)) return (node as Scalar).value;
  if (isMap(node) || isSeq(node)) return node.toJSON();
  return node;
}

// =============================================================================
// Alias / anchor detection
// =============================================================================

/**
 * Walk the `cv:` subtree and report whether any anchor, alias or merge key
 * is present. Editing such nodes via the form is unsafe, so the caller can
 * fall back to read-only mode.
 */
export function hasAliasesInCv(doc: Document): boolean {
  const cv = getMapIn(doc, ["cv"]);
  if (!cv) return false;

  let found = false;
  function walk(node: unknown): void {
    if (found) return;
    if (node === null || node === undefined) return;
    // Alias node — unsafe to edit
    if (isAlias(node)) {
      found = true;
      return;
    }
    if (isScalar(node)) {
      // Anchored scalar
      if ((node as Scalar).anchor) {
        found = true;
      }
      return;
    }
    if (isPair(node)) {
      const pair = node as Pair;
      // Merge key (<<:)
      if (isScalar(pair.key) && (pair.key as Scalar).value === "<<") {
        found = true;
        return;
      }
      walk(pair.key);
      walk(pair.value);
      return;
    }
    if (isMap(node) || isSeq(node)) {
      const coll = node as YAMLMap | YAMLSeq;
      // Anchored collection
      if (coll.anchor) {
        found = true;
        return;
      }
      for (const item of coll.items) {
        walk(item);
        if (found) return;
      }
    }
  }
  walk(cv);
  return found;
}

// =============================================================================
// Readers
// =============================================================================

function readStringList(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (isScalar(value)) {
    const v = (value as Scalar).value;
    return v === null || v === undefined ? [] : [String(v)];
  }
  if (isSeq(value)) {
    return (value as YAMLSeq).items
      .map((item) => scalarToString(item))
      .filter((s): s is string => s !== null);
  }
  return [];
}

export function getCvBasics(doc: Document): CvBasics {
  const cv = getMapIn(doc, ["cv"]);
  const get = (key: string): string => {
    if (!cv) return "";
    const v = cv.get(key, true);
    return scalarToString(v) ?? "";
  };
  const getList = (key: string): string[] => {
    if (!cv) return [];
    return readStringList(cv.get(key, true));
  };
  return {
    name: get("name"),
    headline: get("headline"),
    location: get("location"),
    email: getList("email"),
    phone: getList("phone"),
    website: getList("website"),
    photo: get("photo"),
  };
}

export function getSocialNetworks(doc: Document): SocialNetworkEntry[] {
  const seq = getSeqIn(doc, ["cv", "social_networks"]);
  if (!seq) return [];
  return seq.items
    .filter((item): item is YAMLMap => isMap(item))
    .map((item) => {
      const network = scalarToString(item.get("network", true)) ?? "";
      const username = scalarToString(item.get("username", true)) ?? "";
      return { network, username };
    });
}

export function getCustomConnections(doc: Document): CustomConnectionEntry[] {
  const seq = getSeqIn(doc, ["cv", "custom_connections"]);
  if (!seq) return [];
  return seq.items
    .filter((item): item is YAMLMap => isMap(item))
    .map((item) => ({
      fontawesome_icon: scalarToString(item.get("fontawesome_icon", true)) ?? "",
      placeholder: scalarToString(item.get("placeholder", true)) ?? "",
      url: scalarToString(item.get("url", true)) ?? "",
    }));
}

export function getSections(doc: Document): SectionInfo[] {
  const sections = getMapIn(doc, ["cv", "sections"]);
  if (!sections) return [];
  const result: SectionInfo[] = [];
  for (const pair of sections.items) {
    if (!isPair(pair) || !isScalar(pair.key)) continue;
    const title = String((pair.key as Scalar).value);
    const value = pair.value;
    let entryCount = 0;
    let entryType: EntryTypeName = "TextEntry";
    if (isSeq(value)) {
      entryCount = value.items.length;
      if (entryCount > 0) {
        // detectSectionEntryType expects plain JS objects, not YAML nodes;
        // convert via toJSON so Object.keys works on the entries.
        const jsonEntries = value.items.map((item) =>
          isScalar(item) || isMap(item) || isSeq(item)
            ? (item as { toJSON: () => unknown }).toJSON()
            : item,
        );
        const detected = detectSectionEntryType(jsonEntries);
        if (detected) entryType = detected;
      }
    }
    result.push({ title, entryType, entryCount });
  }
  return result;
}

/**
 * Read all field values of an entry as a flat record of strings / string[].
 * Used by the form to seed inputs. Non-scalar fields are returned as their
 * YAML string representation so they're visible but not edited as scalars.
 */
export function readEntryFields(
  doc: Document,
  sectionTitle: string,
  index: number,
): Record<string, string | string[]> {
  const seq = getSeqIn(doc, ["cv", "sections", sectionTitle]);
  if (!seq || index < 0 || index >= seq.items.length) return {};
  const entry = seq.items[index];
  if (isScalar(entry)) {
    return { "": String((entry as Scalar).value ?? "") };
  }
  if (!isMap(entry)) return {};
  const result: Record<string, string | string[]> = {};
  for (const pair of entry.items) {
    if (!isPair(pair) || !isScalar(pair.key)) continue;
    const key = String((pair.key as Scalar).value);
    const value = pair.value;
    if (isSeq(value)) {
      result[key] = value.items
        .map((item) => scalarToString(item) ?? "")
        .filter((s) => s !== "");
    } else if (isScalar(value)) {
      const v = (value as Scalar).value;
      result[key] = v === null || v === undefined ? "" : String(v);
    } else if (isMap(value)) {
      // Preserve but not editable as scalar — stringify for display
      result[key] = docToString(value as unknown as Document);
    }
  }
  return result;
}

// =============================================================================
// Writers — scalars and lists at arbitrary paths
// =============================================================================

/**
 * Set a scalar value at a path. Empty string deletes the key. Missing
 * intermediate maps are created lazily. Returns the new YAML string, or
 * null on failure.
 */
export function setScalar(
  yaml: string,
  path: (string | number)[],
  value: string,
): string | null {
  if (path.length === 0) return null;
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;

  const trimmed = value.trim();
  if (trimmed === "") {
    return deletePath(yaml, path);
  }

  const parentPath = path.slice(0, -1);
  const lastKey = path[path.length - 1];
  const parent = ensureMapIn(doc, parentPath);
  if (!parent) return null;
  parent.set(lastKey, trimmed);
  return docToString(doc);
}

/**
 * Delete the node at a path. Returns the new YAML string, or null.
 */
export function deletePath(
  yaml: string,
  path: (string | number)[],
): string | null {
  if (path.length === 0) return null;
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;

  const parentPath = path.slice(0, -1);
  const lastKey = path[path.length - 1];
  const parent = getMapIn(doc, parentPath);
  if (!parent) return yaml; // nothing to delete
  if (parent.has(lastKey)) {
    parent.delete(lastKey);
    return docToString(doc);
  }
  return yaml;
}

/**
 * Set a string list at a path (e.g. highlights, authors, email list).
 * Empty list deletes the key. Returns the new YAML string, or null.
 */
export function setStringList(
  yaml: string,
  path: (string | number)[],
  values: string[],
): string | null {
  if (path.length === 0) return null;
  const cleaned = values.map((v) => v.trim()).filter((v) => v !== "");

  if (cleaned.length === 0) {
    return deletePath(yaml, path);
  }

  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;

  const parentPath = path.slice(0, -1);
  const lastKey = path[path.length - 1];
  const parent = ensureMapIn(doc, parentPath);
  if (!parent) return null;

  const seq = new YAMLSeq();
  for (const v of cleaned) seq.add(v);
  parent.set(lastKey, seq);
  return docToString(doc);
}

// =============================================================================
// Writers — sections
// =============================================================================

/**
 * Template for a new entry of the given type. Used by addSection and addEntry.
 */
export function newEntryTemplate(entryType: EntryTypeName): Record<string, unknown> | string {
  switch (entryType) {
    case "ExperienceEntry":
      return { company: "", position: "", highlights: [""] };
    case "EducationEntry":
      return { institution: "", area: "", highlights: [""] };
    case "NormalEntry":
      return { name: "", highlights: [""] };
    case "PublicationEntry":
      return { title: "", authors: [""] };
    case "BulletEntry":
      return { bullet: "" };
    case "OneLineEntry":
      return { label: "", details: "" };
    case "NumberedEntry":
      return { number: "" };
    case "ReversedNumberedEntry":
      return { reversed_number: "" };
    case "TextEntry":
    default:
      return "";
  }
}

/**
 * Add a new section with a template entry of the given type.
 * Returns the new YAML string, or null if the title already exists.
 */
export function addSection(
  yaml: string,
  title: string,
  entryType: EntryTypeName,
): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;

  const sections = ensureMapIn(doc, ["cv", "sections"]);
  if (!sections) return null;
  if (sections.has(title)) return null;

  const seq = new YAMLSeq();
  const template = newEntryTemplate(entryType);
  if (typeof template === "string") {
    seq.add(template);
  } else {
    const map = new YAMLMap();
    for (const [k, v] of Object.entries(template)) {
      if (Array.isArray(v)) {
        const sub = new YAMLSeq();
        for (const item of v) sub.add(item);
        map.set(k, sub);
      } else {
        map.set(k, v);
      }
    }
    seq.add(map);
  }
  sections.set(title, seq);
  return docToString(doc);
}

/**
 * Rename a section in-place (preserving its position and value).
 * Returns the new YAML string, or null.
 */
export function renameSection(
  yaml: string,
  oldTitle: string,
  newTitle: string,
): string | null {
  if (oldTitle === newTitle) return yaml;
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;

  const sections = getMapIn(doc, ["cv", "sections"]);
  if (!sections) return null;
  if (sections.has(newTitle)) return null; // name collision

  for (const pair of sections.items) {
    if (!isPair(pair) || !isScalar(pair.key)) continue;
    if (String((pair.key as Scalar).value) === oldTitle) {
      // Mutate the key in place to preserve position
      (pair.key as Scalar).value = newTitle;
      return docToString(doc);
    }
  }
  return null;
}

/**
 * Delete a section. Returns the new YAML string, or null.
 */
export function deleteSection(yaml: string, title: string): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const sections = getMapIn(doc, ["cv", "sections"]);
  if (!sections) return yaml;
  if (sections.has(title)) {
    sections.delete(title);
    return docToString(doc);
  }
  return yaml;
}

/**
 * Move a section from one index to another. Returns the new YAML string.
 */
export function moveSection(
  yaml: string,
  from: number,
  to: number,
): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const sections = getMapIn(doc, ["cv", "sections"]);
  if (!sections) return null;
  if (from < 0 || from >= sections.items.length) return null;
  if (to < 0 || to >= sections.items.length) return null;

  const [item] = sections.items.splice(from, 1);
  sections.items.splice(to, 0, item);
  return docToString(doc);
}

// =============================================================================
// Writers — entries
// =============================================================================

/**
 * Add a new entry to a section. Returns the new YAML string, or null.
 */
export function addEntry(
  yaml: string,
  sectionTitle: string,
  entryType: EntryTypeName,
): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const sections = ensureMapIn(doc, ["cv", "sections"]);
  if (!sections) return null;
  let seq: YAMLSeq | undefined = undefined;
  const existing = sections.get(sectionTitle, true);
  if (isSeq(existing)) {
    seq = existing;
  } else {
    seq = new YAMLSeq();
    sections.set(sectionTitle, seq);
  }
  const template = newEntryTemplate(entryType);
  if (typeof template === "string") {
    seq.add(template);
  } else {
    const map = new YAMLMap();
    for (const [k, v] of Object.entries(template)) {
      if (Array.isArray(v)) {
        const sub = new YAMLSeq();
        for (const item of v) sub.add(item);
        map.set(k, sub);
      } else {
        map.set(k, v);
      }
    }
    seq.add(map);
  }
  return docToString(doc);
}

/**
 * Delete an entry from a section by index. Returns the new YAML string.
 */
export function deleteEntry(
  yaml: string,
  sectionTitle: string,
  index: number,
): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const seq = getSeqIn(doc, ["cv", "sections", sectionTitle]);
  if (!seq || index < 0 || index >= seq.items.length) return null;
  seq.items.splice(index, 1);
  return docToString(doc);
}

/**
 * Duplicate an entry in place (immediately after the original).
 */
export function duplicateEntry(
  yaml: string,
  sectionTitle: string,
  index: number,
): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const seq = getSeqIn(doc, ["cv", "sections", sectionTitle]);
  if (!seq || index < 0 || index >= seq.items.length) return null;
  const original = seq.items[index];
  // Deep clone via createNode from the JSON value
  const clone = doc.createNode(nodeToValue(original));
  seq.items.splice(index + 1, 0, clone);
  return docToString(doc);
}

/**
 * Move an entry within a section. Returns the new YAML string.
 */
export function moveEntry(
  yaml: string,
  sectionTitle: string,
  from: number,
  to: number,
): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const seq = getSeqIn(doc, ["cv", "sections", sectionTitle]);
  if (!seq) return null;
  if (from < 0 || from >= seq.items.length) return null;
  if (to < 0 || to >= seq.items.length) return null;
  const [item] = seq.items.splice(from, 1);
  seq.items.splice(to, 0, item);
  return docToString(doc);
}

/**
 * Set a single field on an entry. Empty value deletes the field.
 * Returns the new YAML string, or null.
 */
export function setEntryField(
  yaml: string,
  sectionTitle: string,
  index: number,
  field: string,
  value: string,
): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const seq = getSeqIn(doc, ["cv", "sections", sectionTitle]);
  if (!seq || index < 0 || index >= seq.items.length) return null;
  const entry = seq.items[index];

  // TextEntry: the whole entry is a scalar string
  if (field === "" || isScalar(entry)) {
    seq.items[index] = doc.createNode(value);
    return docToString(doc);
  }

  if (!isMap(entry)) return null;
  const trimmed = value.trim();
  if (trimmed === "") {
    if (entry.has(field)) {
      entry.delete(field);
      return docToString(doc);
    }
    return yaml;
  }
  entry.set(field, trimmed);
  return docToString(doc);
}

/**
 * Set a string-list field on an entry (e.g. highlights, authors).
 * Empty list deletes the field. Returns the new YAML string, or null.
 */
export function setEntryListField(
  yaml: string,
  sectionTitle: string,
  index: number,
  field: string,
  values: string[],
): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const seq = getSeqIn(doc, ["cv", "sections", sectionTitle]);
  if (!seq || index < 0 || index >= seq.items.length) return null;
  const entry = seq.items[index];
  if (!isMap(entry)) return null;

  const cleaned = values.map((v) => v.trim()).filter((v) => v !== "");
  if (cleaned.length === 0) {
    if (entry.has(field)) {
      entry.delete(field);
      return docToString(doc);
    }
    return yaml;
  }
  const sub = new YAMLSeq();
  for (const v of cleaned) sub.add(v);
  entry.set(field, sub);
  return docToString(doc);
}

// =============================================================================
// Writers — social networks and custom connections
// =============================================================================

/**
 * Set a single field on a social network entry. Empty deletes the field.
 */
export function setSocialNetworkField(
  yaml: string,
  index: number,
  field: "network" | "username",
  value: string,
): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const seq = getSeqIn(doc, ["cv", "social_networks"]);
  if (!seq || index < 0 || index >= seq.items.length) return null;
  const entry = seq.items[index];
  if (!isMap(entry)) return null;
  const trimmed = value.trim();
  if (trimmed === "") {
    if (entry.has(field)) {
      entry.delete(field);
      return docToString(doc);
    }
    return yaml;
  }
  entry.set(field, trimmed);
  return docToString(doc);
}

/**
 * Add a blank social network entry.
 */
export function addSocialNetwork(yaml: string): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const cv = ensureMapIn(doc, ["cv"]);
  if (!cv) return null;
  let seq: YAMLSeq | undefined = undefined;
  const existing = cv.get("social_networks", true);
  if (isSeq(existing)) {
    seq = existing;
  } else {
    seq = new YAMLSeq();
    cv.set("social_networks", seq);
  }
  const map = new YAMLMap();
  map.set("network", "LinkedIn");
  map.set("username", "");
  seq.add(map);
  return docToString(doc);
}

/**
 * Delete a social network entry by index.
 */
export function deleteSocialNetwork(yaml: string, index: number): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const seq = getSeqIn(doc, ["cv", "social_networks"]);
  if (!seq || index < 0 || index >= seq.items.length) return null;
  seq.items.splice(index, 1);
  return docToString(doc);
}

/**
 * Set a field on a custom connection entry.
 */
export function setCustomConnectionField(
  yaml: string,
  index: number,
  field: "fontawesome_icon" | "placeholder" | "url",
  value: string,
): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const seq = getSeqIn(doc, ["cv", "custom_connections"]);
  if (!seq || index < 0 || index >= seq.items.length) return null;
  const entry = seq.items[index];
  if (!isMap(entry)) return null;
  const trimmed = value.trim();
  if (trimmed === "") {
    if (entry.has(field)) {
      entry.delete(field);
      return docToString(doc);
    }
    return yaml;
  }
  entry.set(field, trimmed);
  return docToString(doc);
}

/**
 * Add a blank custom connection entry.
 */
export function addCustomConnection(yaml: string): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const cv = ensureMapIn(doc, ["cv"]);
  if (!cv) return null;
  let seq: YAMLSeq | undefined = undefined;
  const existing = cv.get("custom_connections", true);
  if (isSeq(existing)) {
    seq = existing;
  } else {
    seq = new YAMLSeq();
    cv.set("custom_connections", seq);
  }
  const map = new YAMLMap();
  map.set("fontawesome_icon", "");
  map.set("placeholder", "");
  seq.add(map);
  return docToString(doc);
}

/**
 * Delete a custom connection entry by index.
 */
export function deleteCustomConnection(
  yaml: string,
  index: number,
): string | null {
  const { doc, error } = loadDoc(yaml);
  if (error || !doc) return null;
  const seq = getSeqIn(doc, ["cv", "custom_connections"]);
  if (!seq || index < 0 || index >= seq.items.length) return null;
  seq.items.splice(index, 1);
  return docToString(doc);
}
