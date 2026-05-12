import { Elysia } from "elysia";
import {
  createCollection,
  getCollectionsByUserId,
  getCollectionById,
  deleteCollection,
} from "../services/users/collections";
import {
  addItemToCollection,
  getItemsByCollectionId,
  getCollectionItemById,
  removeItemFromCollection,
} from "../services/users/collections/items";
import { updateUserEmbedding } from "../services/embeddings";

type CollectionBody = { name: string; type: "movie" | "music" | "game" };
type CollectionItemBody = {
  apiId: string;
  title: string;
  type: "movie" | "music" | "game";
  metadata?: Record<string, unknown>;
};

export const collectionsRoutes = new Elysia({ prefix: "/api/users/:userId" })
  // Collections
  .get("/collections", async ({ params }) => {
    return getCollectionsByUserId(Number(params.userId));
  })
  .post("/collections", async ({ params, body, set }) => {
    try {
      return await createCollection(Number(params.userId), body as CollectionBody);
    } catch (err: any) {
      console.error("Error al crear colección:", err);
      set.status = 500;
      return { error: err.message || "Internal Server Error" };
    }
  })
  .get("/collections/:collectionId", async ({ params }) => {
    const collection = await getCollectionById(Number(params.userId), Number(params.collectionId));
    if (!collection) return new Response("Not found", { status: 404 });
    return collection;
  })
  .delete("/collections/:collectionId", async ({ params }) => {
    const collection = await deleteCollection(Number(params.userId), Number(params.collectionId));
    if (!collection) return new Response("Not found", { status: 404 });
    return collection;
  })
  // Collection items
  .get("/collections/:collectionId/items", async ({ params }) => {
    return getItemsByCollectionId(Number(params.collectionId));
  })
  .post("/collections/:collectionId/items", async ({ params, body }) => {
    const item = await addItemToCollection(Number(params.collectionId), body as CollectionItemBody);
    updateUserEmbedding(Number(params.userId)).catch((err) =>
      console.error("[embeddings] Failed to update embedding for user", params.userId, err)
    );
    return item;
  })
  .get("/collections/:collectionId/items/:itemId", async ({ params }) => {
    const item = await getCollectionItemById(Number(params.collectionId), Number(params.itemId));
    if (!item) return new Response("Not found", { status: 404 });
    return item;
  })
  .delete("/collections/:collectionId/items/:itemId", async ({ params }) => {
    const item = await removeItemFromCollection(Number(params.collectionId), Number(params.itemId));
    if (!item) return new Response("Not found", { status: 404 });
    updateUserEmbedding(Number(params.userId)).catch((err) =>
      console.error("[embeddings] Failed to update embedding for user", params.userId, err)
    );
    return item;
  });
