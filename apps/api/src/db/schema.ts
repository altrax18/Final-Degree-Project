import { pgTable, pgEnum, serial, varchar, text, integer, boolean, jsonb, real, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { vector } from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("gender_enum", ["male", "female", "other", "prefer_not_to_say"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  date: timestamp("date").defaultNow(),
  gender: genderEnum("gender"),
  birthYear: integer("birth_year"),
  newsletter: boolean("newsletter").default(false),
  profileImageUrl: text("profile_image_url").notNull().default("https://avatar.vercel.sh/default"),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type", { enum: ["movie", "music", "game"] }).notNull(),
  metadata: jsonb("metadata"),
  externalId: text("external_id"),
  embedding: vector("embedding", { dimensions: 384 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const interactions = pgTable(
  "interactions",
  {
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    itemId: integer("item_id").notNull().references(() => items.id, { onDelete: "cascade" }),
    action: text("action", { enum: ["like", "dislike", "rating", "watchlist", "played", "listened"] }).notNull(),
    score: real("score"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.itemId, table.action] }),
  ]
);

export const userEmbeddings = pgTable("user_embeddings", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  embedding: vector("embedding", { dimensions: 384 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const conversationTypeEnum = pgEnum("conversation_type", ["direct", "group"]);

export const messageTypeEnum = pgEnum("message_type", ["text", "image", "file"]);

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  type: conversationTypeEnum("type").notNull(),
  name: varchar("name", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  type: messageTypeEnum("type").notNull().default("text"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const chatMembers = pgTable(
  "chat_members",
  {
    conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.conversationId, table.userId] }),
  ]
);
