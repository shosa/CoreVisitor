import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@corevisitor.com' },
    update: {},
    create: {
      email: 'admin@corevisitor.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'CoreVisitor',
      role: 'admin',
    },
  });

  // Create default receptionist
  const receptionistPassword = await bcrypt.hash('reception123', 10);

  const receptionist = await prisma.user.upsert({
    where: { email: 'reception@corevisitor.com' },
    update: {},
    create: {
      email: 'reception@corevisitor.com',
      password: receptionistPassword,
      firstName: 'Reception',
      lastName: 'Desk',
      role: 'receptionist',
    },
  });

  // Create sample departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Amministrazione' },
      update: {},
      create: {
        name: 'Amministrazione',
        description: 'Ufficio amministrativo',
      },
    }),
    prisma.department.upsert({
      where: { name: 'IT' },
      update: {},
      create: {
        name: 'IT',
        description: 'Dipartimento Informatica',
      },
    }),
    prisma.department.upsert({
      where: { name: 'Vendite' },
      update: {},
      create: {
        name: 'Vendite',
        description: 'Dipartimento commerciale',
      },
    }),
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user: admin@corevisitor.com / admin123');
  console.log('👤 Receptionist user: reception@corevisitor.com / reception123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });