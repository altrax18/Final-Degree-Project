import { Elysia, t } from "elysia";
import { db } from "../db/client";
import { reviews, users } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";

export const reviewsRoutes = new Elysia({ prefix: "/api/reviews" })
  // GET reviews por id
  .get("/:itemType/:itemApiId", async ({ params }) => {
    const { itemType, itemApiId } = params;

    const itemReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        content: reviews.content,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(
        and(
          eq(reviews.itemType, itemType),
          eq(reviews.itemApiId, itemApiId)
        )
      )
      .orderBy(desc(reviews.createdAt));

    return itemReviews;
  })
  // POST nueva review
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const [newReview] = await db
          .insert(reviews)
          .values({
            userId: body.userId,
            itemType: body.itemType,
            itemApiId: body.itemApiId,
            rating: body.rating,
            content: body.content,
          })
          .returning();

        return newReview;
      } catch (error) {
        set.status = 500;
        return { error: "Failed to create review" };
      }
    },
    {
      body: t.Object({
        userId: t.Number(),
        itemType: t.String(),
        itemApiId: t.String(),
        rating: t.Number(),
        content: t.String(),
      }),
    }
  )
  // DELETE review por id
  .delete("/:id", async ({ params, set }) => {
    try {
      const reviewId = parseInt(params.id);
      await db.delete(reviews).where(eq(reviews.id, reviewId));
      return { success: true };
    } catch (error) {
      set.status = 500;
      return { error: "Failed to delete review" };
    }
  });
