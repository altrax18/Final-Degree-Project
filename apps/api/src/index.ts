import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { usersRoutes } from "./routes/users";
import { itemsRoutes } from "./routes/items";
import { interactionsRoutes } from "./routes/interactions";
import { recommendationsRoutes } from "./routes/recommendations";
import { chatRoutes } from "./routes/chat";

const app = new Elysia()
  .use(cors())
  .use(usersRoutes)
  .use(itemsRoutes)
  .use(interactionsRoutes)
  .use(recommendationsRoutes)
  .use(chatRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
