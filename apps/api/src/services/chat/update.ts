import { db } from "../../db/client";
import { chatMembers } from "../../db/schema";
import { eq, and } from "drizzle-orm";

export async function markConversationRead(conversationId: number, userId: number) {
  await db
    .update(chatMembers)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(chatMembers.conversationId, conversationId),
        eq(chatMembers.userId, userId),
      ),
    );
}
