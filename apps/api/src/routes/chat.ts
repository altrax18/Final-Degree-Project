import { Elysia, t } from "elysia";
import { db } from "../db/client";
import { conversations, messages, chatMembers, users } from "../db/schema";
import { eq, inArray, desc, and } from "drizzle-orm";

export const chatRoutes = new Elysia({ prefix: "/chat" })
  .get("/conversations/:userId", async ({ params }) => {
    const userId = Number(params.userId);

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
  })

  .post("/conversations", async ({ body }) => {
    const { type, name, memberIds } = body as {
      type: "direct" | "group";
      name?: string;
      memberIds: number[];
    };

    const [conv] = await db
      .insert(conversations)
      .values({ type, name: name ?? null })
      .returning();

    await db.insert(chatMembers).values(
      memberIds.map((id) => ({ conversationId: conv.id, userId: id }))
    );

    return conv;
  })

  .get("/messages/:conversationId", async ({ params }) => {
    const conversationId = Number(params.conversationId);

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
  })

  .ws("/ws", {
    query: t.Object({
      userId: t.String(),
    }),
    open(ws) {
      console.log(`User ${ws.data.query.userId} connected to chat`);
    },
    async message(ws, raw) {
      const userId = Number(ws.data.query.userId);
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;

      if (data.type === "subscribe") {
        ws.subscribe(`conversation:${data.conversationId}`);
        ws.send(JSON.stringify({ type: "subscribed", conversationId: data.conversationId }));
      }

      if (data.type === "send_message") {
        const [saved] = await db
          .insert(messages)
          .values({
            conversationId: data.conversationId,
            senderId: userId,
            content: data.content,
            type: "text",
          })
          .returning();

        await db
          .update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, data.conversationId));

        const [sender] = await db
          .select({ username: users.username })
          .from(users)
          .where(eq(users.id, userId));

        const payload = JSON.stringify({
          type: "new_message",
          message: {
            id: saved.id,
            conversationId: saved.conversationId,
            senderId: saved.senderId,
            senderUsername: sender?.username ?? "Unknown",
            content: saved.content,
            type: saved.type,
            createdAt: saved.createdAt,
          },
        });

        ws.publish(`conversation:${data.conversationId}`, payload);
        ws.send(payload);
      }

      if (data.type === "mark_read") {
        await db
          .update(chatMembers)
          .set({ lastReadAt: new Date() })
          .where(
            and(
              eq(chatMembers.conversationId, data.conversationId),
              eq(chatMembers.userId, userId),
            )
          );
      }
    },
    close(ws) {
      console.log(`User ${ws.data.query.userId} disconnected`);
    },
  });
