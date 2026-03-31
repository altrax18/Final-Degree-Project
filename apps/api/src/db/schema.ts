import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
//https://orm.drizzle.team/docs/sql-schema-declaration
//https://neon.com/docs/introduction

//https://orm.drizzle.team/docs/column-types/pg#foreign-key

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
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
