import { db } from "../../db/client";
import { users, messages } from "../../db/schema";
import { eq } from "drizzle-orm";

export async function deleteUser(id: number) {
  // Borrado explícito de los mensajes del usuario para garantizar limpieza absoluta
  await db.delete(messages).where(eq(messages.senderId, id));

  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning();
  return deletedUser;
}
