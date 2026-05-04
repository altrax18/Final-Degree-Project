import { Elysia } from "elysia";
import { getRecommendedUsers } from "../services/recommendations";

export const recommendationsRoutes = new Elysia({ prefix: "/recommendations" })
  .get("/:userId/friends", async ({ params }) => {
    return await getRecommendedUsers(params.userId);
  });
