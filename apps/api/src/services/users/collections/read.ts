import { db } from "../../../db/client";
import { userCollections } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export async function getCollectionsByUserId(userId: number) {
  return await db.query.userCollections.findMany({
    where: eq(userCollections.userId, userId),
    with: {
      items: true,
    },
  });
}

export async function getCollectionById(userId: number, collectionId: number) {
  return await db.query.userCollections.findFirst({
    where: and(eq(userCollections.id, collectionId), eq(userCollections.userId, userId)),
    with: {
      items: true,
    },
  });
}
