import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/infographic/",   // repo name, with slashes
  plugins: [react()],
});

