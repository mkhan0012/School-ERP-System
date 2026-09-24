const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.activity.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const password = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@edulead.com', password, role: 'ADMIN' }
  });

  const manager1 = await prisma.user.create({
    data: { name: 'Manager One', email: 'manager1@edulead.com', password, role: 'MANAGER' }
  });
  
  const counsellors = [];
  for(let i=1; i<=8; i++) {
    const c = await prisma.user.create({
      data: { name: `Counsellor ${i}`, email: `counsellor${i}@edulead.com`, password, role: 'COUNSELLOR' }
    });
    counsellors.push(c);
  }

  // Create Courses
  const courseNames = ['BCA', 'BBA', 'MBA', 'MCA', 'B.Tech CSE', 'B.Tech ECE', 'B.Com', 'B.Sc'];
  const courses = [];
  for(const name of courseNames) {
    const c = await prisma.course.create({
      data: { name, active: true }
    });
    courses.push(c);
  }

  // Create Leads
  const statuses = ['NEW', 'CONTACTED', 'INTERESTED', 'APPLICATION', 'ADMITTED', 'NOT_INTERESTED', 'LOST'];
  const sources = ['WEBSITE', 'WHATSAPP', 'PHONE', 'WALK_IN', 'FAIR', 'CAMPAIGN', 'OTHER'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH'];
  
  const names = ['Amit', 'Rahul', 'Priya', 'Sneha', 'Vikram', 'Anjali', 'Karan', 'Neha'];
  const lastNames = ['Sharma', 'Verma', 'Singh', 'Gupta', 'Patel', 'Kumar', 'Jain', 'Das'];
  const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'];

  console.log("Generating 100 leads with realistic funnel and follow-ups...");
  
  // Logical distribution of statuses (cumulative funnel shape)
  // Total 100:
  // NEW: 35
  // CONTACTED: 25
  // INTERESTED: 20
  // APPLICATION: 12
  // ADMITTED: 5
  // NOT_INTERESTED/LOST: 3
  
  const statusDistribution = [
    ...Array(35).fill('NEW'),
    ...Array(25).fill('CONTACTED'),
    ...Array(20).fill('INTERESTED'),
    ...Array(12).fill('APPLICATION'),
    ...Array(5).fill('ADMITTED'),
    ...Array(2).fill('NOT_INTERESTED'),
    ...Array(1).fill('LOST')
  ];

  for(let i=0; i<100; i++) {
    const fn = names[Math.floor(Math.random() * names.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const course = courses[Math.floor(Math.random() * courses.length)];
    const counsellor = counsellors[Math.floor(Math.random() * counsellors.length)];
    const status = statusDistribution[i];
    
    // Random date within last 20 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 20));

    const lead = await prisma.lead.create({
      data: {
        name: `${fn} ${ln}`,
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
        city,
        source: sources[Math.floor(Math.random() * sources.length)],
        status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        courseId: course.id,
        counsellorId: counsellor.id,
        createdAt: date,
        updatedAt: date
      }
    });

    // Add Creation activity
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        userId: admin.id,
        action: 'CREATED',
        description: `Lead created from ${lead.source}`,
        createdAt: date
      }
    });

    // Add Follow-ups realistically based on status
    if (status !== 'NEW') {
      const isCompleted = ['INTERESTED', 'APPLICATION', 'ADMITTED', 'NOT_INTERESTED', 'LOST'].includes(status);
      
      // Determine schedule date for the follow-up
      const followUpDate = new Date();
      if (isCompleted) {
        // Completed follow-ups happened in the past
        followUpDate.setDate(date.getDate() + 1);
      } else {
        // Contacted leads might have future, today, or overdue followups
        const offset = Math.floor(Math.random() * 7) - 3; // -3 to +3 days from today
        followUpDate.setDate(new Date().getDate() + offset);
      }
      
      const type = ['CALL', 'WHATSAPP', 'EMAIL'][Math.floor(Math.random() * 3)];
      const completed = isCompleted || followUpDate < new Date(new Date().setHours(0,0,0,0) - 86400000 * 2); // mostly completed if old

      await prisma.followUp.create({
        data: {
          leadId: lead.id,
          counsellorId: counsellor.id,
          scheduledAt: followUpDate,
          type: type as any,
          completed: completed,
          completedAt: completed ? new Date(followUpDate.getTime() + 3600000) : null,
          outcome: completed ? 'INTERESTED' : null,
          notes: completed ? 'Had a good discussion.' : null
        }
      });
      
      if (completed) {
         await prisma.activity.create({
            data: { leadId: lead.id, userId: counsellor.id, action: 'FOLLOW_UP_COMPLETED', description: `Completed ${type} follow-up.`, createdAt: followUpDate }
         });
      }
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
