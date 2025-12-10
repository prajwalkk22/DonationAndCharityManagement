import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";
import {
  users,
  campaigns,
  donations,
  events,
  volunteerAssignments,
  fundUsage,
  type User,
  type InsertUser,
  type Campaign,
  type InsertCampaign,
  type Donation,
  type InsertDonation,
  type FundUsage,
  type InsertFundUsage,
} from "@shared/schema";

export class DatabaseStorage {

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [u] = await db.insert(users).values(user).returning();
    return u;
  }

  // ⭐ keep the rest of your functions exactly as before
}

export const storage = new DatabaseStorage();
