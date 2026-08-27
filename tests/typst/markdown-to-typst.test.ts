import { describe, it, expect } from "vitest";
import {
  markdownToTypst,
  escapeTypstCharacters,
} from "@/typst/markdown-to-typst";

describe("escapeTypstCharacters", () => {
  it("should escape # character when not part of a Typst command", () => {
    // # followed by space or non-letter is escaped
    expect(escapeTypstCharacters("hello # world")).toBe("hello \\# world");
  });

  it("should escape $ character", () => {
    expect(escapeTypstCharacters("cost $5")).toBe("cost \\$5");
  });

  it("should escape [ and ]", () => {
    expect(escapeTypstCharacters("text [bracket]")).toBe(
      "text \\[bracket\\]",
    );
  });

  it("should escape @ character", () => {
    expect(escapeTypstCharacters("user @handle")).toBe("user \\@handle");
  });

  it("should preserve newlines", () => {
    expect(escapeTypstCharacters("\n")).toBe("\n");
  });
});

describe("markdownToTypst", () => {
  it("should convert bold text", () => {
    const result = markdownToTypst("**bold text**");
    expect(result).toContain("#strong[");
    expect(result).toContain("bold text");
  });

  it("should convert italic text", () => {
    const result = markdownToTypst("*italic text*");
    expect(result).toContain("#emph[");
    expect(result).toContain("italic text");
  });

  it("should convert links", () => {
    const result = markdownToTypst("[click here](https://example.com)");
    expect(result).toContain('#link("https://example.com")');
    expect(result).toContain("click here");
  });

  it("should convert inline code", () => {
    const result = markdownToTypst("`code`");
    expect(result).toContain("`code`");
  });

  it("should handle plain text", () => {
    const result = markdownToTypst("just plain text");
    expect(result).toContain("just plain text");
  });

  it("should handle empty string", () => {
    expect(markdownToTypst("")).toBe("");
  });

  it("should handle multi-line text", () => {
    const result = markdownToTypst("line 1\nline 2");
    expect(result).toContain("line 1");
    expect(result).toContain("line 2");
  });
});
