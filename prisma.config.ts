import "dotenv/config";
import { defineConfig } from "prisma/config";

// DATABASE_URL is read at command time. `prisma generate` does not need it,
// so a missing value is allowed here; migrate commands will fail clearly.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx --conditions=react-server prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
    // Used by `prisma migrate dev` to detect drift. Optional elsewhere.
    ...(process.env.SHADOW_DATABASE_URL ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL } : {}),
  },
});
