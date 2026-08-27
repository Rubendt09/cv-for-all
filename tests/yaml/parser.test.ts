import { describe, it, expect } from "vitest";
import { parseYaml, validateSchema, parseAndValidate } from "@/yaml/parser";

describe("parseYaml", () => {
  it("should parse valid YAML", () => {
    const result = parseYaml("name: John Doe");
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: "John Doe" });
  });

  it("should detect syntax errors", () => {
    const result = parseYaml("name: John Doe\n  bad: indentation");
    expect(result.success).toBe(false);
    expect(result.errors[0].kind).toBe("syntax");
    expect(result.errors[0].line).toBeDefined();
  });

  it("should handle empty input", () => {
    const result = parseYaml("");
    expect(result.success).toBe(true);
    expect(result.data).toBe(null);
  });

  it("should handle complex YAML", () => {
    const yaml = `
cv:
  name: John Doe
  sections:
    Experience:
      - company: Tech Corp
        position: Engineer
`;
    const result = parseYaml(yaml);
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty("cv.name", "John Doe");
  });
});

describe("validateSchema", () => {
  it("should validate a minimal CV", () => {
    const result = validateSchema({ cv: { name: "John" } });
    expect(result.success).toBe(true);
  });

  it("should apply defaults for missing fields", () => {
    const result = validateSchema({ cv: { name: "John" } });
    expect(result.success).toBe(true);
    const data = result.data as { design: { theme: string } };
    expect(data.design.theme).toBe("classic");
  });

  it("should reject invalid theme name", () => {
    const result = validateSchema({
      cv: { name: "John" },
      design: { theme: "nonexistent" },
    });
    expect(result.success).toBe(false);
  });

  it("should accept all valid theme names", () => {
    const themes = [
      "classic",
      "moderncv",
      "sb2nov",
      "engineeringresumes",
      "engineeringclassic",
      "harvard",
      "ink",
      "opal",
      "ember",
    ];
    for (const theme of themes) {
      const result = validateSchema({
        cv: { name: "John" },
        design: { theme },
      });
      expect(result.success).toBe(true);
    }
  });

  it("should validate email field", () => {
    const result = validateSchema({
      cv: { name: "John", email: "not-an-email" },
    });
    expect(result.success).toBe(false);
  });

  it("should accept valid email", () => {
    const result = validateSchema({
      cv: { name: "John", email: "john@example.com" },
    });
    expect(result.success).toBe(true);
  });

  it("should accept list of emails", () => {
    const result = validateSchema({
      cv: {
        name: "John",
        email: ["john@example.com", "john2@example.com"],
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("parseAndValidate", () => {
  it("should parse and validate a complete CV", () => {
    const yaml = `
cv:
  name: John Doe
  email: john@example.com
  sections:
    Experience:
      - company: Tech Corp
        position: Engineer
        start_date: 2020-01
        end_date: present
design:
  theme: classic
`;
    const result = parseAndValidate(yaml);
    expect(result.success).toBe(true);
  });

  it("should return syntax errors for invalid YAML", () => {
    const result = parseAndValidate("cv: [unclosed");
    expect(result.success).toBe(false);
    expect(result.errors[0].kind).toBe("syntax");
  });

  it("should return schema errors for invalid structure", () => {
    const result = parseAndValidate("cv: 123");
    expect(result.success).toBe(false);
  });
});
