/**
 * SVG icon utilities for Typst rendering.
 *
 * SVGs are imported as raw strings from src/icons/ and written to the
 * Typst compiler's virtual filesystem, with the fill color baked in to
 * match the CV's configured connections color. They are then referenced
 * by path in Typst's #image() function.
 *
 * Note: Typst's #image() renders SVGs via resvg in an isolated context —
 * it does NOT propagate Typst's ambient text color into the SVG (so
 * fill="currentColor" always resolves to black). To match the CV's text
 * color, we bake the actual color string directly into each SVG's fill
 * attribute before writing it to the compiler's virtual filesystem.
 */

// Import all SVG icons as raw strings (unmodified, straight from Font Awesome)
import bluesky from "@/icons/bluesky.svg?raw";
import code from "@/icons/code.svg?raw";
import envelope from "@/icons/envelope.svg?raw";
import github from "@/icons/github.svg?raw";
import gitlab from "@/icons/gitlab.svg?raw";
import graduationCap from "@/icons/graduation-cap.svg?raw";
import imdb from "@/icons/imdb.svg?raw";
import instagram from "@/icons/instagram.svg?raw";
import link from "@/icons/link.svg?raw";
import linkedin from "@/icons/linkedin.svg?raw";
import locationDot from "@/icons/location-dot.svg?raw";
import mastodon from "@/icons/mastodon.svg?raw";
import orcid from "@/icons/orcid.svg?raw";
import phone from "@/icons/phone.svg?raw";
import reddit from "@/icons/reddit.svg?raw";
import researchgate from "@/icons/researchgate.svg?raw";
import stackOverflow from "@/icons/stack-overflow.svg?raw";
import telegram from "@/icons/telegram.svg?raw";
import whatsapp from "@/icons/whatsapp.svg?raw";
import xTwitter from "@/icons/x-twitter.svg?raw";
import youtube from "@/icons/youtube.svg?raw";

/**
 * Raw (uncolored) SVG templates, keyed by icon name.
 */
export const svgTemplates: Record<string, string> = {
  bluesky,
  code,
  envelope,
  github,
  gitlab,
  "graduation-cap": graduationCap,
  imdb,
  instagram,
  link,
  linkedin,
  "location-dot": locationDot,
  mastodon,
  orcid,
  phone,
  reddit,
  researchgate,
  "stack-overflow": stackOverflow,
  telegram,
  whatsapp,
  "x-twitter": xTwitter,
  youtube,
};

const DEFAULT_ICON_COLOR = "rgb(0, 0, 0)";

/**
 * Sanitize a Typst color string for use as an SVG fill value.
 * Typst's `rgb(r, g, b)` and hex colors are valid SVG color syntax as-is.
 * Falls back to black for formats SVG can't understand (e.g. `luma(50)`).
 */
export function sanitizeColorForSvg(color: string | undefined): string {
  if (!color) return DEFAULT_ICON_COLOR;
  const trimmed = color.trim();
  const isRgbFn = /^rgba?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*(,\s*[\d.]+\s*)?\)$/i.test(
    trimmed,
  );
  const isHex = /^#[0-9a-f]{3,8}$/i.test(trimmed);
  const isNamedColor = /^[a-z]+$/i.test(trimmed);
  if (isRgbFn || isHex || isNamedColor) {
    return trimmed;
  }
  return DEFAULT_ICON_COLOR;
}

/**
 * Render an icon's SVG content with a specific fill color baked in.
 * Returns undefined if the icon name is not recognized.
 */
export function renderIconSvg(
  iconName: string,
  color: string | undefined,
): string | undefined {
  const template = svgTemplates[iconName];
  if (!template) return undefined;
  const fill = sanitizeColorForSvg(color);
  return template.replace(/<svg([^>]*?)>/i, `<svg$1 fill="${fill}">`);
}

/**
 * Map of icon names to their virtual filesystem path in the Typst compiler.
 * Icons are (re)written to the compiler's virtual FS before each compile,
 * with the color matching the CV's design.
 */
export const svgIconPaths: Record<string, string> = {};
for (const name of Object.keys(svgTemplates)) {
  svgIconPaths[name] = `/icons/${name}.svg`;
}
