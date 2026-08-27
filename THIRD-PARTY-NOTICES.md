# Third-Party Notices

CV for All includes and depends on third-party software. This file records the principal notices for components distributed with or used by the application. Dependency versions are fixed in `package-lock.json`.

## RenderCV

Parts of CV for All are adapted from RenderCV. The audited upstream snapshot is:

- Repository: https://github.com/rendercv/rendercv
- Commit: `1d4b87bc427e4cf61c0ef49623c971b0e2224708`
- Description at audit time: `v2.8-52-g1d4b87bc`
- License: MIT

The adapted areas include:

- `src/types/cv.ts`
- `src/yaml/schema.ts`
- `src/yaml/theme-defaults.ts`
- `src/yaml/entry-detection.ts`
- parts of `src/yaml/parser.ts`
- parts of `src/typst/markdown-to-typst.ts`
- parts of `src/typst/string-utils.ts`
- `src/typst/model-processor.ts`
- `src/templates/preamble.ts`
- `src/templates/header.ts`
- `src/templates/entries.ts`
- `src/templates/section.ts`
- `src/templates/generator.ts`

RenderCV's original notice and license follow.

```text
MIT License

Copyright (c) 2023 to present Sina Atalay and individual contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

CV for All is an independent project. It is not affiliated with, endorsed by, or sponsored by RenderCV or its maintainers.

## RenderCV Typst package

Generated Typst source imports `@preview/rendercv:0.3.0`. The package is part of the RenderCV ecosystem and is distributed under the MIT License. Its upstream source and license are available at https://github.com/rendercv/rendercv.

## Font Awesome Free 6.7.2

The SVG icons in `src/icons/` are from Font Awesome Free 6.7.2.

- Creator: Fonticons, Inc.
- Source: https://fontawesome.com
- License information: https://fontawesome.com/license/free
- Icon license: Creative Commons Attribution 4.0 International (CC BY 4.0)
- License text: https://creativecommons.org/licenses/by/4.0/
- Copyright: 2024 Fonticons, Inc.

The SVG source files retain the original Font Awesome notice. CV for All loads the SVGs into the browser and changes their fill color at runtime to match the selected CV design; the icon shapes are otherwise unchanged.

## Typst.ts

CV for All uses `@myriaddreamin/typst.ts` and `@myriaddreamin/typst-ts-web-compiler` version 0.7.0 to compile Typst documents in the browser.

- Copyright: 2023-2025 Myriad-Dreamin
- License: Apache License 2.0
- License text: https://www.apache.org/licenses/LICENSE-2.0

## Direct npm dependencies

The direct runtime dependencies recorded during this audit are:

| Package | Version | License |
|---|---:|---|
| `@monaco-editor/react` | 4.7.0 | MIT |
| `@myriaddreamin/typst-ts-web-compiler` | 0.7.0 | Apache-2.0 |
| `@myriaddreamin/typst.ts` | 0.7.0 | Apache-2.0 |
| `js-yaml` | 5.4.1 | MIT |
| `marked` | 18.0.11 | MIT |
| `monaco-editor` | 0.56.0 | MIT |
| `react` | 19.2.8 | MIT |
| `react-dom` | 19.2.8 | MIT |
| `zod` | 4.4.3 | MIT |
| `zod-to-json-schema` | 3.25.2 | ISC |
| `zustand` | 5.0.15 | MIT |

Transitive and development dependency versions and license metadata are recorded in `package-lock.json`, their installed package metadata, and `docs/dependency-licenses.md`. Those components remain subject to their respective licenses.

## Fonts

CV for All does not redistribute font files. Themes refer to font family names that may be available from Typst or the user's environment:

| Font family | License commonly used by the upstream font |
|---|---|
| Libertinus Serif | SIL Open Font License 1.1 |
| Fontin | exljbris Free Font License Agreement; redistribution requires separate permission |
| New Computer Modern | GUST Font License; some variants use GPL-3.0-or-later with font and distribution exceptions |
| XCharter | SIL Open Font License 1.1 |
| Raleway | SIL Open Font License 1.1 |
| EB Garamond | SIL Open Font License 1.1 |
| Lato | SIL Open Font License 1.1 |
| Ubuntu | Ubuntu Font Licence 1.0 |
| Gentium Book Plus | SIL Open Font License 1.1 |

These entries document references only. If font files are bundled in the future, their exact source versions and license texts must be added here before distribution.
