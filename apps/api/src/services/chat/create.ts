import { db } from "../../db/client";
import { conversations, messages, chatMembers, users } from "../../db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function createConversation(
  type: "direct" | "group",
  memberIds: number[],
  name?: string,
) {
  // For direct chats, return the existing conversation if one already exists
  // between the two users to prevent duplicates.
  if (type === "direct" && memberIds.length === 2) {
    const [a, b] = memberIds;
    const existing = await db
      .select({ conversationId: chatMembers.conversationId })
      .from(chatMembers)
      .where(eq(chatMembers.userId, a))
      .then((rows) => rows.map((r) => r.conversationId));

    if (existing.length > 0) {
      const shared = await db
        .select({ conversationId: chatMembers.conversationId })
        .from(chatMembers)
        .innerJoin(conversations, eq(conversations.id, chatMembers.conversationId))
        .where(
          and(
            eq(chatMembers.userId, b),
            inArray(chatMembers.conversationId, existing),
            eq(conversations.type, "direct"),
          ),
        )
        .limit(1);

      if (shared.length > 0) {
        const [found] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, shared[0].conversationId));
        return found;
      }
    }
  }

  const [conv] = await db
    .insert(conversations)
    .values({ type, name: name ?? null })
    .returning();

  await db.insert(chatMembers).values(
    memberIds.map((id) => ({ conversationId: conv.id, userId: id })),
  );

  return conv;
}

export async function createMessage(
  conversationId: number,
  senderId: number,
  content: string,
) {
  const [saved] = await db
    .insert(messages)
    .values({ conversationId, senderId, content, type: "text" })
    .returning();

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  const [sender] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, senderId));

  return {
    id: saved.id,
    conversationId: saved.conversationId,
    senderId: saved.senderId,
    senderUsername: sender?.username ?? "Unknown",
    content: saved.content,
    type: saved.type,
    createdAt: saved.createdAt,
  };
}
