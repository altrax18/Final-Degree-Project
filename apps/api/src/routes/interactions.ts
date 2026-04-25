import { Elysia } from "elysia";
import { db } from "../db/client";
import { interactions } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const interactionsRoutes = new Elysia({ prefix: "/interactions" })
  .get("/:userId", async ({ params }) => {
    return await db.select().from(interactions).where(eq(interactions.userId, Number(params.userId)));
  })
  .post("/", async ({ body }) => {
    const { userId, itemId, action, score } = body as {
      userId: number;
      itemId: number;
      action: "like" | "dislike" | "rating" | "watchlist" | "played" | "listened";
      score?: number;
    };
    const [interaction] = await db
      .insert(interactions)
      .values({ userId, itemId, action, score })
      .returning();
    return interaction;
  })
  .delete("/:userId/:itemId", async ({ params }) => {
    await db
      .delete(interactions)
      .where(
        and(
          eq(interactions.userId, Number(params.userId)),
          eq(interactions.itemId, Number(params.itemId))
        )
      );
    return { success: true };
  });
