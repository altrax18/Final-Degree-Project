import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function findSimilarItems(userId: string, limit = 20) {
  return await sql`
    SELECT i.id, i.title, i.type, i.metadata,
           1 - (i.embedding <=> ue.embedding) AS similarity
    FROM items i, user_embeddings ue
    WHERE ue.user_id = ${userId}
      AND i.id NOT IN (SELECT item_id FROM interactions WHERE user_id = ${userId})
      AND i.embedding IS NOT NULL
    ORDER BY i.embedding <=> ue.embedding
    LIMIT ${limit}
  `;
}

export async function findSimilarUsers(userId: string, limit = 10) {
  return await sql`
    SELECT u.id, u.username,
           1 - (ue1.embedding <=> ue2.embedding) AS similarity
    FROM user_embeddings ue1
    JOIN user_embeddings ue2 ON ue1.user_id != ue2.user_id
    JOIN users u ON u.id = ue2.user_id
    WHERE ue1.user_id = ${userId}
      AND ue2.embedding IS NOT NULL
    ORDER BY ue1.embedding <=> ue2.embedding
    LIMIT ${limit}
  `;
}
