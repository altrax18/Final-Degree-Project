import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const COHERE_API_URL = "https://api.cohere.com/v2/embed";
const COHERE_MODEL = "embed-multilingual-light-v3.0";
// Cohere free tier allows up to 96 texts per request
const COHERE_BATCH_SIZE = 96;

type ItemRef = { apiId: string; title: string; type: "movie" | "music" | "game" };

// ---------------------------------------------------------------------------
// Cohere helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Math helper
// ---------------------------------------------------------------------------

function averageEmbeddings(embeddings: number[][]): number[] {
  const dim = embeddings[0].length;
  const sum = new Array<number>(dim).fill(0);
  for (const emb of embeddings) {
    for (let i = 0; i < dim; i++) sum[i] += emb[i];
  }
  return sum.map((v) => v / embeddings.length);
}

// ---------------------------------------------------------------------------
// item_embeddings — persistent store, primary source for profile embeddings
// ---------------------------------------------------------------------------

/**
 * Resolves embeddings for a list of items. Reads from item_embeddings first;
 * calls Cohere only for items that have no stored embedding yet, then persists them.
 * Returns a map keyed by `"${apiId}:${type}"`.
 */
async function getOrGenerateItemEmbeddings(
  items: ItemRef[]
): Promise<Map<string, number[]>> {
  const result = new Map<string, number[]>();
  if (items.length === 0) return result;

  // 1. Fetch already-stored embeddings
  const apiIds = items.map((i) => i.apiId);
  const types = items.map((i) => i.type);

  const stored = await sql`
    SELECT api_id, type, embedding
    FROM item_embeddings
    WHERE (api_id, type) IN (SELECT unnest(${apiIds}::text[]), unnest(${types}::text[]))
  ` as { api_id: string; type: string; embedding: number[] }[];

  for (const row of stored) {
    result.set(`${row.api_id}:${row.type}`, row.embedding);
  }

  // 2. Determine which items still need a Cohere call
  const missing = items.filter((i) => !result.has(`${i.apiId}:${i.type}`));
  if (missing.length === 0) return result;

  // 3. Call Cohere in batches for missing items
  const newEmbeddings: number[][] = [];
  for (let i = 0; i < missing.length; i += COHERE_BATCH_SIZE) {
    const batch = missing.slice(i, i + COHERE_BATCH_SIZE);
    const batchEmbeddings = await generateEmbeddingsBatch(batch.map((it) => it.title));
    newEmbeddings.push(...batchEmbeddings);
  }

  // 4. Persist new embeddings and populate result map
  for (let i = 0; i < missing.length; i++) {
    const { apiId, type } = missing[i];
    const vectorLiteral = `[${newEmbeddings[i].join(",")}]`;
    await sql`
      INSERT INTO item_embeddings (api_id, type, embedding)
      VALUES (${apiId}, ${type}, ${vectorLiteral}::vector)
      ON CONFLICT (api_id, type) DO NOTHING
    `;
    result.set(`${apiId}:${type}`, newEmbeddings[i]);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function updateUserEmbedding(userId: number): Promise<void> {
  const rows = await sql`
    SELECT ci.api_id, ci.title, ci.type
    FROM collection_items ci
    JOIN user_collections uc ON uc.id = ci.collection_id
    WHERE uc.user_id = ${userId}
  ` as ItemRef[];

  if (rows.length === 0) return;

  const embeddingMap = await getOrGenerateItemEmbeddings(rows);
  const embeddings = rows
    .map((r) => embeddingMap.get(`${r.apiId}:${r.type}`))
    .filter((e): e is number[] => e !== undefined);

  if (embeddings.length === 0) return;

  const avg = averageEmbeddings(embeddings);
  const vectorLiteral = `[${avg.join(",")}]`;

  await sql`
    INSERT INTO user_embeddings (user_id, embedding, updated_at)
    VALUES (${userId}, ${vectorLiteral}::vector, now())
    ON CONFLICT (user_id) DO UPDATE
    SET embedding = EXCLUDED.embedding,
        updated_at = now()
  `;
}

export async function rebuildAllUserEmbeddings(): Promise<{ updated: number; skipped: number }> {
  // 1. Fetch all (user_id, api_id, title, type) for users with at least one item
  const rows = await sql`
    SELECT uc.user_id, ci.api_id, ci.title, ci.type
    FROM collection_items ci
    JOIN user_collections uc ON uc.id = ci.collection_id
  ` as { user_id: number; api_id: string; title: string; type: "movie" | "music" | "game" }[];

  if (rows.length === 0) return { updated: 0, skipped: 0 };

  // 2. Collect the distinct items across all users and resolve their embeddings
  const distinctItems = Array.from(
    new Map(rows.map((r) => [`${r.api_id}:${r.type}`, { apiId: r.api_id, title: r.title, type: r.type }])).values()
  );
  const embeddingMap = await getOrGenerateItemEmbeddings(distinctItems);

  // 3. Group items by user and compute per-user average embedding
  const byUser = new Map<number, ItemRef[]>();
  for (const r of rows) {
    const list = byUser.get(r.user_id) ?? [];
    list.push({ apiId: r.api_id, title: r.title, type: r.type });
    byUser.set(r.user_id, list);
  }

  let updated = 0;
  for (const [userId, items] of byUser) {
    const embeddings = items
      .map((it) => embeddingMap.get(`${it.apiId}:${it.type}`))
      .filter((e): e is number[] => e !== undefined);

    if (embeddings.length === 0) continue;

    const avg = averageEmbeddings(embeddings);
    const vectorLiteral = `[${avg.join(",")}]`;

    await sql`
      INSERT INTO user_embeddings (user_id, embedding, updated_at)
      VALUES (${userId}, ${vectorLiteral}::vector, now())
      ON CONFLICT (user_id) DO UPDATE
      SET embedding = EXCLUDED.embedding,
          updated_at = now()
    `;
    updated++;
  }

  return { updated, skipped: 0 };
}