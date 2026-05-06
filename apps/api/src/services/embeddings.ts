import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embeddingPipeline: any | null = null;

// CONFIGURACION PARA VERCEL: La importacion de @huggingface/transformers es dinamica
// para evitar que se cargue el runtime ONNX/WASM en el arranque del modulo.
// Esto previene que cada peticion SSR inicialice la libreria ML completa aunque
// no use embeddings, lo que causaba tiempos de carga significativamente mayores.
export async function getEmbeddingPipeline(): Promise<any> {
  if (!embeddingPipeline) {
    const { pipeline, env } = await import("@huggingface/transformers");

    env.allowLocalModels = false;
    env.allowRemoteModels = true;
    if (env.backends?.onnx?.wasm) {
      env.backends.onnx.wasm.numThreads = 1;
    }

    embeddingPipeline = await pipeline(
      "feature-extraction",
      "Xenova/ALL-MiniLM-L6-v2",
      { device: "cpu" },
    );
  }
  return embeddingPipeline;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // TODO: Embeddings API integration (all-MiniLM-L6-v2)
  const pipe = await getEmbeddingPipeline();

  const output = await pipe(text, {
      pooling: "mean",
      normalize: true,
    }
  );
  return Array.from(output.data as Float32Array);
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