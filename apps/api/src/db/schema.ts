import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
//https://orm.drizzle.team/docs/sql-schema-declaration
//https://neon.com/docs/introduction

//https://orm.drizzle.team/docs/column-types/pg#foreign-key

// CONCEPTO: Declaracion de Esquema (Drizzle ORM)
// QUE HACE: Modela la tabla games y sus columnas en TypeScript.
// POR QUE LO USO: Unifica tipos de DB y codigo app, reduciendo errores de SQL manual.
// DOCUMENTACION: https://orm.drizzle.team/docs/sql-schema-declaration
export const games = pgTable("games", {
  id: serial("id").primaryKey(),

  // CONCEPTO: Clave de Integracion Externa
  // QUE HACE: Guarda el id original de IGDB como unico.
  // POR QUE LO USO: Evita insertar el mismo juego varias veces al sincronizar.
  // DOCUMENTACION: https://orm.drizzle.team/docs/indexes-constraints#unique
  // Guardamos el ID de IGDB para evitar duplicados y poder buscar más info luego
  igdbId: integer("igdb_id").unique().notNull(),

  // title para que coincida con  API
  title: text("title").notNull(),

  // image  objeto de la API
  image: text("image"),

  summary: text("summary"),

  // un número del 0 al 100
  rating: integer("rating"),

  // IGDB envía esto como un timestamp de segundos (Unix)
  firstReleaseDate: integer("first_release_date"),

  createdAt: timestamp("created_at").defaultNow(),
});
