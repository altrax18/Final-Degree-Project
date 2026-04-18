import { Elysia } from "elysia";
import { db } from "../db/client";
import { items } from "../db/schema";
import { eq } from "drizzle-orm";

export const itemsRoutes = new Elysia({ prefix: "/items" })
  .get("/", async () => {
    return await db.select().from(items);
  })
  .get("/:id", async ({ params }) => {
    const [item] = await db.select().from(items).where(eq(items.id, params.id));
    if (!item) return new Response("Not found", { status: 404 });
    return item;
  })
  .post("/", async ({ body }) => {
    const { title, type, metadata, externalId } = body as {
      title: string;
      type: "movie" | "music" | "game";
      metadata?: Record<string, unknown>;
      externalId?: string;
    };
    const [item] = await db.insert(items).values({ title, type, metadata, externalId }).returning();
    return item;
  });
