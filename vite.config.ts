import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  ssr: {
    external: ["firebase-admin"],
  },
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    sentryTanstackStart({
      org: "caique-desenvolvimento",
      project: "subscriptions-manager",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    nitro(),
    viteReact(),
  ],
});

export default config;
