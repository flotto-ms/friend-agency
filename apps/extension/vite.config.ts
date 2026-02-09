import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "Extension",
      fileName: "background",
      formats: ["es"], // Use 'es' for modern ESM-only packages
    },
  },
});
