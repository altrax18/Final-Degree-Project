import { Elysia } from "elysia";
import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const usersRoutes = new Elysia({ prefix: "/users" })
  .get("/:id", async ({ params }) => {
    const [user] = await db.select().from(users).where(eq(users.id, Number(params.id)));
    if (!user) return new Response("Not found", { status: 404 });
    return user;
  })
  .post("/", async ({ body }) => {
    const { username, email, password } = body as { username: string; email: string; password: string };
    const [user] = await db.insert(users).values({ username, email, password }).returning();
    return user;
  });
