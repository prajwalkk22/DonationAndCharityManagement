import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { 
  generateToken, 
  authenticateToken, 
  requireRole, 
  type AuthRequest 
} from "./middleware/auth";
import {
  insertUserSchema,
  loginSchema,
  insertCampaignSchema,
  insertDonationSchema,
  insertEventSchema,
  insertVolunteerAssignmentSchema,
  insertFundUsageSchema,
} from "@shared/schema";

const SALT_ROUNDS = 10;

export async function registerRoutes(app: Express): Promise<Server> {
  // ===== AUTHENTICATION ROUTES =====
  
  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, SALT_ROUNDS);

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken(user);

      // Return user without password
      const { password, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user);
      const { password, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // ===== CAMPAIGN ROUTES (Public) =====

  // Get all campaigns (available to all authenticated users)
  app.get("/api/campaigns", authenticateToken, async (_req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch campaigns" });
    }
  });

  // ===== ADMIN ROUTES =====

  // Admin stats
  app.get("/api/admin/stats", authenticateToken, requireRole('ADMIN'), async (_req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch stats" });
    }
  });

  // Recent donations
  app.get("/api/admin/recent-donations", authenticateToken, requireRole('ADMIN'), async (_req, res) => {
    try {
      const donations = await storage.getRecentDonations(10);
      res.json(donations);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch donations" });
    }
  });

  // Get all users
  app.get("/api/admin/users", authenticateToken, requireRole('ADMIN'), async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });

  // Delete user
  app.delete("/api/admin/users/:id", authenticateToken, requireRole('ADMIN'), async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete user" });
    }
  });

  // Create campaign
  app.post("/api/admin/campaigns", authenticateToken, requireRole('ADMIN'), async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      res.json(campaign);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create campaign" });
    }
  });

  // Update campaign
  app.patch("/api/admin/campaigns/:id", authenticateToken, requireRole('ADMIN'), async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.partial().parse(req.body);
      const campaign = await storage.updateCampaign(req.params.id, validatedData);
      res.json(campaign);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update campaign" });
    }
  });

  // Delete campaign
  app.delete("/api/admin/campaigns/:id", authenticateToken, requireRole('ADMIN'), async (req, res) => {
    try {
      await storage.deleteCampaign(req.params.id);
      res.json({ message: "Campaign deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete campaign" });
    }
  });

  // Get all events
  app.get("/api/admin/events", authenticateToken, requireRole('ADMIN'), async (_req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch events" });
    }
  });

  // Create event
  app.post("/api/admin/events", authenticateToken, requireRole('ADMIN'), async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create event" });
    }
  });

  // Delete event
  app.delete("/api/admin/events/:id", authenticateToken, requireRole('ADMIN'), async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ message: "Event deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete event" });
    }
  });

  // Get volunteers
  app.get("/api/admin/volunteers", authenticateToken, requireRole('ADMIN'), async (_req, res) => {
    try {
      const volunteers = await storage.getVolunteers();
      const volunteersWithoutPasswords = volunteers.map(({ password, ...user }) => user);
      res.json(volunteersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch volunteers" });
    }
  });

  // Assign volunteer to event
  app.post("/api/admin/volunteer-assignments", authenticateToken, requireRole('ADMIN'), async (req, res) => {
    try {
      const validatedData = insertVolunteerAssignmentSchema.parse(req.body);
      const assignment = await storage.createVolunteerAssignment(validatedData);
      res.json(assignment);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to assign volunteer" });
    }
  });

  // Get fund usage
  app.get("/api/admin/fund-usage", authenticateToken, requireRole('ADMIN'), async (_req, res) => {
    try {
      const fundUsage = await storage.getAllFundUsage();
      res.json(fundUsage);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch fund usage" });
    }
  });

  // CSV export routes
  app.get("/api/admin/reports/campaigns/csv", authenticateToken, requireRole('ADMIN'), async (_req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      
      let csv = 'Campaign Name,Goal Amount,Raised,Progress %,Donors\n';
      campaigns.forEach(c => {
        csv += `"${c.name}","${c.goalAmount}","${c.totalDonations}","${c.progressPercentage}","${c.donorCount}"\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=campaigns-report.csv');
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to export CSV" });
    }
  });

  app.get("/api/admin/reports/fund-usage/csv", authenticateToken, requireRole('ADMIN'), async (_req, res) => {
    try {
      const fundUsage = await storage.getAllFundUsage();
      
      let csv = 'Campaign,Description,Amount Spent,Date\n';
      fundUsage.forEach(f => {
        csv += `"${f.campaignName}","${f.description}","${f.amountSpent}","${new Date(f.spentAt).toLocaleDateString()}"\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=fund-usage-report.csv');
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to export CSV" });
    }
  });

  // ===== DONOR ROUTES =====

  // Donor stats
  app.get("/api/donor/stats", authenticateToken, requireRole('DONOR'), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const stats = await storage.getDonorStats(req.user.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch stats" });
    }
  });

  // Get donor's donations
  app.get("/api/donor/donations", authenticateToken, requireRole('DONOR'), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const donations = await storage.getDonationsByDonor(req.user.id);
      res.json(donations);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch donations" });
    }
  });

  // Create donation
  app.post("/api/donor/donations", authenticateToken, requireRole('DONOR'), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const validatedData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation({
        ...validatedData,
        donorId: req.user.id,
      });
      res.json(donation);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create donation" });
    }
  });

  // Receipt download (simple HTML/PDF generation placeholder)
  app.get("/api/donor/receipt/:id/pdf", authenticateToken, requireRole('DONOR'), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const donation = await storage.getDonation(req.params.id);
      if (!donation || donation.donorId !== req.user.id) {
        return res.status(404).json({ message: "Donation not found" });
      }

      // Simple HTML receipt (in production, use a PDF generation library)
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Donation Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
              h1 { color: #16a34a; }
              .receipt-id { font-family: monospace; background: #f3f4f6; padding: 10px; }
            </style>
          </head>
          <body>
            <h1>Donation Receipt</h1>
            <p><strong>Receipt ID:</strong> <span class="receipt-id">${donation.receiptId}</span></p>
            <p><strong>Amount:</strong> $${donation.amount}</p>
            <p><strong>Date:</strong> ${new Date(donation.createdAt).toLocaleDateString()}</p>
            <p>Thank you for your generous donation!</p>
          </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to generate receipt" });
    }
  });

  // ===== VOLUNTEER ROUTES =====

  // Volunteer stats
  app.get("/api/volunteer/stats", authenticateToken, requireRole('VOLUNTEER'), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const stats = await storage.getVolunteerStats(req.user.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch stats" });
    }
  });

  // Get volunteer's assigned events
  app.get("/api/volunteer/my-events", authenticateToken, requireRole('VOLUNTEER'), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const events = await storage.getVolunteerAssignments(req.user.id);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch events" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
