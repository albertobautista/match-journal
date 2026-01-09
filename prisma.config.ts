import "dotenv/config";
import { defineConfig } from "prisma/config";

// Provide a fallback URL if DATABASE_URL is not available
// This allows Prisma to generate the client even without a real database during build
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://dummy:dummy@dummy:5432/dummy";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
