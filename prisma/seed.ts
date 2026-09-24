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

  console.log("Generating 100 leads...");
  for(let i=0; i<100; i++) {
    const fn = names[Math.floor(Math.random() * names.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const course = courses[Math.floor(Math.random() * courses.length)];
    const counsellor = counsellors[Math.floor(Math.random() * counsellors.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Random date within last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

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

    // Add some activities
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        userId: admin.id,
        action: 'CREATED',
        description: `Lead created manually`,
        createdAt: date
      }
    });
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
