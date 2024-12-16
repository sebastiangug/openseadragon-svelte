import { sveltekit } from "@sveltejs/kit/vite";
// @ts-ignore
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";

export default {
  plugins: [sveltekit()],
  optimizeDeps: {
    exclude: ["openseadragon.js", "openseadragon"],
  },
  server: {
    port: 3000,
  },
};
