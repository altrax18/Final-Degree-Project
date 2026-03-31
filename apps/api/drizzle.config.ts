import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

// https://orm.drizzle.team/docs/connect-neon
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
