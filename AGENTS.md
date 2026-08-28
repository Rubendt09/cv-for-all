# AGENTS.md - cv-for-all

## Project Overview
Free, frontend-only CV generator from YAML using Typst/WASM for PDF generation.
Inspired by RenderCV. All processing happens in-browser — no server, full privacy.

## Tech Stack
- Vite + React + TypeScript
- Tailwind CSS for styling
- Zod for YAML schema validation
- js-yaml for YAML parsing
- Monaco Editor for the YAML editor
- @myriaddreamin/typst.ts (WASM) for client-side Typst → PDF compilation
- Zustand for state management
- Vitest for testing

## Commands
```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run tests (Vitest)
npm run test:watch   # Watch mode tests
npm run lint         # ESLint
npm run format       # Prettier format
npm run typecheck    # TypeScript type checking (tsc --noEmit)
```

## Architecture
```
src/
  types/cv.ts              # TypeScript data models (RenderCV-compatible)
  yaml/
    schema.ts              # Zod schema (ported from RenderCV Pydantic models)
    parser.ts              # YAML → validate → RenderCVModel pipeline
    entry-detection.ts     # Automatic entry type detection from fields
  typst/
    markdown-to-typst.ts   # Markdown → Typst markup converter
    string-utils.ts        # String utilities (escape, clean_url, etc.)
    model-processor.ts     # Process CV model for template rendering
    compiler.ts            # Typst WASM compiler wrapper
  templates/
    preamble.ts            # Typst preamble generator
    header.ts              # Header generator (name, connections, photo)
    entries.ts             # Entry generators (per entry type)
    section.ts             # Section generator
    generator.ts           # Full Typst document orchestrator
  pdf/
    generator.ts           # Full pipeline: YAML → Typst → PDF
  utils/
    keywordDatabase.ts     # Curated tech keyword database for Job Matcher
    jobMatcher.ts          # Job description ↔ CV compatibility matching
  store/
    cvStore.ts             # Zustand global store
  components/
    Header/                # App header (logo, template selector, downloads)
    Editor/                # YAML editor + error panel
    Preview/               # PDF preview (pdf.js canvas renderer)
    TemplateSelector/      # Theme dropdown
    JobMatcher/            # Job description matcher panel + results
  examples/
    example-cv.yaml        # Example CV
```

## Key Patterns
- **Zod 4.x with `withEmptyDefaults()` helper**: Zod 4's `.default({})` does NOT
  re-parse the default value, so inner field defaults are lost. Use
  `withEmptyDefaults(schema)` (which uses `z.preprocess`) to ensure inner
  defaults are applied when the field is missing.
- **Entry type detection**: Entry types are inferred from fields, not declared.
  Each type has "characteristic fields" unique to it.
- **Path aliases**: `@/` maps to `src/` (configured in tsconfig.json and vite.config.ts).

## Testing
Tests are in `tests/` and mirror the source structure:
- `tests/yaml/` — parser and entry detection tests
- `tests/typst/` — markdown-to-typst conversion tests
- `tests/templates/` — Typst source generation tests
- `tests/utils/` — job matcher and utility tests
- `tests/sanity.test.ts` — basic sanity checks

## RenderCV Compatibility
The YAML format is fully compatible with RenderCV (https://rendercv.com).
9 entry types, 9 themes, locale support, and the @preview/rendercv Typst package
are all supported.
