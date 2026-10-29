import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Ai_mystery_Game/",
  plugins: [react()],
  server: { port: 5173 },
});
