import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  googleId: text("google_id").unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  projectName: text("project_name").notNull(),
  projectSummary: text("project_summary").notNull(),
  siteUrl: text("site_url").notNull(),
  whatDoYouNeed: text("what_do_you_need").notNull().default(""),
  screenshotPath: text("screenshot_path"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const validations = pgTable("validations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  idea: text("idea").notNull(),
  targetCustomer: text("target_customer").notNull(),
  problemSolved: text("problem_solved").notNull(),
  feedback: text("feedback").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  createdAt: true,
});

export const insertValidationSchema = createInsertSchema(validations).omit({
  id: true,
  createdAt: true,
  feedback: true,
});

export const insertAdminSessionSchema = createInsertSchema(adminSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
export type InsertValidation = z.infer<typeof insertValidationSchema>;
export type Validation = typeof validations.$inferSelect & {
  user?: {
    id: string;
    email: string;
    name: string;
  } | null;
};
export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;
