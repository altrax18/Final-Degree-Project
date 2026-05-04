import { db } from "../../db/client";
import { users } from "../../db/schema";
import { eq, ilike, ne, and } from "drizzle-orm";

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

export async function searchUsersByUsername(q: string, excludeId?: number) {
  const condition = excludeId
    ? and(ilike(users.username, `%${q}%`), ne(users.id, excludeId))
    : ilike(users.username, `%${q}%`);

  return db
    .select({ id: users.id, username: users.username, profileImageUrl: users.profileImageUrl })
    .from(users)
    .where(condition)
    .limit(10);
}
