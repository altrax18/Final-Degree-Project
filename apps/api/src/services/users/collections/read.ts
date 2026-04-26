import { db } from "../../../db/client";
import { userCollections } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export async function getCollectionsByUserId(userId: number) {
  return await db
    .select()
    .from(userCollections)
    .where(eq(userCollections.userId, userId));
}

export async function getCollectionById(userId: number, collectionId: number) {
  const [collection] = await db
    .select()
    .from(userCollections)
    .where(and(eq(userCollections.id, collectionId), eq(userCollections.userId, userId)));
  return collection;
}
