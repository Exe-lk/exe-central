// import * as bcrypt from 'bcryptjs';
// import { prisma } from './prisma';

// export async function verifyCredentials(username: string, password: string) {
//   try {
//     const user = await prisma.user.findFirst({
//       where: {
//         OR: [
//           { username },
//           { email: username },
//         ],
//       },
//     });

//     if (!user) {
//       return null;
//     }

//     const isValidPassword = await bcrypt.compare(password, user.password);

//     if (!isValidPassword) {
//       return null;
//     }

//     // Return user without password
//     const { password: _, ...userWithoutPassword } = user;
//     return userWithoutPassword;
//   } catch (error) {
//     console.error('Error verifying credentials:', error);
//     return null;  }
// }

// export function generateSessionToken() {
//   return Math.random().toString(36).substring(2) + Date.now().toString(36);
// }
