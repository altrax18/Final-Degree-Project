import { findSimilarUsers } from "./similarity";

export async function getRecommendedUsers(userId: string, limit = 10) {
  return await findSimilarUsers(userId, limit);
}
