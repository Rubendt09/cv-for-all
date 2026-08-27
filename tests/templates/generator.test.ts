import { describe, it, expect } from "vitest";
import { generateTypstFromYaml } from "@/pdf/generator";
import { renderCVModelSchema } from "@/yaml/schema";
import { parseYaml } from "@/yaml/parser";
import { generateTypstSource } from "@/templates/generator";
import type { RenderCVModel } from "@/types/cv";

describe("generateTypstFromYaml", () => {
  it("should generate Typst source from valid YAML", () => {
    const yaml = `
cv:
  name: John Doe
  headline: Engineer
  sections:
    Experience:
      - company: Tech Corp
        position: Engineer
        start_date: 2020-01
        end_date: present
design:
  theme: classic
`;
    const result = generateTypstFromYaml(yaml);
    expect(result.success).toBe(true);
    expect(result.typstSource).toBeDefined();
    expect(result.typstSource).toContain("@preview/rendercv");
    expect(result.typstSource).toContain("John Doe");
  });

  it("should fail for invalid YAML", () => {
    const result = generateTypstFromYaml("cv: [unclosed");
    expect(result.success).toBe(false);
  });
});

describe("generateTypstSource", () => {
  it("should generate preamble with rendercv import", () => {
    const yaml = `
cv:
  name: Test User
design:
  theme: classic
`;
    const parseResult = parseYaml(yaml);
    const modelResult = renderCVModelSchema.safeParse(parseResult.data);
    const model = modelResult.data as RenderCVModel;
    const typst = generateTypstSource(model);

    expect(typst).toContain('#import "@preview/rendercv:0.3.0": *');
    expect(typst).toContain("Test User");
    expect(typst).toContain("#show: rendercv.with(");
  });

  it("should include section titles", () => {
    const yaml = `
cv:
  name: Test User
  sections:
    Experience:
      - company: Tech Corp
        position: Engineer
design:
  theme: classic
`;
    const parseResult = parseYaml(yaml);
    const modelResult = renderCVModelSchema.safeParse(parseResult.data);
    const model = modelResult.data as RenderCVModel;
    const typst = generateTypstSource(model);

    expect(typst).toContain("== Experience");
    expect(typst).toContain("Tech Corp");
  });

  it("should generate valid Typst for a header photo", () => {
    const yaml = `
cv:
  name: Test User
  photo: portrait.png
design:
  theme: classic
`;
    const parseResult = parseYaml(yaml);
    const modelResult = renderCVModelSchema.safeParse(parseResult.data);
    const model = modelResult.data as RenderCVModel;
    const typst = generateTypstSource(model);

    expect(typst).toContain('image("portrait.png", width: 3.5cm)');
    expect(typst).not.toContain("{% macro");
    expect(typst).not.toContain("{{ image() }}");
  });

  it("should handle different themes", () => {
    const themes = ["moderncv", "sb2nov", "harvard"];
    for (const theme of themes) {
      const yaml = `
cv:
  name: Test
design:
  theme: ${theme}
`;
      const parseResult = parseYaml(yaml);
      const modelResult = renderCVModelSchema.safeParse(parseResult.data);
      const model = modelResult.data as RenderCVModel;
      const typst = generateTypstSource(model);
      expect(typst).toContain("#show: rendercv.with(");
    }
  });
});
