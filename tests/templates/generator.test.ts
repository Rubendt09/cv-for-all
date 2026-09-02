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

  it("should translate section titles when locale.language is spanish", () => {
    const yaml = `
cv:
  name: Test User
  sections:
    Summary:
      - A brief summary
    Experience:
      - company: Tech Corp
        position: Engineer
        start_date: 2020-01
    Education:
      - institution: MIT
        degree: PhD
        area: CS
        start_date: 2018
        end_date: 2022
    Skills:
      - label: Languages
        details: Python, Go
    Awards:
      - label: Best Engineer
        details: 2023
    Certifications:
      - label: AWS
        details: 2022
design:
  theme: classic
locale:
  language: spanish
`;
    const parseResult = parseYaml(yaml);
    const modelResult = renderCVModelSchema.safeParse(parseResult.data);
    const model = modelResult.data as RenderCVModel;
    const typst = generateTypstSource(model);

    expect(typst).toContain("== Resumen");
    expect(typst).toContain("== Experiencia");
    expect(typst).toContain("== Educación");
    expect(typst).toContain("== Habilidades");
    expect(typst).toContain("== Premios");
    expect(typst).toContain("== Certificaciones");
    // English titles should not appear
    expect(typst).not.toContain("== Summary");
    expect(typst).not.toContain("== Experience");
    expect(typst).not.toContain("== Skills");
  });

  it("should keep English section titles when locale.language is english", () => {
    const yaml = `
cv:
  name: Test User
  sections:
    Skills:
      - label: Languages
        details: Python
design:
  theme: classic
locale:
  language: english
`;
    const parseResult = parseYaml(yaml);
    const modelResult = renderCVModelSchema.safeParse(parseResult.data);
    const model = modelResult.data as RenderCVModel;
    const typst = generateTypstSource(model);

    expect(typst).toContain("== Skills");
    expect(typst).not.toContain("== Habilidades");
  });

  it("should translate the top-note 'Last updated in' when locale.language is spanish", () => {
    const yaml = `
cv:
  name: Test User
design:
  theme: classic
locale:
  language: spanish
`;
    const parseResult = parseYaml(yaml);
    const modelResult = renderCVModelSchema.safeParse(parseResult.data);
    const model = modelResult.data as RenderCVModel;
    const typst = generateTypstSource(model);

    expect(typst).toContain("Actualizado en");
    expect(typst).not.toContain("Last updated in");
  });

  it("should keep English 'Last updated in' when locale.language is english", () => {
    const yaml = `
cv:
  name: Test User
design:
  theme: classic
locale:
  language: english
`;
    const parseResult = parseYaml(yaml);
    const modelResult = renderCVModelSchema.safeParse(parseResult.data);
    const model = modelResult.data as RenderCVModel;
    const typst = generateTypstSource(model);

    expect(typst).toContain("Last updated in");
  });

  it("should translate 'present' in date ranges when locale.language is spanish", () => {
    const yaml = `
cv:
  name: Test User
  sections:
    Experience:
      - company: Tech Corp
        position: Engineer
        start_date: 2020-01
        end_date: present
design:
  theme: classic
locale:
  language: spanish
`;
    const parseResult = parseYaml(yaml);
    const modelResult = renderCVModelSchema.safeParse(parseResult.data);
    const model = modelResult.data as RenderCVModel;
    const typst = generateTypstSource(model);

    expect(typst).toContain("presente");
  });

  it("should respect an explicit last_updated override even with spanish locale", () => {
    const yaml = `
cv:
  name: Test User
design:
  theme: classic
locale:
  language: spanish
  last_updated: Mi custom text
`;
    const parseResult = parseYaml(yaml);
    const modelResult = renderCVModelSchema.safeParse(parseResult.data);
    const model = modelResult.data as RenderCVModel;
    const typst = generateTypstSource(model);

    expect(typst).toContain("Mi custom text");
    expect(typst).not.toContain("Actualizado en");
  });

  it("should translate month abbreviations in entry dates when locale.language is spanish", () => {
    const yaml = `
cv:
  name: Test User
  sections:
    Experience:
      - company: Tech Corp
        position: Engineer
        start_date: 2026-01
        end_date: 2026-08-15
design:
  theme: classic
locale:
  language: spanish
`;
    const parseResult = parseYaml(yaml);
    const modelResult = renderCVModelSchema.safeParse(parseResult.data);
    const model = modelResult.data as RenderCVModel;
    const typst = generateTypstSource(model);

    // Spanish month abbreviations for January and August
    expect(typst).toContain("ene 2026");
    expect(typst).toContain("ago 2026");
    // English abbreviations should not appear
    expect(typst).not.toContain("Jan 2026");
    expect(typst).not.toContain("Aug 2026");
  });

  it("should keep English month abbreviations when locale.language is english", () => {
    const yaml = `
cv:
  name: Test User
  sections:
    Experience:
      - company: Tech Corp
        position: Engineer
        start_date: 2021-06-15
        end_date: 2022-08-15
design:
  theme: classic
locale:
  language: english
`;
    const parseResult = parseYaml(yaml);
    const modelResult = renderCVModelSchema.safeParse(parseResult.data);
    const model = modelResult.data as RenderCVModel;
    const typst = generateTypstSource(model);

    expect(typst).toContain("June 2021");
    expect(typst).toContain("Aug 2022");
  });
});
