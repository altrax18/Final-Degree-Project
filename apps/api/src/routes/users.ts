import { Elysia } from "elysia";
import {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from "../services/users";

export const usersRoutes = new Elysia({ prefix: "/users" })
  .get("/:userId", async ({ params }) => {
    const user = await getUserById(Number(params.userId));
    if (!user) return new Response("Not found", { status: 404 });
    return user;
  })
  .post("/", async ({ body }) => {
    const {
      username,
      email,
      password,
      gender,
      birthYear,
      newsletter,
      profileImageUrl,
    } = body as {
      username: string;
      email: string;
      password: string;
      gender?: "male" | "female" | "other" | "prefer_not_to_say";
      birthYear?: number;
      newsletter?: boolean;
      profileImageUrl?: string;
    };
    const user = await createUser({
      username,
      email,
      password,
      gender,
      birthYear,
      newsletter,
      profileImageUrl,
    });
    return user;
  })
  .put("/:userId", async ({ params, body }) => {
    const user = await updateUser(
      Number(params.userId),
      body as Record<string, unknown>,
    );
    if (!user) return new Response("Not found", { status: 404 });
    return user;
  })
  .delete("/:userId", async ({ params }) => {
    const user = await deleteUser(Number(params.userId));
    if (!user) return new Response("Not found", { status: 404 });
    return user;
  });
