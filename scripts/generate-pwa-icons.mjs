/**
 * Generate PWA icons (PNG) from the project favicon.svg.
 *
 * Produces, in public/icons/:
 *   - icon-192.png           (192x192, any purpose)
 *   - icon-512.png           (512x512, any purpose)
 *   - icon-maskable-512.png  (512x512, maskable — logo scaled to 60% on full bg)
 *   - apple-touch-icon.png   (180x180, opaque bg for iOS home screen)
 *
 * Run: npm run generate-icons
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourceSvgPath = path.join(root, "public", "favicon.svg");
const outDir = path.join(root, "public", "icons");

const BG = "#1c1f22";

/**
 * Build an SVG string for a given pixel size.
 *
 * @param size      Output canvas size in pixels.
 * @param logoScale Fraction of the canvas the logo (the [cv] glyph block) should
 *                  occupy. 1.0 = edge-to-edge (any-purpose), ~0.6 = maskable
 *                  safe zone (80% central area).
 */
function buildIconSvg(size, logoScale = 1.0) {
  // The source favicon draws a rounded rect filling the 32x32 viewBox with the
  // "[cv]" text centered. To embed it at a given scale we render the source
  // SVG inside a <svg> of `size` and place it centered at logoScale.
  const logoSize = size * logoScale;
  const offset = (size - logoSize) / 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}" />
  <svg x="${offset}" y="${offset}" width="${logoSize}" height="${logoSize}" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet">
    <text x="16" y="22" font-family="monospace" font-size="14" font-weight="bold" fill="#e0a552" text-anchor="middle">[cv]</text>
  </svg>
</svg>`;
}

async function render(svgString, size, file) {
  const buf = await sharp(Buffer.from(svgString)).png().toFile(file);
  return file;
}

async function main() {
  await mkdir(outDir, { recursive: true });

  // any-purpose icons (logo edge-to-edge, matching favicon look)
  await render(buildIconSvg(192, 1.0), 192, path.join(outDir, "icon-192.png"));
  await render(buildIconSvg(512, 1.0), 512, path.join(outDir, "icon-512.png"));

  // maskable: logo at 60% so it sits inside the 80% safe zone
  await render(
    buildIconSvg(512, 0.6),
    512,
    path.join(outDir, "icon-maskable-512.png"),
  );

  // apple touch icon (180x180, opaque bg, logo edge-to-edge)
  await render(
    buildIconSvg(180, 1.0),
    180,
    path.join(outDir, "apple-touch-icon.png"),
  );

  console.log("PWA icons generated in public/icons/:");
  for (const f of [
    "icon-192.png",
    "icon-512.png",
    "icon-maskable-512.png",
    "apple-touch-icon.png",
  ]) {
    const stat = await readFile(path.join(outDir, f));
    console.log(`  ${f}  (${stat.byteLength} bytes)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
