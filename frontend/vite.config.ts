import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 3000,
    watch: {
      // Docker Desktop on Windows doesn't reliably forward inotify events for
      // host bind-mounts into the Linux container, so plain fs watching misses
      // edits made from the host. Polling guarantees changes are picked up.
      usePolling: true,
      interval: 300,
    },
  },
});
