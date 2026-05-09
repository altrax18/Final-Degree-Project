import { db } from "../../db/client";
import { conversations, messages, chatMembers, users } from "../../db/schema";
import { eq, inArray, desc, asc, and, sql, gt, ne } from "drizzle-orm";

export async function getConversationsByUserId(userId: number) {
  const userConvs = await db
    .select({ conversationId: chatMembers.conversationId })
    .from(chatMembers)
    .where(eq(chatMembers.userId, userId));

  const convIds = userConvs.map((c) => c.conversationId);
  if (convIds.length === 0) return [];

  const rows = await db
    .select({
      convId: conversations.id,
      convType: conversations.type,
      convName: conversations.name,
      convUpdatedAt: conversations.updatedAt,
      memberId: users.id,
      memberUsername: users.username,
      memberImage: users.profileImageUrl,
      unreadCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM messages m
        INNER JOIN chat_members cm
          ON cm.conversation_id = m.conversation_id AND cm.user_id = ${userId}
        WHERE m.conversation_id = ${conversations.id}
          AND m.sender_id != ${userId}
          AND m.deleted_at IS NULL
          AND (m.created_at > cm.last_read_at OR cm.last_read_at IS NULL)
      )`,
    })
    .from(conversations)
    .innerJoin(chatMembers, eq(conversations.id, chatMembers.conversationId))
    .innerJoin(users, eq(chatMembers.userId, users.id))
    .where(inArray(conversations.id, convIds));

  const grouped = new Map<
    number,
    {
      id: number;
      type: string;
      name: string | null;
      updatedAt: Date | null;
      unreadCount: number;
      members: { id: number; username: string; profileImageUrl: string }[];
    }
  >();

  for (const row of rows) {
    if (!grouped.has(row.convId)) {
      grouped.set(row.convId, {
        id: row.convId,
        type: row.convType,
        name: row.convName,
        updatedAt: row.convUpdatedAt,
        unreadCount: row.unreadCount,
        members: [],
      });
    }
    grouped.get(row.convId)!.members.push({
      id: row.memberId,
      username: row.memberUsername,
      profileImageUrl: row.memberImage,
    });
  }

  return Array.from(grouped.values());
}

export async function getMessagesByConversationId(conversationId: number) {
  const msgs = await db
    .select({
      id: messages.id,
      conversationId: messages.conversationId,
      senderId: messages.senderId,
      content: messages.content,
      type: messages.type,
      createdAt: messages.createdAt,
      senderUsername: users.username,
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(50);

  return msgs.reverse();
}

export async function getUserConversationIds(userId: number) {
  const rows = await db
    .select({ conversationId: chatMembers.conversationId })
    .from(chatMembers)
    .where(eq(chatMembers.userId, userId));
  return rows.map((r) => r.conversationId);
}

export async function getNewMessagesSince(
  userId: number,
  convIds: number[],
  lastSeenId: number,
) {
  return db
    .select({
      id: messages.id,
      conversationId: messages.conversationId,
      senderId: messages.senderId,
      content: messages.content,
      type: messages.type,
      createdAt: messages.createdAt,
      senderUsername: users.username,
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(
      and(
        inArray(messages.conversationId, convIds),
        gt(messages.id, lastSeenId),
        ne(messages.senderId, userId),
      ),
    )
    .orderBy(asc(messages.id));
}
