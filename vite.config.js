import { resolve } from "path";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

const name = "telechecs";

export default defineConfig(({ command }) => ({
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "assets"),
  base: "/",
  build: {
    outDir: resolve(__dirname, "www"),
    sourcemap: true,
  },
  plugins:
    command === "serve"
      ? [
          // basicSsl(),
          checker({
            typescript: true,
          }),
        ]
      : [],
}));
