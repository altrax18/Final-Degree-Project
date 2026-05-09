import { db } from "../../db/client";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

type User = InferSelectModel<typeof users>;

export async function updateUser(id: number, userData: Partial<Omit<User, "id" | "date">>) {
  const [updatedUser] = await db
    .update(users)
    .set(userData)
    .where(eq(users.id, id))
    .returning();
  return updatedUser;
}
