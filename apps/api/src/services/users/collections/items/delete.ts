import { db } from "../../../../db/client";
import { collectionItems } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";

export async function removeItemFromCollection(collectionId: number, itemId: number) {
  const [deleted] = await db
    .delete(collectionItems)
    .where(and(eq(collectionItems.id, itemId), eq(collectionItems.collectionId, collectionId)))
    .returning();
  return deleted;
}
