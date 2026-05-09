import { db } from "../../../../db/client";
import { collectionItems } from "../../../../db/schema";
import type { InferInsertModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";

type NewCollectionItem = InferInsertModel<typeof collectionItems>;

export async function addItemToCollection(
  collectionId: number,
  data: Omit<NewCollectionItem, "id" | "collectionId" | "createdAt">
) {
  // Evitar duplicados
  const [existing] = await db
    .select()
    .from(collectionItems)
    .where(
      and(
        eq(collectionItems.collectionId, collectionId),
        eq(collectionItems.apiId, data.apiId)
      )
    );

  if (existing) return existing;

  const [item] = await db
    .insert(collectionItems)
    .values({ ...data, collectionId })
    .returning();
  return item;
}
