import type { Config } from "drizzle-kit";

// We need to make sure the in the tsconfig.json file, we need to change the target at least to 'ES6'
export default {
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
