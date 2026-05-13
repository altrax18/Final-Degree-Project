import { Elysia, t } from "elysia";
import {
  getConversationsByUserId,
  getMessagesByConversationId,
  getUserConversationIds,
  getNewMessagesSince,
  createConversation,
  createMessage,
  markConversationRead,
} from "../services/chat";

export const chatRoutes = new Elysia({ prefix: "/api/chat" })
  .get("/conversations/:userId", async ({ params }) => {
    return getConversationsByUserId(Number(params.userId));
  })

  .post("/conversations", async ({ body }) => {
    const { type, name, memberIds } = body as {
      type: "direct" | "group";
      name?: string;
      memberIds: number[];
    };
    return createConversation(type, memberIds, name);
  })

  .get("/messages/:conversationId", async ({ params }) => {
    return getMessagesByConversationId(Number(params.conversationId));
  })

  .post("/messages", async ({ body }) => {
    const { conversationId, senderId, content } = body as {
      conversationId: number;
      senderId: number;
      content: string;
    };
    return createMessage(conversationId, senderId, content);
  })

  .post("/mark-read", async ({ body }) => {
    const { conversationId, userId } = body as {
      conversationId: number;
      userId: number;
    };
    await markConversationRead(conversationId, userId);
    return { ok: true };
  })

  .get(
    "/sse",
    ({ query, request }) => {
      const userId = Number(query.userId);

      // Honour Last-Event-ID sent by EventSource on reconnect, then fall back
      // to the explicit lastId query param so the client never re-receives old messages.
      const lastEventIdHeader = request.headers.get("last-event-id");
      let lastSeenId =
        lastEventIdHeader !== null
          ? Number(lastEventIdHeader)
          : query.lastId !== undefined
            ? Number(query.lastId)
            : 0;

      const encoder = new TextEncoder();
      let cancelled = false;

      const stream = new ReadableStream({
        async start(controller) {
          const send = (data: object, id?: number) => {
            try {
              const idLine = id !== undefined ? `id: ${id}\n` : "";
              controller.enqueue(
                encoder.encode(`${idLine}data: ${JSON.stringify(data)}\n\n`),
              );
            } catch {
              cancelled = true;
            }
          };

          send({ type: "connected" });

          while (!cancelled) {
            await new Promise<void>((r) => setTimeout(r, 2000));
            if (cancelled) break;

            try {
              const convIds = await getUserConversationIds(userId);
              if (convIds.length === 0) continue;

              const newMsgs = await getNewMessagesSince(userId, convIds, lastSeenId);

              for (const msg of newMsgs) {
                lastSeenId = msg.id;
                send({ type: "new_message", message: msg }, msg.id);
              }
            } catch {
            }
          }

          try {
            controller.close();
          } catch {
          }
        },
        cancel() {
          cancelled = true;
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    },
    {
      query: t.Object({
        userId: t.String(),
        lastId: t.Optional(t.String()),
      }),
    },
  );
