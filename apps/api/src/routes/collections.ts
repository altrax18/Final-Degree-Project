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

type CollectionBody = { name: string; type: "movie" | "music" | "game" };
type CollectionItemBody = {
  apiId: string;
  title: string;
  type: "movie" | "music" | "game";
  metadata?: Record<string, unknown>;
};

export const collectionsRoutes = new Elysia({ prefix: "/users/:userId" })
  // Collections
  .get("/collections", async ({ params }) => {
    return getCollectionsByUserId(Number(params.userId));
  })
  .post("/collections", async ({ params, body }) => {
    return createCollection(Number(params.userId), body as CollectionBody);
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
    return addItemToCollection(Number(params.collectionId), body as CollectionItemBody);
  })
  .get("/collections/:collectionId/items/:itemId", async ({ params }) => {
    const item = await getCollectionItemById(Number(params.collectionId), Number(params.itemId));
    if (!item) return new Response("Not found", { status: 404 });
    return item;
  })
  .delete("/collections/:collectionId/items/:itemId", async ({ params }) => {
    const item = await removeItemFromCollection(Number(params.collectionId), Number(params.itemId));
    if (!item) return new Response("Not found", { status: 404 });
    return item;
  });
