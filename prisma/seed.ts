import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 2. Initialize Default EXE.lk Bank Details
  const defaultBank = await prisma.companyBankDetail.findFirst({
    where: { isDefault: true }
  });

  if (!defaultBank) {
    await prisma.companyBankDetail.create({
      data: {
        accountNo: '1000661376',
        accountName: 'EXE.LK (PVT) LTD',
        swiftCode: 'CCEYLKLX',
        bankName: 'Commercial Bank',
        branchName: 'Homagama',
        address: '289/9A, 5th Lane, Kulasiri Kumarage Mawatha, Katuwana, Homagama.',
        country: 'Sri Lanka',
        isDefault: true,
      }
    });
    console.log('✅ Default EXE.lk bank details seeded.');
  }

  // 3. (Optional) Initialize default 01, 02, 03 Month Package Templates here later

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });