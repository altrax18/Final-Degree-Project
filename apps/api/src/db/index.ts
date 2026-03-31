import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// https://orm.drizzle.team/docs/connect-neon
// https://orm.drizzle.team/docs/get-started-postgresql
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);
