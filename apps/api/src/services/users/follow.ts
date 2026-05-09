import { db } from "../../db/client";
import { follows, users } from "../../db/schema";
import { eq, and } from "drizzle-orm";

export async function followUser(followerId: number, followingId: number) {
  if (followerId === followingId) {
    throw new Error("No puedes seguirte a ti mismo");
  }
  await db
    .insert(follows)
    .values({ followerId, followingId })
    .onConflictDoNothing();
}

export async function unfollowUser(followerId: number, followingId: number) {
  await db
    .delete(follows)
    .where(
      and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      )
    );
}

export async function isFollowing(followerId: number, followingId: number): Promise<boolean> {
  const [row] = await db
    .select()
    .from(follows)
    .where(
      and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      )
    );
  return !!row;
}

export async function getFollowing(followerId: number) {
  return db
    .select({
      id: users.id,
      username: users.username,
      profileImageUrl: users.profileImageUrl,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followingId, users.id))
    .where(eq(follows.followerId, followerId));
}

export async function getFollowers(followingId: number) {
  return db
    .select({
      id: users.id,
      username: users.username,
      profileImageUrl: users.profileImageUrl,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followingId, followingId));
}

