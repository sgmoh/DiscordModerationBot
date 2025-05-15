import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original schema for users, kept for reference
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Discord bot configuration schema
export const discordConfig = z.object({
  token: z.string().min(1, "Discord bot token is required"),
  clientId: z.string().min(1, "Discord client ID is required"),
  welcomeMessage: z.string().default("Welcome to immys server"),
  prefix: z.string().default("."),
  // Store for custom settings that can be changed at runtime
  customSettings: z.object({
    welcomeMessage: z.string().default("Welcome to immys server"),
  }).default({
    welcomeMessage: "Welcome to immys server",
  })
});

export type DiscordConfig = z.infer<typeof discordConfig>;
