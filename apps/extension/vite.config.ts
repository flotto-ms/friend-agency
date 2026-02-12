import { defineConfig } from "vite";
import { resolve } from "node:path";

const config = {
  background: {
    entry: resolve(__dirname, "./src/background.ts"),
    fileName: "background",
  },
  content: {
    entry: resolve(__dirname, "./src/content.ts"),
    fileName: "content",
  },
};

const lib = (process.env.LIB_NAME ?? "background") as keyof typeof config;
const currentConfig = config[lib];

export default defineConfig({
  resolve: {
    alias: {
      "@flotto/types": resolve(__dirname, "../../packages/types/src/main"),
      "@flotto/utils": resolve(__dirname, "../../packages/utils/src/index"),
    },
  },
  build: {
    lib: {
      ...currentConfig,
      name: "Extension",
      formats: ["es"], // Use 'es' for modern ESM-only packages
    },
    minify: "terser",
    emptyOutDir: false,
  },
});
