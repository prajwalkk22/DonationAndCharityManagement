import bcrypt from 'bcrypt';
import { storage } from './storage';

const SALT_ROUNDS = 10;

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
    const admin = await storage.createUser({
      username: 'admin',
      email: 'admin@dcms.org',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    });
    console.log('✓ Created admin user');

    // Create donor users
    const donorPassword = await bcrypt.hash('donor123', SALT_ROUNDS);
    const donor1 = await storage.createUser({
      username: 'donor1',
      email: 'john@example.com',
      password: donorPassword,
      name: 'John Doe',
      role: 'DONOR',
    });
    
    const donor2 = await storage.createUser({
      username: 'donor2',
      email: 'sarah@example.com',
      password: donorPassword,
      name: 'Sarah Smith',
      role: 'DONOR',
    });
    console.log('✓ Created donor users');

    // Create volunteer user
    const volunteerPassword = await bcrypt.hash('volunteer123', SALT_ROUNDS);
    const volunteer1 = await storage.createUser({
      username: 'volunteer1',
      email: 'mike@example.com',
      password: volunteerPassword,
      name: 'Mike Johnson',
      role: 'VOLUNTEER',
    });
    console.log('✓ Created volunteer user');

    // Create campaigns
    const campaign1 = await storage.createCampaign({
      name: 'Build Community Center',
      description: 'Help us build a new community center to serve families in need. This center will provide educational programs, recreational activities, and support services.',
      goalAmount: '50000',
    });

    const campaign2 = await storage.createCampaign({
      name: 'Emergency Food Relief',
      description: 'Support our emergency food relief program providing meals to families facing food insecurity in our community.',
      goalAmount: '25000',
    });

    const campaign3 = await storage.createCampaign({
      name: 'Education Scholarship Fund',
      description: 'Create opportunities for underprivileged students by funding scholarships for higher education and vocational training.',
      goalAmount: '100000',
    });
    console.log('✓ Created campaigns');

    // Create donations
    await storage.createDonation({
      donorId: donor1.id,
      campaignId: campaign1.id,
      amount: '5000',
    });

    await storage.createDonation({
      donorId: donor1.id,
      campaignId: campaign2.id,
      amount: '1000',
    });

    await storage.createDonation({
      donorId: donor2.id,
      campaignId: campaign1.id,
      amount: '2500',
    });

    await storage.createDonation({
      donorId: donor2.id,
      campaignId: campaign3.id,
      amount: '10000',
    });
    console.log('✓ Created donations');

    // Create events
    const event1 = await storage.createEvent({
      title: 'Community Food Drive',
      description: 'Join us in collecting and distributing food to families in need',
      date: new Date('2025-12-15T10:00:00') as any,
      location: '123 Main St, Community Hall',
    });

    const event2 = await storage.createEvent({
      title: 'Holiday Toy Distribution',
      description: 'Help distribute toys to children during the holiday season',
      date: new Date('2025-12-20T14:00:00') as any,
      location: '456 Oak Ave, Central Park',
    });
    console.log('✓ Created events');

    // Assign volunteer to events
    await storage.createVolunteerAssignment({
      volunteerId: volunteer1.id,
      eventId: event1.id,
    });

    await storage.createVolunteerAssignment({
      volunteerId: volunteer1.id,
      eventId: event2.id,
    });
    console.log('✓ Created volunteer assignments');

    // Create fund usage records
    await storage.createFundUsage({
      campaignId: campaign1.id,
      description: 'Purchased construction materials',
      amountSpent: '2000',
    });

    await storage.createFundUsage({
      campaignId: campaign2.id,
      description: 'Bulk food purchase from suppliers',
      amountSpent: '500',
    });
    console.log('✓ Created fund usage records');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Donor: username=donor1, password=donor123');
    console.log('Volunteer: username=volunteer1, password=volunteer123');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
