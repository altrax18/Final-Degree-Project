import { db } from "../../../../db/client";
import { collectionItems } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";

export async function getItemsByCollectionId(collectionId: number) {
  return await db
    .select()
    .from(collectionItems)
    .where(eq(collectionItems.collectionId, collectionId));
}

export async function getCollectionItemById(collectionId: number, itemId: number) {
  const [item] = await db
    .select()
    .from(collectionItems)
    .where(and(eq(collectionItems.id, itemId), eq(collectionItems.collectionId, collectionId)));
  return item;
}
