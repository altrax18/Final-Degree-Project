import { db } from "../../db/client";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export async function deleteUser(id: number) {
  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning();
  return deletedUser;
}
