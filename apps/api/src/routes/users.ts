import { Elysia } from "elysia";
import {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
} from "../services/users";

// CONCEPTO: Modulo de Rutas de Usuario
// QUE HACE: Agrupa todos los endpoints CRUD de usuario bajo el prefijo /api/users
//           e incluye el endpoint de autenticacion basica (login).
// POR QUE LO USO: Mantiene la arquitectura por modulos del backend y centraliza
//                 toda la logica de acceso al recurso "usuario" en un solo lugar.
// DOCUMENTACION: https://elysiajs.com/essential/route.html
export const usersRoutes = new Elysia({ prefix: "/users" })

  // GET /api/users/:userId – Devuelve un usuario por ID (sin password)
  .get("/:userId", async ({ params }) => {
    const user = await getUserById(Number(params.userId));
    if (!user) return new Response("Not found", { status: 404 });
    const { password: _pw, ...safeUser } = user;
    return safeUser;
  })

  // POST /api/users – Registro: crea un nuevo usuario en la BD
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
    const { password: _pw, ...safeUser } = user;
    return safeUser;
  })

  // POST /api/users/login – Autenticacion basica: busca por email y compara password
  // NOTA TFG: password en texto plano – sustituir por bcrypt antes de produccion
  .post("/login", async ({ body, set }) => {
    const { email, password } = body as { email: string; password: string };

    const user = await getUserByEmail(email);
    if (!user || user.password !== password) {
      set.status = 401;
      return { error: "Credenciales incorrectas" };
    }

    const { password: _pw, ...safeUser } = user;
    return safeUser;
  })

  // PUT /api/users/:userId – Actualiza campos editables del perfil
  .put("/:userId", async ({ params, body }) => {
    const {
      username,
      email,
      newsletter,
      profileImageUrl,
      password,
    } = body as {
      username?: string;
      email?: string;
      newsletter?: boolean;
      profileImageUrl?: string;
      password?: string;
    };

    // Solo incluye los campos que vienen en el body (evita sobrescribir con undefined)
    const updateData: Record<string, unknown> = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (newsletter !== undefined) updateData.newsletter = newsletter;
    if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
    if (password !== undefined && password !== "") updateData.password = password;

    const user = await updateUser(Number(params.userId), updateData);
    if (!user) return new Response("Not found", { status: 404 });

    const { password: _pw, ...safeUser } = user;
    return safeUser;
  })

  // DELETE /api/users/:userId – Elimina la cuenta del usuario
  .delete("/:userId", async ({ params, body, set }) => {
    const { password } = body as { password: string };

    // Verificar password antes de borrar
    const user = await getUserById(Number(params.userId));
    if (!user) { set.status = 404; return { error: "Usuario no encontrado" }; }
    if (user.password !== password) { set.status = 401; return { error: "Contraseña incorrecta" }; }

    await deleteUser(Number(params.userId));
    return { ok: true };
  });
