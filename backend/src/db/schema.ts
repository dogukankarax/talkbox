import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "member"]);

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  created_at: timestamp().notNull().defaultNow(),
});

export const channelsTable = pgTable("channels", {
  id: uuid().primaryKey().defaultRandom(),
  channel_name: varchar({ length: 255 }).notNull(),
  invite_code: varchar({ length: 10 }).notNull().unique(),
  created_by: uuid()
    .references(() => usersTable.id)
    .notNull(),
  created_at: timestamp().notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: uuid().primaryKey().defaultRandom(),
  content: text().notNull(),
  channel_id: uuid()
    .references(() => channelsTable.id, { onDelete: "cascade" })
    .notNull(),
  sender_id: uuid()
    .references(() => usersTable.id)
    .notNull(),
  created_at: timestamp().notNull().defaultNow(),
});

export const channelMembersTable = pgTable("channel_members", {
  id: uuid().primaryKey().defaultRandom(),
  channel_id: uuid()
    .references(() => channelsTable.id, { onDelete: "cascade" })
    .notNull(),
  user_id: uuid()
    .references(() => usersTable.id)
    .notNull(),
  role: userRoleEnum().notNull().default("member"),
  created_at: timestamp().notNull().defaultNow(),
});
