import { sveltekit } from "@sveltejs/kit/vite";

export default {
  plugins: [sveltekit()],
  optimizeDeps: {
    exclude: ["vips-es6.js", "wasm-vips"],
  },
  server: {
    port: 3000,
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
};
