// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), icon()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "onnxruntime-node": "./src/mocks/onnx-mock.js",
      },
    },
  },
  output: "server",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    imagesConfig: {
      sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      domains: [],
    }
  }),
});
