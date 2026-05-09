import { db } from "../../../db/client";
import { userCollections } from "../../../db/schema";
import type { InferInsertModel } from "drizzle-orm";

type NewCollection = InferInsertModel<typeof userCollections>;

export async function createCollection(
  userId: number,
  data: Omit<NewCollection, "id" | "userId" | "createdAt">
) {
  const [collection] = await db
    .insert(userCollections)
    .values({ ...data, userId })
    .returning();
  return collection;
}
