import { Elysia } from "elysia";
import { getRecommendedItems, getRecommendedFriends } from "../services/recommendations";

export const recommendationsRoutes = new Elysia({ prefix: "/recommendations" })
  .get("/:userId", async ({ params }) => {
    return await getRecommendedItems(params.userId);
  })
  .get("/:userId/friends", async ({ params }) => {
    return await getRecommendedFriends(params.userId);
  });
