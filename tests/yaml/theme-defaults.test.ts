import { describe, it, expect } from "vitest";
import { getThemeDefaults } from "@/yaml/theme-defaults";
import { designSchema } from "@/yaml/schema";

interface ExpectedDefaults {
  header?: { alignment?: string };
  typography?: { font_family?: { body?: string } };
  colors?: { name?: string };
  section_titles?: { type?: string };
}

describe("theme defaults", () => {
  it("classic should have centered header", () => {
    const defaults = getThemeDefaults("classic") as ExpectedDefaults;
    expect(defaults.header?.alignment).toBe("center");
  });

  it("moderncv should have left header and Fontin font", () => {
    const defaults = getThemeDefaults("moderncv") as ExpectedDefaults;
    expect(defaults.header?.alignment).toBe("left");
    expect(defaults.typography?.font_family?.body).toBe("Fontin");
  });

  it("ink should have EB Garamond and purple colors", () => {
    const defaults = getThemeDefaults("ink") as ExpectedDefaults;
    expect(defaults.typography?.font_family?.body).toBe("EB Garamond");
    expect(defaults.colors?.name).toBe("rgb(42, 24, 82)");
  });

  it("engineeringresumes should have with_full_line sections and XCharter", () => {
    const defaults = getThemeDefaults("engineeringresumes") as ExpectedDefaults;
    expect(defaults.section_titles?.type).toBe("with_full_line");
    expect(defaults.typography?.font_family?.body).toBe("XCharter");
  });

  it("schema should apply theme defaults when parsing", () => {
    const result = designSchema.safeParse({ theme: "moderncv" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.header.alignment).toBe("left");
      expect(result.data.typography.font_family.body).toBe("Fontin");
    }
  });

  it("schema should apply classic defaults when no theme specified", () => {
    const result = designSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.theme).toBe("classic");
      expect(result.data.header.alignment).toBe("center");
    }
  });

  it("user overrides should take precedence over theme defaults", () => {
    const result = designSchema.safeParse({
      theme: "moderncv",
      header: { alignment: "right" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.header.alignment).toBe("right");
      // But font should still be Fontin from moderncv
      expect(result.data.typography.font_family.body).toBe("Fontin");
    }
  });

  it("different themes should produce different entry templates", () => {
    const classic = designSchema.safeParse({ theme: "classic" });
    const moderncv = designSchema.safeParse({ theme: "moderncv" });
    expect(classic.success).toBe(true);
    expect(moderncv.success).toBe(true);
    if (classic.success && moderncv.success) {
      expect(classic.data.templates.experience_entry.main_column).not.toBe(
        moderncv.data.templates.experience_entry.main_column,
      );
    }
  });
});
