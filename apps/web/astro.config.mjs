import paraglideConfig from "./paraglide.config.mjs";
import node from "@astrojs/node";
import svelte from "@astrojs/svelte";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [
    svelte(),
    {
      name: "separate-vite-caches",
      hooks: {
        "astro:config:setup": ({ command, updateConfig }) => {
          updateConfig({ vite: { cacheDir: `node_modules/.vite-${command}` } });
        },
      },
    },
  ],
  server: { port: 4321 },
  vite: {
    envDir: "../../",
    plugins: [tailwindcss(), paraglideVitePlugin(paraglideConfig)],
  },
});
