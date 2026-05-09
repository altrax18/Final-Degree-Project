import { Elysia, t } from "elysia";
import { put, del } from "@vercel/blob";
import bcrypt from "bcryptjs";
import {
  createUser,
  getUserById,
  getUserByEmail,
  searchUsersByUsername,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowing,
  getFollowers,
} from "../services/users";

// CONCEPTO: Modulo de Rutas de Usuario
// QUE HACE: Agrupa todos los endpoints CRUD de usuario bajo el prefijo /api/users
//           e incluye el endpoint de autenticacion basica (login).
// POR QUE LO USO: Mantiene la arquitectura por modulos del backend y centraliza
//                 toda la logica de acceso al recurso "usuario" en un solo lugar.
// DOCUMENTACION: https://elysiajs.com/essential/route.html
export const usersRoutes = new Elysia({ prefix: "/api/users" })

  // GET /api/users/search?q=text&excludeId=123 – Busca usuarios por nombre
  .get("/search", async ({ query }) => {
    const q = (query as Record<string, string>).q ?? "";
    const excludeId = (query as Record<string, string>).excludeId;
    if (q.length < 2) return [];
    return searchUsersByUsername(q, excludeId ? Number(excludeId) : undefined);
  })

  // GET /api/users/:userId – Devuelve un usuario por ID (sin password)
  .get("/:userId", async ({ params }) => {
    const user = await getUserById(Number(params.userId));
    if (!user) return new Response("Not found", { status: 404 });
    const { password: _pw, ...safeUser } = user;
    return safeUser;
  })

  // POST /api/users – Registro: crea un nuevo usuario en la BD
  .post("/", async ({ body, set }) => {
    try {
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

      if (!username || !email || !password) {
        set.status = 400;
        return { error: "Faltan campos obligatorios (username, email, password)" };
      }

      // Verificar si el usuario ya existe
      const existing = await getUserByEmail(email);
      if (existing) {
        set.status = 400;
        return { error: "El email ya está registrado" };
      }

      // Encriptar password (usamos bcryptjs para compatibilidad con Node/Bun/Edge)
      const hashedPassword = await bcrypt.hash(password, 10);

      // Limpiar objeto para evitar enviar undefined a campos NOT NULL con default
      const insertData: any = {
        username,
        email,
        password: hashedPassword,
      };
      if (gender) insertData.gender = gender;
      if (birthYear) insertData.birthYear = birthYear;
      if (newsletter !== undefined) insertData.newsletter = newsletter;
      if (profileImageUrl) insertData.profileImageUrl = profileImageUrl;

      const user = await createUser(insertData);
      
      if (!user) {
        throw new Error("Error interno al crear el usuario en la base de datos");
      }

      const { password: _pw, ...safeUser } = user;
      return safeUser;
    } catch (err: any) {
      console.error("Error en registro:", err);
      set.status = 500;
      return { error: err.message || "Error interno del servidor" };
    }
  })

  // POST /api/users/login – Autenticacion segura con bcrypt
  .post("/login", async ({ body, set }) => {
    const { email, password } = body as { email: string; password: string };

    const user = await getUserByEmail(email);
    if (!user) {
      set.status = 401;
      return { error: "Credenciales incorrectas" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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
    
    if (password !== undefined && password !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await updateUser(Number(params.userId), updateData);
    if (!user) return new Response("Not found", { status: 404 });

    const { password: _pw, ...safeUser } = user;
    return safeUser;
  })

  // POST /api/users/:userId/avatar – Sube un avatar y actualiza el usuario
  .post("/:userId/avatar", async ({ params, body, set }) => {
    const file = body.file as File;
    if (!file) {
      set.status = 400;
      return { error: "No se proporcionó ningún archivo" };
    }

    try {
      // Obtener la URL anterior para borrarla después
      const currentUser = await getUserById(Number(params.userId));
      
      // Sanitizar el nombre del archivo
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${params.userId}-${Date.now()}-${sanitizedName}`;
      
      const blob = await put(filename, file, { access: 'public' });

      // Actualizar URL en la base de datos
      const user = await updateUser(Number(params.userId), { profileImageUrl: blob.url });
      if (!user) return new Response("Not found", { status: 404 });

      // Borrar la imagen anterior del Blob (si existía y es de Vercel Blob)
      if (currentUser?.profileImageUrl && currentUser.profileImageUrl.includes('blob.vercel-storage.com')) {
        try {
          await del(currentUser.profileImageUrl);
        } catch (e: any) {
          console.warn('No se pudo borrar la imagen anterior:', e.message);
        }
      }

      const { password: _pw, ...safeUser } = user;
      return safeUser;
    } catch (err: any) {
      console.error("Error subiendo avatar:", err);
      set.status = 500;
      return { error: "Error al subir la imagen", details: err.message || String(err) };
    }
  }, {
    body: t.Object({
      file: t.File()
    })
  })

  // DELETE /api/users/:userId/avatar – Borrar imagen de perfil del Blob de Vercel
  .delete("/:userId/avatar", async ({ params, set }) => {
    try {
      const currentUser = await getUserById(Number(params.userId));
      
      if (!currentUser?.profileImageUrl) {
        set.status = 404;
        return { error: "No tienes imagen de perfil" };
      }

      // Borrar del Blob
      if (currentUser.profileImageUrl.includes('blob.vercel-storage.com')) {
        try {
          await del(currentUser.profileImageUrl);
        } catch (e: any) {
          console.warn('No se pudo borrar la imagen del blob:', e.message);
        }
      }

      // Restablecer al valor por defecto
      const user = await updateUser(Number(params.userId), { profileImageUrl: "https://avatar.vercel.sh/default" });
      if (!user) return new Response("Not found", { status: 404 });

      const { password: _pw, ...safeUser } = user;
      return safeUser;
    } catch (error: any) {
      console.error("Error al borrar avatar:", error);
      set.status = 500;
      return { error: "Error al borrar la imagen de perfil" };
    }
  })

  // DELETE /api/users/:userId – Elimina la cuenta del usuario
  .delete("/:userId", async ({ params, body, set }) => {
    const { password } = body as { password: string };

    // Verificar password antes de borrar
    const user = await getUserById(Number(params.userId));
    if (!user) { set.status = 404; return { error: "Usuario no encontrado" }; }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      set.status = 401;
      return { error: "Contraseña incorrecta" };
    }

    await deleteUser(Number(params.userId));
    return { ok: true };
  })

  // GET /api/users/:userId/following – Lista de usuarios seguidos
  .get("/:userId/following", async ({ params }) => {
    return getFollowing(Number(params.userId));
  })

  // GET /api/users/:userId/followers – Lista de seguidores
  .get("/:userId/followers", async ({ params }) => {
    return getFollowers(Number(params.userId));
  })

  // GET /api/users/:userId/is-following/:targetId – Comprobar si sigue a un usuario específico
  .get("/:userId/is-following/:targetId", async ({ params }) => {
    const following = await isFollowing(Number(params.userId), Number(params.targetId));
    return { isFollowing: following };
  })

  // POST /api/users/:userId/follow/:targetId – Seguir a un usuario
  .post("/:userId/follow/:targetId", async ({ params, set }) => {
    try {
      await followUser(Number(params.userId), Number(params.targetId));
      return { ok: true };
    } catch (err: any) {
      set.status = 400;
      return { error: err.message || "Error al seguir al usuario" };
    }
  })

  // DELETE /api/users/:userId/follow/:targetId – Dejar de seguir a un usuario
  .delete("/:userId/follow/:targetId", async ({ params }) => {
    await unfollowUser(Number(params.userId), Number(params.targetId));
    return { ok: true };
  });

