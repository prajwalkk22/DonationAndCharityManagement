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
  type Event,
  type InsertEvent,
  type VolunteerAssignment,
  type InsertVolunteerAssignment,
  type FundUsage,
  type InsertFundUsage,
  type DonationWithDetails,
  type CampaignWithStats,
  type EventWithVolunteers,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  getVolunteers(): Promise<User[]>;

  // Campaign operations
  getCampaign(id: string): Promise<Campaign | undefined>;
  getAllCampaigns(): Promise<CampaignWithStats[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign>;
  deleteCampaign(id: string): Promise<void>;

  // Donation operations
  getDonation(id: string): Promise<Donation | undefined>;
  getDonationsByDonor(donorId: string): Promise<DonationWithDetails[]>;
  getDonationsByCampaign(campaignId: string): Promise<DonationWithDetails[]>;
  createDonation(donation: InsertDonation & { donorId: string }): Promise<Donation>;
  getRecentDonations(limit: number): Promise<DonationWithDetails[]>;

  // Event operations
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<EventWithVolunteers[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;

  // Volunteer assignment operations
  getVolunteerAssignments(volunteerId: string): Promise<EventWithVolunteers[]>;
  createVolunteerAssignment(assignment: InsertVolunteerAssignment): Promise<VolunteerAssignment>;
  deleteVolunteerAssignment(id: string): Promise<void>;

  // Fund usage operations
  getAllFundUsage(): Promise<(FundUsage & { campaignName: string })[]>;
  createFundUsage(usage: InsertFundUsage): Promise<FundUsage>;

  // Stats operations
  getAdminStats(): Promise<{
    totalCampaigns: number;
    totalDonations: string;
    activeVolunteers: number;
    totalRaised: string;
  }>;
  getDonorStats(donorId: string): Promise<{
    totalDonated: string;
    campaignsSupported: number;
    lastDonation: string | null;
  }>;
  getVolunteerStats(volunteerId: string): Promise<{
    upcomingEvents: number;
    totalEvents: number;
    hoursVolunteered: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getVolunteers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'VOLUNTEER'));
  }

  // Campaign operations
  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async getAllCampaigns(): Promise<CampaignWithStats[]> {
    const campaignsWithStats = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        description: campaigns.description,
        goalAmount: campaigns.goalAmount,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
        totalDonations: sql<number>`COALESCE(SUM(CAST(${donations.amount} AS DECIMAL)), 0)`,
        donorCount: sql<number>`COUNT(DISTINCT ${donations.donorId})`,
      })
      .from(campaigns)
      .leftJoin(donations, eq(donations.campaignId, campaigns.id))
      .groupBy(campaigns.id)
      .orderBy(desc(campaigns.createdAt));

    return campaignsWithStats.map(c => ({
      ...c,
      progressPercentage: Math.min(
        Math.round((c.totalDonations / Number(c.goalAmount)) * 100),
        100
      ),
    }));
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign> {
    const [updated] = await db
      .update(campaigns)
      .set(campaign)
      .where(eq(campaigns.id, id))
      .returning();
    return updated;
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // Donation operations
  async getDonation(id: string): Promise<Donation | undefined> {
    const [donation] = await db.select().from(donations).where(eq(donations.id, id));
    return donation || undefined;
  }

  async getDonationsByDonor(donorId: string): Promise<DonationWithDetails[]> {
    const results = await db
      .select({
        donation: donations,
        donor: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        campaign: {
          id: campaigns.id,
          name: campaigns.name,
        },
      })
      .from(donations)
      .innerJoin(users, eq(donations.donorId, users.id))
      .innerJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .where(eq(donations.donorId, donorId))
      .orderBy(desc(donations.createdAt));

    return results.map(r => ({
      ...r.donation,
      donor: r.donor,
      campaign: r.campaign,
    }));
  }

  async getDonationsByCampaign(campaignId: string): Promise<DonationWithDetails[]> {
    const results = await db
      .select({
        donation: donations,
        donor: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        campaign: {
          id: campaigns.id,
          name: campaigns.name,
        },
      })
      .from(donations)
      .innerJoin(users, eq(donations.donorId, users.id))
      .innerJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .where(eq(donations.campaignId, campaignId))
      .orderBy(desc(donations.createdAt));

    return results.map(r => ({
      ...r.donation,
      donor: r.donor,
      campaign: r.campaign,
    }));
  }

  async createDonation(donation: InsertDonation & { donorId: string }): Promise<Donation> {
    const [newDonation] = await db.insert(donations).values(donation).returning();
    return newDonation;
  }

  async getRecentDonations(limit: number): Promise<DonationWithDetails[]> {
    const results = await db
      .select({
        donation: donations,
        donor: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        campaign: {
          id: campaigns.id,
          name: campaigns.name,
        },
      })
      .from(donations)
      .innerJoin(users, eq(donations.donorId, users.id))
      .innerJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .orderBy(desc(donations.createdAt))
      .limit(limit);

    return results.map(r => ({
      ...r.donation,
      donor: r.donor,
      campaign: r.campaign,
    }));
  }

  // Event operations
  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getAllEvents(): Promise<EventWithVolunteers[]> {
    const eventsWithVolunteers = await db
      .select({
        event: events,
        volunteerCount: sql<number>`COUNT(DISTINCT ${volunteerAssignments.volunteerId})`,
      })
      .from(events)
      .leftJoin(volunteerAssignments, eq(volunteerAssignments.eventId, events.id))
      .groupBy(events.id)
      .orderBy(desc(events.date));

    const eventsWithDetails = await Promise.all(
      eventsWithVolunteers.map(async (e) => {
        const volunteers = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
          })
          .from(volunteerAssignments)
          .innerJoin(users, eq(volunteerAssignments.volunteerId, users.id))
          .where(eq(volunteerAssignments.eventId, e.event.id));

        return {
          ...e.event,
          volunteerCount: e.volunteerCount,
          volunteers,
        };
      })
    );

    return eventsWithDetails;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const [updated] = await db
      .update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Volunteer assignment operations
  async getVolunteerAssignments(volunteerId: string): Promise<EventWithVolunteers[]> {
    const assignments = await db
      .select({
        event: events,
        volunteerCount: sql<number>`COUNT(DISTINCT ${volunteerAssignments.volunteerId})`,
      })
      .from(volunteerAssignments)
      .innerJoin(events, eq(volunteerAssignments.eventId, events.id))
      .where(eq(volunteerAssignments.volunteerId, volunteerId))
      .groupBy(events.id)
      .orderBy(desc(events.date));

    const eventsWithDetails = await Promise.all(
      assignments.map(async (a) => {
        const volunteers = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
          })
          .from(volunteerAssignments)
          .innerJoin(users, eq(volunteerAssignments.volunteerId, users.id))
          .where(eq(volunteerAssignments.eventId, a.event.id));

        return {
          ...a.event,
          volunteerCount: a.volunteerCount,
          volunteers,
        };
      })
    );

    return eventsWithDetails;
  }

  async createVolunteerAssignment(
    assignment: InsertVolunteerAssignment
  ): Promise<VolunteerAssignment> {
    const [newAssignment] = await db
      .insert(volunteerAssignments)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async deleteVolunteerAssignment(id: string): Promise<void> {
    await db.delete(volunteerAssignments).where(eq(volunteerAssignments.id, id));
  }

  // Fund usage operations
  async getAllFundUsage(): Promise<(FundUsage & { campaignName: string })[]> {
    const results = await db
      .select({
        fundUsage: fundUsage,
        campaignName: campaigns.name,
      })
      .from(fundUsage)
      .innerJoin(campaigns, eq(fundUsage.campaignId, campaigns.id))
      .orderBy(desc(fundUsage.spentAt));

    return results.map(r => ({
      ...r.fundUsage,
      campaignName: r.campaignName,
    }));
  }

  async createFundUsage(usage: InsertFundUsage): Promise<FundUsage> {
    const [newUsage] = await db.insert(fundUsage).values(usage).returning();
    return newUsage;
  }

  // Stats operations
  async getAdminStats() {
    const [campaignCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(campaigns);

    const [donationCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(donations);

    const [volunteerCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(eq(users.role, 'VOLUNTEER'));

    const [totalRaised] = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${donations.amount} AS DECIMAL)), 0)`,
      })
      .from(donations);

    return {
      totalCampaigns: campaignCount.count,
      totalDonations: donationCount.count.toString(),
      activeVolunteers: volunteerCount.count,
      totalRaised: totalRaised.total,
    };
  }

  async getDonorStats(donorId: string) {
    const [totalDonated] = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${donations.amount} AS DECIMAL)), 0)`,
      })
      .from(donations)
      .where(eq(donations.donorId, donorId));

    const [campaignsSupported] = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${donations.campaignId})`,
      })
      .from(donations)
      .where(eq(donations.donorId, donorId));

    const [lastDonation] = await db
      .select({ createdAt: donations.createdAt })
      .from(donations)
      .where(eq(donations.donorId, donorId))
      .orderBy(desc(donations.createdAt))
      .limit(1);

    return {
      totalDonated: totalDonated.total,
      campaignsSupported: campaignsSupported.count,
      lastDonation: lastDonation?.createdAt.toISOString() || null,
    };
  }

  async getVolunteerStats(volunteerId: string) {
    const now = new Date();
    
    const [upcomingEvents] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(volunteerAssignments)
      .innerJoin(events, eq(volunteerAssignments.eventId, events.id))
      .where(
        and(
          eq(volunteerAssignments.volunteerId, volunteerId),
          sql`${events.date} > ${now}`
        )
      );

    const [totalEvents] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(volunteerAssignments)
      .where(eq(volunteerAssignments.volunteerId, volunteerId));

    // Simplified - assuming 4 hours per event
    const hoursVolunteered = totalEvents.count * 4;

    return {
      upcomingEvents: upcomingEvents.count,
      totalEvents: totalEvents.count,
      hoursVolunteered,
    };
  }
}

export const storage = new DatabaseStorage();
