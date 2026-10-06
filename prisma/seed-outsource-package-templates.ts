import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  {
    name: '01 Month',
    durationMonths: 1,
    totalAmount: new Prisma.Decimal('85000.00'),
    milestones: [
      { name: 'Advance', amount: new Prisma.Decimal('50000.00'), order: 1 },
      { name: 'Completion', amount: new Prisma.Decimal('35000.00'), order: 2 },
    ],
  },
  {
    name: '02 Month',
    durationMonths: 2,
    totalAmount: new Prisma.Decimal('80000.00'),
    milestones: [
      { name: 'Advance', amount: new Prisma.Decimal('20000.00'), order: 1 },
      { name: 'Milestone 1', amount: new Prisma.Decimal('20000.00'), order: 2 },
      { name: 'Completion', amount: new Prisma.Decimal('40000.00'), order: 3 },
    ],
  },
  {
    name: '03 Month',
    durationMonths: 3,
    totalAmount: new Prisma.Decimal('75000.00'),
    milestones: [
      { name: 'Advance', amount: new Prisma.Decimal('12500.00'), order: 1 },
      { name: 'Milestone 1', amount: new Prisma.Decimal('12500.00'), order: 2 },
      { name: 'Milestone 2', amount: new Prisma.Decimal('25000.00'), order: 3 },
      { name: 'Completion', amount: new Prisma.Decimal('25000.00'), order: 4 },
    ],
  },
];

async function main() {
  for (const template of templates) {
    const existing = await prisma.packageTemplate.findFirst({ where: { name: template.name } });
    if (existing) {
      await prisma.templateMilestone.deleteMany({ where: { templateId: existing.id } });
      await prisma.packageTemplate.update({
        where: { id: existing.id },
        data: {
          durationMonths: template.durationMonths,
          totalAmount: template.totalAmount,
          milestones: { create: template.milestones },
        },
      });
    } else {
      await prisma.packageTemplate.create({
        data: {
          name: template.name,
          durationMonths: template.durationMonths,
          totalAmount: template.totalAmount,
          milestones: { create: template.milestones },
        },
      });
    }
  }
}

main().finally(() => prisma.$disconnect());
