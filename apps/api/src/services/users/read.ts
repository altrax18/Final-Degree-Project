import { db } from "../../db/client";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export async function getUserById(id: number) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id));
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  return user;
}
