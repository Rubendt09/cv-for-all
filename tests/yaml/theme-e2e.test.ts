import { describe, it, expect } from "vitest";
import { parseYaml } from "@/yaml/parser";
import { renderCVModelSchema } from "@/yaml/schema";

const baseYaml = `
cv:
  name: Test Person
  sections:
    Education:
      - institution: MIT
        degree: PhD
        area: CS
        start_date: 2020
        end_date: 2024
design:
  theme: CLASS_THEME
locale:
  language: english
`;

describe("theme end-to-end", () => {
  it("classic vs moderncv should produce different designs", () => {
    const classicYaml = baseYaml.replace("CLASS_THEME", "classic");
    const moderncvYaml = baseYaml.replace("CLASS_THEME", "moderncv");

    const classicParsed = parseYaml(classicYaml);
    const moderncvParsed = parseYaml(moderncvYaml);

    const classicModel = renderCVModelSchema.safeParse(classicParsed.data);
    const moderncvModel = renderCVModelSchema.safeParse(moderncvParsed.data);

    expect(classicModel.success).toBe(true);
    expect(moderncvModel.success).toBe(true);

    if (classicModel.success && moderncvModel.success) {
      // Different header alignment
      expect(classicModel.data.design.header.alignment).toBe("center");
      expect(moderncvModel.data.design.header.alignment).toBe("left");

      // Different fonts
      expect(classicModel.data.design.typography.font_family.body).toBe("Libertinus Serif");
      expect(moderncvModel.data.design.typography.font_family.body).toBe("Fontin");

      // Different entry templates
      expect(classicModel.data.design.templates.experience_entry.main_column).toContain("**COMPANY**, POSITION");
      expect(moderncvModel.data.design.templates.experience_entry.main_column).toContain("**POSITION**, COMPANY");
    }
  });

  it("ink vs opal should produce different colors", () => {
    const inkYaml = baseYaml.replace("CLASS_THEME", "ink");
    const opalYaml = baseYaml.replace("CLASS_THEME", "opal");

    const inkModel = renderCVModelSchema.safeParse(parseYaml(inkYaml).data);
    const opalModel = renderCVModelSchema.safeParse(parseYaml(opalYaml).data);

    expect(inkModel.success).toBe(true);
    expect(opalModel.success).toBe(true);

    if (inkModel.success && opalModel.success) {
      expect(inkModel.data.design.colors.name).toBe("rgb(42, 24, 82)");
      expect(opalModel.data.design.colors.name).toBe("rgb(0, 100, 90)");
    }
  });
});
