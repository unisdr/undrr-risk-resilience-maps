import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: "/",
  server: { port: 3001 },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
  test: { environment: "jsdom" },
});
