# CV for All

Create and download a professional CV from YAML entirely in your browser.

- Free and open source
- No account or subscription
- No backend
- No CV data sent to a server
- Browser-based PDF generation with Typst/WASM
- Compatible with the RenderCV YAML format

## Independent project

CV for All is an independent browser-based CV generator. It is not affiliated with, endorsed by, or sponsored by RenderCV or its maintainers.

Parts of the implementation are adapted from [RenderCV](https://github.com/rendercv/rendercv), which is distributed under the MIT License. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for the audited upstream commit, adapted areas, license texts, and third-party attributions.

## Development

Requirements:

- Node.js
- npm

```bash
npm install
npm run dev
```

The development server runs on `http://localhost:5173`.

## Verification

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Privacy

CV content is processed and stored locally in the browser. The application does not require an account or a project backend. Hosting providers may still collect standard request metadata according to their own policies.

## Fonts

Themes refer to fonts by family name; font files are not distributed by this repository. Availability depends on Typst and the local runtime. Font references and their known upstream licenses are documented in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

## Attribution

Icons are from [Font Awesome Free 6.7.2](https://fontawesome.com) and are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Copyright 2024 Fonticons, Inc. Icon fill colors are changed at runtime to match the selected CV design.

## License

CV for All is distributed under the MIT License. See [LICENSE](LICENSE).

Third-party components remain subject to their respective licenses. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) and the [dependency license report](docs/dependency-licenses.md).
