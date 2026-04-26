import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { usersRoutes } from "./routes/users";
import { catalogRoutes } from "./routes/catalog";
import { collectionsRoutes } from "./routes/collections";
import { interactionsRoutes } from "./routes/interactions";
import { recommendationsRoutes } from "./routes/recommendations";
import { chatRoutes } from "./routes/chat";

// CONCEPTO: Composicion de Middlewares y Rutas
// QUE HACE: Construye una unica instancia de Elysia y encadena todos los modulos del backend.
// POR QUE LO USO: Evita duplicidad de servidores y mantiene la arquitectura por modulos.
// DOCUMENTACION: https://elysiajs.com/essential/handler.html
const app = new Elysia()
  .use(cors())
  .use(usersRoutes)
  .use(catalogRoutes)
  .use(collectionsRoutes)
  .use(interactionsRoutes)
  .use(recommendationsRoutes)
  .use(chatRoutes);

if (import.meta.main) {
  app.listen(3000);
}

export { app };
export type App = typeof app;
