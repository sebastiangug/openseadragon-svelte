import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
export default {
  kit: {
    adapter: adapter(),
  },
  optimizeDeps: {
    exclude: ["openseadragon.js", "openseadragon"],
  },
  preprocess: [vitePreprocess()],
};
