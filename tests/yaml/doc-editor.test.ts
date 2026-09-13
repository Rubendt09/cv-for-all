/**
 * Tests for the surgical YAML document editor.
 */
import { describe, it, expect } from "vitest";
import {
  loadDoc,
  docToString,
  hasAliasesInCv,
  getCvBasics,
  getSocialNetworks,
  getSections,
  readEntryFields,
  setScalar,
  deletePath,
  setStringList,
  addSection,
  renameSection,
  deleteSection,
  moveSection,
  addEntry,
  deleteEntry,
  duplicateEntry,
  moveEntry,
  setEntryField,
  setEntryListField,
  setSocialNetworkField,
  addSocialNetwork,
  deleteSocialNetwork,
} from "@/yaml/doc-editor";
import { parseAndValidate } from "@/yaml/parser";
import type { EntryTypeName } from "@/types/cv";

const EXAMPLE = `cv:
  name: John Doe
  headline: Software Engineer
  location: San Francisco, CA
  email: john.doe@email.com
  website: https://johndoe.com
  social_networks:
    - network: LinkedIn
      username: johndoe
    - network: GitHub
      username: johndoe
  sections:
    Summary:
      - Experienced software engineer with 8+ years building scalable systems.
    Experience:
      - company: Tech Corp
        position: Senior Software Engineer
        start_date: 2021-06
        end_date: present
        location: San Francisco, CA
        highlights:
          - Led team of 5 engineers
          - Reduced API latency by 40%
      - company: Startup Inc
        position: Software Engineer
        start_date: 2018-01
        end_date: 2021-05
        highlights:
          - Built microservices architecture
    Education:
      - institution: UC Berkeley
        area: Computer Science
        degree: BS
        start_date: 2014
        end_date: 2018
design:
  theme: classic
  page:
    size: a4
locale:
  language: english
settings:
  current_date: today
  bold_keywords: []
  pdf_title: NAME - CV
`;

function isValidYaml(yaml: string): boolean {
  return parseAndValidate(yaml).success;
}

describe("loadDoc / docToString", () => {
  it("parses a valid document", () => {
    const { doc, error } = loadDoc(EXAMPLE);
    expect(error).toBeUndefined();
    expect(doc).not.toBeNull();
  });

  it("returns an error for invalid YAML", () => {
    const { doc, error } = loadDoc("cv:\n  name: John\n  bad: : :");
    expect(doc).toBeNull();
    expect(error).toBeTruthy();
  });

  it("is idempotent: toString(loadDoc(x)) then reload is stable", () => {
    const { doc } = loadDoc(EXAMPLE);
    expect(doc).not.toBeNull();
    const out = docToString(doc!);
    const { doc: doc2 } = loadDoc(out);
    expect(doc2).not.toBeNull();
    expect(docToString(doc2!)).toBe(out);
  });

  it("preserves comments through round-trip", () => {
    const yaml = `# top comment
cv:
  name: John # inline comment
  # field comment
  headline: Engineer
`;
    const { doc } = loadDoc(yaml);
    const out = docToString(doc!);
    expect(out).toContain("# top comment");
    expect(out).toContain("# inline comment");
    expect(out).toContain("# field comment");
  });
});

describe("hasAliasesInCv", () => {
  it("returns false for plain YAML", () => {
    const { doc } = loadDoc(EXAMPLE);
    expect(hasAliasesInCv(doc!)).toBe(false);
  });

  it("returns true when cv has an anchor", () => {
    const yaml = `cv:
  name: &n John
  headline: *n
`;
    const { doc } = loadDoc(yaml);
    expect(hasAliasesInCv(doc!)).toBe(true);
  });
});

describe("readers", () => {
  it("getCvBasics reads scalar and list fields", () => {
    const { doc } = loadDoc(EXAMPLE);
    const basics = getCvBasics(doc!);
    expect(basics.name).toBe("John Doe");
    expect(basics.headline).toBe("Software Engineer");
    expect(basics.email).toEqual(["john.doe@email.com"]);
    expect(basics.website).toEqual(["https://johndoe.com"]);
  });

  it("getSocialNetworks reads the list", () => {
    const { doc } = loadDoc(EXAMPLE);
    const nets = getSocialNetworks(doc!);
    expect(nets).toHaveLength(2);
    expect(nets[0]).toEqual({ network: "LinkedIn", username: "johndoe" });
  });

  it("getSections returns titles in order with detected types", () => {
    const { doc } = loadDoc(EXAMPLE);
    const sections = getSections(doc!);
    expect(sections.map((s) => s.title)).toEqual([
      "Summary",
      "Experience",
      "Education",
    ]);
    expect(sections[0].entryType).toBe("TextEntry");
    expect(sections[1].entryType).toBe("ExperienceEntry");
    expect(sections[2].entryType).toBe("EducationEntry");
    expect(sections[1].entryCount).toBe(2);
  });

  it("readEntryFields reads a map entry", () => {
    const { doc } = loadDoc(EXAMPLE);
    const fields = readEntryFields(doc!, "Experience", 0);
    expect(fields.company).toBe("Tech Corp");
    expect(fields.position).toBe("Senior Software Engineer");
    expect(fields.highlights).toEqual([
      "Led team of 5 engineers",
      "Reduced API latency by 40%",
    ]);
  });

  it("readEntryFields reads a text entry", () => {
    const { doc } = loadDoc(EXAMPLE);
    const fields = readEntryFields(doc!, "Summary", 0);
    expect(fields[""]).toContain("Experienced software engineer");
  });
});

