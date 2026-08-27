/**
 * Markdown → Typst converter.
 *
 * Ported from RenderCV's markdown_parser.py. Converts Markdown syntax
 * (bold, italic, links, code, lists) to Typst markup, and escapes
 * Typst special characters in plain text.
 *
 * Uses `marked` to tokenize Markdown, then converts tokens to Typst.
 */
import { marked, type Token, type Tokens } from "marked";

// =============================================================================
// Typst character escaping
// =============================================================================

const typstCommandPattern = /#([A-Za-z][^\s()[\]]*)(\([^)]*\))?(\[[^\]]*\])?/g;
const mathPattern = /(\$\$.*?\$\$)/g;

const escapeMap: Record<string, string> = {
  "[": "\\[",
  "]": "\\]",
  "\\": "\\\\",
  '"': '\\"',
  "#": "\\#",
  $: "\\$",
  "@": "\\@",
  "%": "\\%",
  "~": "\\~",
  _: "\\_",
  "/": "\\/",
  ">": "\\>",
  "<": "\\<",
};

/**
 * Escape Typst special characters while preserving Typst commands and math.
 *
 * Mirrors RenderCV's `escape_typst_characters`. Typst commands (#strong[...])
 * and math ($$...$$) are temporarily replaced with placeholders, then the
 * remaining text is escaped, then placeholders are restored.
 */
export function escapeTypstCharacters(str: string): string {
  if (str === "\n") return str;

  // Extract Typst commands and math expressions into placeholders.
  const placeholders: Record<string, string> = {};
  let idx = 0;
  const extractPattern = new RegExp(
    `(${mathPattern.source})|(${typstCommandPattern.source})`,
    "g",
  );

  str = str.replace(extractPattern, (match) => {
    const dummy = `RENDERCVTYPSTCOMMANDORMATH${idx}`;
    // Convert $$ to $ for Typst math syntax.
    placeholders[dummy] = match.replace(/\$\$/g, "$");
    idx++;
    return dummy;
  });

  // Escape single-character specials.
  str = str.replace(/[[\]\\#"@$%~_/><]/g, (char) => escapeMap[char] ?? char);

  // Escape asterisks (Typst uses * for bullets, so we use sym.ast).
  str = str.replace(/\* /g, "#sym.ast.basic ");
  str = str.replace(/\*/g, "#sym.ast.basic#h(0pt, weak: true) ");

  // Restore placeholders.
  for (const [dummy, original] of Object.entries(placeholders)) {
    str = str.replace(dummy, original);
  }

  return str;
}

// =============================================================================
// Markdown → Typst conversion
// =============================================================================

/**
 * Convert a Markdown string to Typst markup.
 *
 * Handles: bold (**text**), italic (*text*), links ([text](url)),
 * inline code (`code`), and escapes special Typst characters in plain text.
 *
 * Mirrors RenderCV's `markdown_to_typst`. Each line is processed
 * independently to prevent cross-line emphasis marker interference.
 */
export function markdownToTypst(markdownString: string): string {
  const lines = markdownString.split("\n");
  const resultParts: string[] = [];

  for (const line of lines) {
    resultParts.push(convertLine(line));
  }

  return resultParts.join("\n");
}

/**
 * Convert a single line of Markdown to Typst.
 */
function convertLine(line: string): string {
  if (line.trim() === "") return "";

  // Use marked to tokenize the line.
  const tokens = marked.lexer(line);

  // marked.lexer returns an array of tokens. For a single line, we expect
  // a 'paragraph' token containing inline tokens, or a single token.
  const result: string[] = [];

  for (const token of tokens) {
    if (token.type === "paragraph" && "tokens" in token && token.tokens) {
      for (const inlineToken of token.tokens) {
        result.push(convertInlineToken(inlineToken));
      }
    } else if (token.type === "space") {
      // skip
    } else {
      result.push(convertInlineToken(token as Token));
    }
  }

  return result.join("");
}

/**
 * Convert a single inline Markdown token to Typst.
 */
function convertInlineToken(token: Token): string {
  switch (token.type) {
    case "text": {
      const t = token as Tokens.Text;
      return escapeTypstCharacters(t.text || "");
    }

    case "strong": {
      const t = token as Tokens.Strong;
      return `#strong[${convertTokens(t.tokens)}]`;
    }

    case "em": {
      const t = token as Tokens.Em;
      return `#emph[${convertTokens(t.tokens)}]`;
    }

    case "codespan": {
      const t = token as Tokens.Codespan;
      return `\`${t.text}\``;
    }

    case "link": {
      const t = token as Tokens.Link;
      return `#link("${t.href}")[${convertTokens(t.tokens)}]`;
    }

    case "del": {
      const t = token as Tokens.Del;
      return `#strike[${convertTokens(t.tokens)}]`;
    }

    case "br":
      return " \\ ";

    case "escape": {
      const t = token as Tokens.Escape;
      return escapeTypstCharacters(t.text || "");
    }

    case "html": {
      const t = token as Tokens.HTML;
      return escapeTypstCharacters(t.text || "");
    }

    default:
      // For any unhandled token type, try to extract text.
      if ("text" in token && typeof token.text === "string") {
        return escapeTypstCharacters(token.text);
      }
      if ("raw" in token && typeof token.raw === "string") {
        return escapeTypstCharacters(token.raw);
      }
      return "";
  }
}

/**
 * Convert an array of inline tokens to Typst.
 */
function convertTokens(tokens?: Token[] | null): string {
  if (!tokens) return "";
  return tokens.map((t) => convertInlineToken(t)).join("");
}
