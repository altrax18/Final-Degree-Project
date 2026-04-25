import { findSimilarItems, findSimilarUsers } from "./similarity";

export async function getRecommendedItems(userId: string, limit = 20) {
  return await findSimilarItems(userId, limit);
}

export async function getRecommendedFriends(userId: string, limit = 10) {
  return await findSimilarUsers(userId, limit);
}