describe("setScalar / deletePath", () => {
  it("updates an existing scalar", () => {
    const out = setScalar(EXAMPLE, ["cv", "name"], "Jane Doe");
    expect(out).not.toBeNull();
    expect(out).toContain("name: Jane Doe");
    expect(isValidYaml(out!)).toBe(true);
  });

  it("creates intermediate maps lazily", () => {
    const minimal = `design:\n  theme: classic\n`;
    const out = setScalar(minimal, ["cv", "name"], "John");
    expect(out).not.toBeNull();
    expect(out).toContain("cv:");
    expect(out).toContain("name: John");
    expect(isValidYaml(out!)).toBe(true);
  });

  it("deletes the key when value is empty", () => {
    const out = setScalar(EXAMPLE, ["cv", "name"], "");
    expect(out).not.toBeNull();
    expect(out).not.toContain("name: John Doe");
    // Other fields preserved
    expect(out).toContain("headline: Software Engineer");
  });

  it("deletePath removes a key", () => {
    const out = deletePath(EXAMPLE, ["cv", "headline"]);
    expect(out).not.toBeNull();
    expect(out).not.toContain("headline:");
  });
});

describe("setStringList", () => {
  it("sets a list at a new path", () => {
    const out = setStringList(EXAMPLE, ["cv", "phone"], ["+1 555", "+1 666"]);
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    expect(getCvBasics(doc!).phone).toEqual(["+1 555", "+1 666"]);
  });

  it("deletes the key when list is empty", () => {
    const out = setStringList(EXAMPLE, ["cv", "email"], []);
    expect(out).not.toBeNull();
    expect(out).not.toContain("email:");
  });

  it("converts a scalar to a list", () => {
    const out = setStringList(EXAMPLE, ["cv", "email"], ["a@b.com", "c@d.com"]);
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    expect(getCvBasics(doc!).email).toEqual(["a@b.com", "c@d.com"]);
  });
});

describe("sections", () => {
  it("addSection creates a section with a template entry", () => {
    const out = addSection(EXAMPLE, "Projects", "NormalEntry");
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    const sections = getSections(doc!);
    expect(sections.map((s) => s.title)).toContain("Projects");
    const projects = sections.find((s) => s.title === "Projects")!;
    expect(projects.entryType).toBe("NormalEntry");
    expect(projects.entryCount).toBe(1);
    expect(isValidYaml(out!)).toBe(true);
  });

  it("addSection returns null on duplicate title", () => {
    const out = addSection(EXAMPLE, "Experience", "ExperienceEntry");
    expect(out).toBeNull();
  });

  it("renameSection preserves position", () => {
    const out = renameSection(EXAMPLE, "Experience", "Work History");
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    const sections = getSections(doc!);
    expect(sections.map((s) => s.title)).toEqual([
      "Summary",
      "Work History",
      "Education",
    ]);
  });

  it("renameSection returns null on collision", () => {
    const out = renameSection(EXAMPLE, "Experience", "Education");
    expect(out).toBeNull();
  });

  it("deleteSection removes a section", () => {
    const out = deleteSection(EXAMPLE, "Experience");
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    expect(getSections(doc!).map((s) => s.title)).not.toContain("Experience");
  });

  it("moveSection reorders", () => {
    const out = moveSection(EXAMPLE, 1, 0); // Experience -> first
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    expect(getSections(doc!).map((s) => s.title)).toEqual([
      "Experience",
      "Summary",
      "Education",
    ]);
  });
});

