import { defineConfig } from "vite";
import { builtinModules } from "module";
import path from "path";
// https://vitejs.dev/config
export default defineConfig({
  build: {
    // Your existing build config
    rollupOptions: {
      external: [
        "electron",
        "electron-devtools-installer",
        "better-sqlite3", // Add this line
        ...builtinModules.flatMap((p) => [p, `node:${p}`]),
      ],
    },
  },
  resolve: {
    // Your existing resolve config
  },
  optimizeDeps: {
    include: ["pdfjs-dist/build/pdf", "pdfjs-dist/build/pdf.worker.entry"],
  },
});
