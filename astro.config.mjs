import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import compress from "astro-compress";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://asierortiz.com",
  trailingSlash: "always",
  integrations: [
    sitemap(),
    icon(),
    mdx(),
    tailwind(),
    sitemap(),
    compress()
  ],
  server: {
    port: 3000
  }
});