describe("entries", () => {
  it("addEntry appends a new entry", () => {
    const out = addEntry(EXAMPLE, "Experience", "ExperienceEntry");
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    const sections = getSections(doc!);
    expect(sections.find((s) => s.title === "Experience")!.entryCount).toBe(3);
  });

  it("deleteEntry removes by index", () => {
    const out = deleteEntry(EXAMPLE, "Experience", 0);
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    const sections = getSections(doc!);
    expect(sections.find((s) => s.title === "Experience")!.entryCount).toBe(1);
  });

  it("duplicateEntry copies in place", () => {
    const out = duplicateEntry(EXAMPLE, "Experience", 0);
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    const sections = getSections(doc!);
    expect(sections.find((s) => s.title === "Experience")!.entryCount).toBe(3);
    const f0 = readEntryFields(doc!, "Experience", 0);
    const f1 = readEntryFields(doc!, "Experience", 1);
    expect(f0.company).toBe(f1.company);
  });

  it("moveEntry reorders within a section", () => {
    const out = moveEntry(EXAMPLE, "Experience", 1, 0);
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    const f0 = readEntryFields(doc!, "Experience", 0);
    expect(f0.company).toBe("Startup Inc");
  });

  it("setEntryField updates a field", () => {
    const out = setEntryField(EXAMPLE, "Experience", 0, "company", "Big Corp");
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    expect(readEntryFields(doc!, "Experience", 0).company).toBe("Big Corp");
  });

  it("setEntryField deletes when empty", () => {
    const out = setEntryField(EXAMPLE, "Experience", 0, "location", "");
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    // Field is removed from the entry, so readEntryFields omits it
    expect(readEntryFields(doc!, "Experience", 0).location).toBeUndefined();
    // The entry no longer has a location field; cv.location (top-level) is
    // unaffected and still present, so only check the entry-specific line.
    const reloaded = loadDoc(out!);
    const fields = readEntryFields(reloaded.doc!, "Experience", 0);
    expect("location" in fields).toBe(false);
  });

  it("setEntryListField updates a list field", () => {
    const out = setEntryListField(EXAMPLE, "Experience", 0, "highlights", [
      "New highlight",
      "Another",
    ]);
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    expect(readEntryFields(doc!, "Experience", 0).highlights).toEqual([
      "New highlight",
      "Another",
    ]);
  });

  it("setEntryField on a TextEntry updates the whole entry", () => {
    const out = setEntryField(EXAMPLE, "Summary", 0, "", "New summary text.");
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    expect(readEntryFields(doc!, "Summary", 0)[""]).toBe("New summary text.");
  });
});

describe("all entry types round-trip through validation", () => {
  const types: EntryTypeName[] = [
    "ExperienceEntry",
    "EducationEntry",
    "NormalEntry",
    "PublicationEntry",
    "BulletEntry",
    "OneLineEntry",
    "NumberedEntry",
    "ReversedNumberedEntry",
    "TextEntry",
  ];

  for (const t of types) {
    it(`addSection + addEntry produces valid YAML for ${t}`, () => {
      let yaml = addSection(EXAMPLE, `Test_${t}`, t);
      expect(yaml).not.toBeNull();
      // Add a second entry to test multi-entry
      yaml = addEntry(yaml!, `Test_${t}`, t);
      expect(yaml).not.toBeNull();
      expect(isValidYaml(yaml!)).toBe(true);
    });
  }
});

describe("social networks", () => {
  it("setSocialNetworkField updates a field", () => {
    const out = setSocialNetworkField(EXAMPLE, 0, "username", "newuser");
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    expect(getSocialNetworks(doc!)[0].username).toBe("newuser");
  });

  it("addSocialNetwork appends a blank entry", () => {
    const out = addSocialNetwork(EXAMPLE);
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    expect(getSocialNetworks(doc!)).toHaveLength(3);
  });

  it("deleteSocialNetwork removes by index", () => {
    const out = deleteSocialNetwork(EXAMPLE, 0);
    expect(out).not.toBeNull();
    const { doc } = loadDoc(out!);
    expect(getSocialNetworks(doc!)).toHaveLength(1);
  });
});

describe("comment preservation through edits", () => {
  it("preserves comments after setScalar", () => {
    const yaml = `# my CV
cv:
  name: John # the name
  headline: Engineer
`;
    const out = setScalar(yaml, ["cv", "name"], "Jane");
    expect(out).not.toBeNull();
    expect(out).toContain("# my CV");
    expect(out).toContain("# the name");
  });

  it("preserves comments after addSection", () => {
    const yaml = `# my CV
cv:
  name: John
  sections:
    Experience:
      - company: Tech Corp
`;
    const out = addSection(yaml, "Education", "EducationEntry");
    expect(out).not.toBeNull();
    expect(out).toContain("# my CV");
    expect(out).toContain("Experience:");
  });
});
