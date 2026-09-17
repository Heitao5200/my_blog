import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "../../docs/组队学习/2026-09hello-agents进阶/学习测评",
    emptyOutDir: true,
  },
});
