import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - supports ADMIN, DONOR, VOLUNTEER roles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // ADMIN, DONOR, VOLUNTEER
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Campaigns table - managed by admins, used for donations
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  goalAmount: decimal("goal_amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: text("status").notNull().default('active'), // active, completed, archived
});

// Donations table - tracks donations from donors to campaigns
export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  donorId: varchar("donor_id").notNull().references(() => users.id),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  receiptId: varchar("receipt_id").notNull().unique().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Events table - volunteer events created by admins
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Volunteer assignments table - links volunteers to events
export const volunteerAssignments = pgTable("volunteer_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  volunteerId: varchar("volunteer_id").notNull().references(() => users.id),
  eventId: varchar("event_id").notNull().references(() => events.id),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

// Fund usage table - tracks how campaign funds are spent
export const fundUsage = pgTable("fund_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id),
  description: text("description").notNull(),
  amountSpent: decimal("amount_spent", { precision: 12, scale: 2 }).notNull(),
  spentAt: timestamp("spent_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  donations: many(donations),
  volunteerAssignments: many(volunteerAssignments),
}));

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  donations: many(donations),
  fundUsages: many(fundUsage),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  donor: one(users, {
    fields: [donations.donorId],
    references: [users.id],
  }),
  campaign: one(campaigns, {
    fields: [donations.campaignId],
    references: [campaigns.id],
  }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  volunteerAssignments: many(volunteerAssignments),
}));

export const volunteerAssignmentsRelations = relations(volunteerAssignments, ({ one }) => ({
  volunteer: one(users, {
    fields: [volunteerAssignments.volunteerId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [volunteerAssignments.eventId],
    references: [events.id],
  }),
}));

export const fundUsageRelations = relations(fundUsage, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [fundUsage.campaignId],
    references: [campaigns.id],
  }),
}));

// Insert and Select Schemas

// Users
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "DONOR", "VOLUNTEER"], {
    errorMap: () => ({ message: "Role must be ADMIN, DONOR, or VOLUNTEER" }),
  }),
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
}).omit({ id: true, createdAt: true });

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;

// Campaigns
export const insertCampaignSchema = createInsertSchema(campaigns, {
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  goalAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Goal amount must be a positive number",
  }),
}).omit({ id: true, createdAt: true, status: true });

export const selectCampaignSchema = createSelectSchema(campaigns);
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

// Donations
export const insertDonationSchema = createInsertSchema(donations, {
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Donation amount must be a positive number",
  }),
  campaignId: z.string().min(1, "Campaign is required"),
}).omit({ id: true, createdAt: true, receiptId: true, donorId: true });

export const selectDonationSchema = createSelectSchema(donations);
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

// Events
export const insertEventSchema = createInsertSchema(events, {
  title: z.string().min(1, "Event title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  date: z.string().or(z.date()),
}).omit({ id: true, createdAt: true });

export const selectEventSchema = createSelectSchema(events);
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Volunteer Assignments
export const insertVolunteerAssignmentSchema = createInsertSchema(volunteerAssignments, {
  volunteerId: z.string().min(1, "Volunteer is required"),
  eventId: z.string().min(1, "Event is required"),
}).omit({ id: true, assignedAt: true });

export const selectVolunteerAssignmentSchema = createSelectSchema(volunteerAssignments);
export type InsertVolunteerAssignment = z.infer<typeof insertVolunteerAssignmentSchema>;
export type VolunteerAssignment = typeof volunteerAssignments.$inferSelect;

// Fund Usage
export const insertFundUsageSchema = createInsertSchema(fundUsage, {
  description: z.string().min(1, "Description is required"),
  amountSpent: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount spent must be a positive number",
  }),
  campaignId: z.string().min(1, "Campaign is required"),
}).omit({ id: true, spentAt: true });

export const selectFundUsageSchema = createSelectSchema(fundUsage);
export type InsertFundUsage = z.infer<typeof insertFundUsageSchema>;
export type FundUsage = typeof fundUsage.$inferSelect;

// Extended types for API responses with joined data
export type DonationWithDetails = Donation & {
  donor: Pick<User, 'id' | 'name' | 'email'>;
  campaign: Pick<Campaign, 'id' | 'name'>;
};

export type CampaignWithStats = Campaign & {
  totalDonations: number;
  donorCount: number;
  progressPercentage: number;
};

export type VolunteerAssignmentWithDetails = VolunteerAssignment & {
  volunteer: Pick<User, 'id' | 'name' | 'email'>;
  event: Event;
};

export type EventWithVolunteers = Event & {
  volunteerCount: number;
  volunteers: Pick<User, 'id' | 'name' | 'email'>[];
};
