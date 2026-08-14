// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://abraham-r.vercel.app",
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname.replace(/\/$/, "");
        return pathname !== "/game" && !pathname.startsWith("/prototype");
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
