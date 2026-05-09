import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config as loadEnv } from "dotenv";
import * as schema from "./schema";

// CONCEPTO: Inicializacion temprana de entorno
// QUE HACE: Carga variables desde .env local y luego desde el .env raiz del monorepo.
// POR QUE LO USO: Garantiza que DATABASE_URL exista antes de construir el cliente de Neon.
// DOCUMENTACION: https://github.com/motdotla/dotenv
loadEnv();
loadEnv({ path: "../../.env" });

const databaseUrl = process.env.DATABASE_URL;

// CONCEPTO: Fail Fast en configuracion critica
// QUE HACE: Detiene el arranque con un mensaje claro cuando falta la URL de base de datos.
// POR QUE LO USO: Evita errores opacos dentro de la libreria de Neon y acelera el diagnostico.
// DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw
if (!databaseUrl) {
  throw new Error(
    "Falta DATABASE_URL. Crea el archivo .env en la raiz del proyecto y define DATABASE_URL.",
  );
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
