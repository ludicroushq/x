import { defineConfig } from "tsup";

export const tsupConfig = defineConfig({
  entry: ["src", "!src/**/__tests__/**/*"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: "dist",
});
