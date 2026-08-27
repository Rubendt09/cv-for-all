import { describe, it, expect } from "vitest";
import {
  detectEntryType,
  detectSectionEntryType,
  getCharacteristicFields,
} from "@/yaml/entry-detection";

describe("detectEntryType", () => {
  it("should detect TextEntry for strings", () => {
    expect(detectEntryType("some text")).toBe("TextEntry");
  });

  it("should detect ExperienceEntry by company + position", () => {
    expect(
      detectEntryType({ company: "Tech Corp", position: "Engineer" }),
    ).toBe("ExperienceEntry");
  });

  it("should detect EducationEntry by institution + area", () => {
    expect(
      detectEntryType({
        institution: "MIT",
        area: "Computer Science",
        degree: "BS",
      }),
    ).toBe("EducationEntry");
  });

  it("should detect NormalEntry by name", () => {
    expect(detectEntryType({ name: "Some Project" })).toBe("NormalEntry");
  });

  it("should detect PublicationEntry by title + authors", () => {
    expect(
      detectEntryType({
        title: "My Paper",
        authors: ["John Doe"],
      }),
    ).toBe("PublicationEntry");
  });

  it("should detect BulletEntry by bullet", () => {
    expect(detectEntryType({ bullet: "Some bullet point" })).toBe(
      "BulletEntry",
    );
  });

  it("should detect OneLineEntry by label + details", () => {
    expect(
      detectEntryType({ label: "Languages", details: "Python, Go" }),
    ).toBe("OneLineEntry");
  });

  it("should detect NumberedEntry by number", () => {
    expect(detectEntryType({ number: "First item" })).toBe("NumberedEntry");
  });

  it("should detect ReversedNumberedEntry by reversed_number", () => {
    expect(
      detectEntryType({ reversed_number: "Latest item" }),
    ).toBe("ReversedNumberedEntry");
  });

  it("should return null for empty objects", () => {
    expect(detectEntryType({})).toBe(null);
  });

  it("should return null for null/undefined", () => {
    expect(detectEntryType(null)).toBe(null);
    expect(detectEntryType(undefined)).toBe(null);
  });
});

describe("detectSectionEntryType", () => {
  it("should return TextEntry for empty sections", () => {
    expect(detectSectionEntryType([])).toBe("TextEntry");
  });

  it("should detect type from first identifiable entry", () => {
    const entries = [
      { company: "Tech Corp", position: "Engineer" },
      { company: "Other Corp", position: "Manager" },
    ];
    expect(detectSectionEntryType(entries)).toBe("ExperienceEntry");
  });

  it("should return null if no entries match", () => {
    const entries = [{ unknown_field: "value" }];
    expect(detectSectionEntryType(entries)).toBe(null);
  });
});

describe("getCharacteristicFields", () => {
  it("should return characteristic fields for ExperienceEntry", () => {
    const fields = getCharacteristicFields("ExperienceEntry");
    expect(fields.has("company")).toBe(true);
    expect(fields.has("position")).toBe(true);
  });

  it("should return characteristic fields for EducationEntry", () => {
    const fields = getCharacteristicFields("EducationEntry");
    expect(fields.has("institution")).toBe(true);
    expect(fields.has("area")).toBe(true);
  });
});
