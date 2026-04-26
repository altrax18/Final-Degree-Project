import { db } from "../../../../db/client";
import { collectionItems } from "../../../../db/schema";
import type { InferInsertModel } from "drizzle-orm";

type NewCollectionItem = InferInsertModel<typeof collectionItems>;

export async function addItemToCollection(
  collectionId: number,
  data: Omit<NewCollectionItem, "id" | "collectionId" | "createdAt">
) {
  const [item] = await db
    .insert(collectionItems)
    .values({ ...data, collectionId })
    .returning();
  return item;
}
