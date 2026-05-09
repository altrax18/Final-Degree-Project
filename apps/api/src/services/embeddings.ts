import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const COHERE_API_URL = "https://api.cohere.com/v2/embed";
const COHERE_MODEL = "embed-multilingual-light-v3.0";
// Cohere free tier allows up to 96 texts per request
const COHERE_BATCH_SIZE = 96;

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error("COHERE_API_KEY is not set");

  const response = await fetch(COHERE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: COHERE_MODEL,
      texts: [text],
      input_type: "search_document",
      embedding_types: ["float"],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cohere API error ${response.status}: ${error}`);
  }

  const data = await response.json() as { embeddings: { float: number[][] } };
  return data.embeddings.float[0];
}

async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error("COHERE_API_KEY is not set");

  const response = await fetch(COHERE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: COHERE_MODEL,
      texts,
      input_type: "search_document",
      embedding_types: ["float"],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cohere API error ${response.status}: ${error}`);
  }

  const data = await response.json() as { embeddings: { float: number[][] } };
  return data.embeddings.float;
}

export async function updateUserEmbedding(userId: number): Promise<void> {
  // Construye el embedding del usuario concatenando los títulos de los items
  // guardados en sus colecciones — no depende de la tabla de interacciones.
  const rows = await sql`
    SELECT ci.title
    FROM collection_items ci
    JOIN user_collections uc ON uc.id = ci.collection_id
    WHERE uc.user_id = ${userId}
  `;

  if (rows.length === 0) return;

  const text = (rows as { title: string }[]).map((r) => r.title).join(", ");
  const embedding = await generateEmbedding(text);
  const vectorLiteral = `[${embedding.join(",")}]`;

  await sql`
    INSERT INTO user_embeddings (user_id, embedding, updated_at)
    VALUES (${userId}, ${vectorLiteral}::vector, now())
    ON CONFLICT (user_id) DO UPDATE
    SET embedding = EXCLUDED.embedding,
        updated_at = now()
  `;
}

export async function rebuildAllUserEmbeddings(): Promise<{ updated: number; skipped: number }> {
  // Fetch all users that have at least one collection item
  const rows = await sql`
    SELECT uc.user_id, array_agg(ci.title) AS titles
    FROM collection_items ci
    JOIN user_collections uc ON uc.id = ci.collection_id
    GROUP BY uc.user_id
  ` as { user_id: number; titles: string[] }[];

  if (rows.length === 0) return { updated: 0, skipped: 0 };

  // Build one text per user
  const userIds = rows.map((r) => r.user_id);
  const texts = rows.map((r) => r.titles.join(", "));

  // Call Cohere in batches of COHERE_BATCH_SIZE (1 API call per batch)
  const allEmbeddings: number[][] = [];
  for (let i = 0; i < texts.length; i += COHERE_BATCH_SIZE) {
    const batchTexts = texts.slice(i, i + COHERE_BATCH_SIZE);
    const batchEmbeddings = await generateEmbeddingsBatch(batchTexts);
    allEmbeddings.push(...batchEmbeddings);
  }

  // Upsert each user embedding
  for (let i = 0; i < userIds.length; i++) {
    const vectorLiteral = `[${allEmbeddings[i].join(",")}]`;
    await sql`
      INSERT INTO user_embeddings (user_id, embedding, updated_at)
      VALUES (${userIds[i]}, ${vectorLiteral}::vector, now())
      ON CONFLICT (user_id) DO UPDATE
      SET embedding = EXCLUDED.embedding,
          updated_at = now()
    `;
  }

  return { updated: userIds.length, skipped: 0 };
}