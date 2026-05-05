import { Elysia, t } from "elysia";
import { db } from "../db/client";
import { conversations, messages, chatMembers, users } from "../db/schema";
import { eq, inArray, desc, and, sql, gt, ne } from "drizzle-orm";

export const chatRoutes = new Elysia({ prefix: "/api/chat" })
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

  .post("/messages", async ({ body }) => {
    const { conversationId, senderId, content } = body as {
      conversationId: number;
      senderId: number;
      content: string;
    };

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
  })

  .post("/mark-read", async ({ body }) => {
    const { conversationId, userId } = body as {
      conversationId: number;
      userId: number;
    };

    await db
      .update(chatMembers)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(chatMembers.conversationId, conversationId),
          eq(chatMembers.userId, userId),
        )
      );

    return { ok: true };
  })

  .get("/sse", ({ query }) => {
    const userId = Number(query.userId);
    const encoder = new TextEncoder();
    let cancelled = false;

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch {
            cancelled = true;
          }
        };

        send({ type: "connected" });
        let lastSeenId = 0;

        while (!cancelled) {
          await new Promise<void>((r) => setTimeout(r, 2000));
          if (cancelled) break;

          try {
            const userConvs = await db
              .select({ conversationId: chatMembers.conversationId })
              .from(chatMembers)
              .where(eq(chatMembers.userId, userId));

            const convIds = userConvs.map((c) => c.conversationId);
            if (convIds.length === 0) continue;

            const newMsgs = await db
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
                )
              );

            for (const msg of newMsgs) {
              if (msg.id > lastSeenId) lastSeenId = msg.id;
              send({ type: "new_message", message: msg });
            }
          } catch {
            // Transient DB error – continue on next tick
          }
        }

        try { controller.close(); } catch { /* already closed */ }
      },
      cancel() {
        cancelled = true;
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }, {
    query: t.Object({ userId: t.String() }),
  });
