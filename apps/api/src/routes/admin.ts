import { Elysia } from "elysia";
import { rebuildAllUserEmbeddings } from "../services/embeddings";

export const adminRoutes = new Elysia({ prefix: "/api/admin" })
  .post("/rebuild-embeddings", async () => {
    const result = await rebuildAllUserEmbeddings();
    return result;
  });
