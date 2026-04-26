import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function generateEmbedding(text: string): Promise<number[]> {
  // TODO: Embeddings API integration (all-MiniLM-L6-v2)
  throw new Error("Embedding service not configured yet");
}

export async function storeItemEmbedding(itemId: string, embedding: number[]): Promise<void> {
  await sql`UPDATE items SET embedding = ${JSON.stringify(embedding)}::vector WHERE id = ${itemId}`;
}

export async function updateUserEmbedding(userId: string): Promise<void> {
  await sql`
    UPDATE user_embeddings
    SET embedding = (
      SELECT AVG(i.embedding)
      FROM items i
      JOIN interactions ia ON ia.item_id = i.id
      WHERE ia.user_id = ${userId} AND ia.action = 'like'
    ),
    updated_at = now()
    WHERE user_id = ${userId}
  `;
}
