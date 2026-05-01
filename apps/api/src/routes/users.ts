import { Elysia } from "elysia";
import bcrypt from "bcryptjs";
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
export const usersRoutes = new Elysia({ prefix: "/api/users" })

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
  });
