import { db } from "../../db/client";
import { users } from "../../db/schema";
import type { InferInsertModel } from "drizzle-orm";

type NewUser = InferInsertModel<typeof users>;

export async function createUser(userData: Omit<NewUser, "id" | "date">) {
  const [user] = await db
    .insert(users)
    .values(userData)
    .returning();
  return user;
}
