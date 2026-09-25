// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcryptjs';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('Starting seeding...');

//   // Create default admin user
//   const adminPassword = await bcrypt.hash('admin123', 10);
//   const admin = await prisma.user.upsert({
//     where: { email: 'admin@exe.lk' },
//     update: {},
//     create: {
//       email: 'admin@exe.lk',
//       username: 'admin',
//       password: adminPassword,
//       name: 'Admin User',
//       role: 'admin',
//     },
//   });

//   console.log('Created admin user:', admin);

//   // Create default regular user
//   const userPassword = await bcrypt.hash('user123', 10);
//   const user = await prisma.user.upsert({
//     where: { email: 'user@exe.lk' },
//     update: {},
//     create: {
//       email: 'user@exe.lk',
//       username: 'user',
//       password: userPassword,
//       name: 'Regular User',
//       role: 'user',
//     },
//   });

//   console.log('Created regular user:', user);

//   console.log('Seeding completed!');
// }

// main()
//   .catch((e) => {
//     console.error('Error during seeding:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
