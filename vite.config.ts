import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.svg", "icons/*.png"],
      manifest: {
        name: "CV for all — Free YAML CV Generator",
        short_name: "CV for all",
        description:
          "Create a professional CV from YAML. Free forever. No account. No backend. No data stored.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        background_color: "#15181a",
        theme_color: "#1c1f22",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,svg,png,ico,woff,woff2,wasm,mjs}",
        ],
        // The Typst WASM compiler is ~28MB; Workbox's default 2MB cap would
        // silently skip it, breaking offline compilation. Raise to 30MB so the
        // WASM, the pdf.js worker (~1.2MB) and all fonts get precached.
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: true },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ["@myriaddreamin/typst-ts-web-compiler"],
  },
  assetsInclude: ["**/*.wasm"],
  server: {
    fs: {
      strict: false,
    },
  },
});
