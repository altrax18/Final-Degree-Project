import { db } from "../../../db/client";
import { userCollections } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export async function deleteCollection(userId: number, collectionId: number) {
  const [deleted] = await db
    .delete(userCollections)
    .where(and(eq(userCollections.id, collectionId), eq(userCollections.userId, userId)))
    .returning();
  return deleted;
}
