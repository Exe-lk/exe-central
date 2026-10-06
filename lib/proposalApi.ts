import { Prisma, PricingCategory, PaymentPlanType, ProposalStatus } from '@prisma/client';

export const VALID_PRICING_CATEGORIES = Object.values(PricingCategory);
export const VALID_PAYMENT_PLAN_TYPES = Object.values(PaymentPlanType);
export const VALID_PROPOSAL_STATUSES = Object.values(ProposalStatus);

type AnyRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is AnyRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function parseStrictBoolean(value: unknown, field: string, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'boolean') throw new Error(`${field} must be a boolean`);
  return value;
}

export function parseOrder(value: unknown, fallback: number, field: string): number {
  const order = value === undefined ? fallback : value;
  if (typeof order !== 'number' || !Number.isInteger(order) || order < 1) {
    throw new Error(`${field} must be a positive integer`);
  }
  return order;
}

export function parseRequiredString(value: unknown, field: string, maxLength = 500): string {
  if (typeof value !== 'string') throw new Error(`${field} must be a string`);
  const result = value.trim();
  if (!result) throw new Error(`${field} is required`);
  if (result.length > maxLength) throw new Error(`${field} exceeds the maximum length of ${maxLength}`);
  return result;
}

export function parseOptionalString(value: unknown, field: string, maxLength = 500): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new Error(`${field} must be a string`);
  const result = value.trim();
  if (result.length > maxLength) throw new Error(`${field} exceeds the maximum length of ${maxLength}`);
  return result || null;
}

// Financial values are parsed directly from strings to Prisma.Decimal.
// This avoids converting money through JavaScript Number.
export function parseMoney(value: unknown, field: string, required = true): Prisma.Decimal | null {
  if (value === undefined || value === null || value === '') {
    if (!required) return null;
    throw new Error(`${field} is required`);
  }

  const raw = typeof value === 'number' ? String(value) : value;
  if (typeof raw !== 'string' || !/^(0|[0-9]+)(\.[0-9]{1,2})?$/.test(raw.trim())) {
    throw new Error(`${field} must be a non-negative decimal with up to 2 decimal places`);
  }

  const decimal = new Prisma.Decimal(raw);
  if (decimal.isNegative()) throw new Error(`${field} must be non-negative`);
  return decimal;
}

export function parseDateOnly(value: unknown, field: string, nullable = true): Date | null {
  if (value === undefined || value === null || value === '') {
    if (nullable) return null;
    throw new Error(`${field} is required`);
  }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${field} must use YYYY-MM-DD format`);
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`${field} is not a valid calendar date`);
  }
  return date;
}

function validateUniqueOrders(items: Array<{ order: number }>, label: string) {
  const orders = items.map((item) => item.order);
  if (new Set(orders).size !== orders.length) {
    throw new Error(`${label} order values must be unique`);
  }
}

export function parseSections(input: unknown): Prisma.ProposalSectionCreateWithoutProposalInput[] {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input)) throw new Error('sections must be an array');

  const items = input.map((raw, index) => {
    if (!isRecord(raw)) throw new Error(`Invalid section at index ${index}`);
    const title = parseRequiredString(raw.title, `sections[${index}].title`);
    if (!isRecord(raw.content) && !Array.isArray(raw.content)) {
      throw new Error(`sections[${index}].content must be structured JSON`);
    }
    return {
      title,
      content: raw.content as Prisma.InputJsonValue,
      isIncluded: parseStrictBoolean(raw.isIncluded, `sections[${index}].isIncluded`, true),
      order: parseOrder(raw.order, index + 1, `sections[${index}].order`),
    };
  });
  validateUniqueOrders(items, 'sections');
  return items;
}

export function parsePricingItems(input: unknown): Prisma.ProposalPricingItemCreateWithoutProposalInput[] {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input)) throw new Error('pricingItems must be an array');

  const items = input.map((raw, index) => {
    if (!isRecord(raw)) throw new Error(`Invalid pricing item at index ${index}`);
    const category = raw.category;
    if (typeof category !== 'string' || !VALID_PRICING_CATEGORIES.includes(category as PricingCategory)) {
      throw new Error(`pricingItems[${index}].category is invalid`);
    }
    return {
      category: category as PricingCategory,
      title: parseRequiredString(raw.title, `pricingItems[${index}].title`),
      description: parseOptionalString(raw.description, `pricingItems[${index}].description`, 5000),
      quantity: parseMoney(raw.quantity ?? '1', `pricingItems[${index}].quantity`)!,
      unit: parseOptionalString(raw.unit, `pricingItems[${index}].unit`),
      unitPrice: parseMoney(raw.unitPrice, `pricingItems[${index}].unitPrice`, false),
      amount: parseMoney(raw.amount, `pricingItems[${index}].amount`)!,
      billingFrequency: parseOptionalString(raw.billingFrequency, `pricingItems[${index}].billingFrequency`),
      isOptional: parseStrictBoolean(raw.isOptional, `pricingItems[${index}].isOptional`, false),
      isIncluded: parseStrictBoolean(raw.isIncluded, `pricingItems[${index}].isIncluded`, true),
      order: parseOrder(raw.order, index + 1, `pricingItems[${index}].order`),
    };
  });
  validateUniqueOrders(items, 'pricingItems');
  return items;
}

export function parseMaintenanceItems(input: unknown): Prisma.ProposalMaintenanceItemCreateWithoutProposalInput[] {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input)) throw new Error('maintenanceItems must be an array');
  const items = input.map((raw, index) => {
    if (!isRecord(raw)) throw new Error(`Invalid maintenance item at index ${index}`);
    return {
      maintenanceType: parseRequiredString(raw.maintenanceType, `maintenanceItems[${index}].maintenanceType`),
      description: parseOptionalString(raw.description, `maintenanceItems[${index}].description`, 5000),
      amount: parseMoney(raw.amount, `maintenanceItems[${index}].amount`)!,
      frequency: parseOptionalString(raw.frequency, `maintenanceItems[${index}].frequency`),
      minimumDuration: parseOptionalString(raw.minimumDuration, `maintenanceItems[${index}].minimumDuration`),
      startPeriod: parseOptionalString(raw.startPeriod, `maintenanceItems[${index}].startPeriod`),
      isIncluded: parseStrictBoolean(raw.isIncluded, `maintenanceItems[${index}].isIncluded`, true),
      order: parseOrder(raw.order, index + 1, `maintenanceItems[${index}].order`),
    };
  });
  validateUniqueOrders(items, 'maintenanceItems');
  return items;
}

export function parseHostingItems(input: unknown): Prisma.ProposalHostingItemCreateWithoutProposalInput[] {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input)) throw new Error('hostingItems must be an array');
  const items = input.map((raw, index) => {
    if (!isRecord(raw)) throw new Error(`Invalid hosting item at index ${index}`);
    const features = raw.features;
    if (features !== undefined && features !== null && !isRecord(features) && !Array.isArray(features)) {
      throw new Error(`hostingItems[${index}].features must be structured JSON`);
    }
    return {
      provider: parseOptionalString(raw.provider, `hostingItems[${index}].provider`),
      option: parseOptionalString(raw.option, `hostingItems[${index}].option`),
      features: features === undefined || features === null ? undefined : features as Prisma.InputJsonValue,
      cost: parseMoney(raw.cost, `hostingItems[${index}].cost`)!,
      billingPeriod: parseOptionalString(raw.billingPeriod, `hostingItems[${index}].billingPeriod`),
      clientOwned: parseStrictBoolean(raw.clientOwned, `hostingItems[${index}].clientOwned`, false),
      deploymentInfo: parseOptionalString(raw.deploymentInfo, `hostingItems[${index}].deploymentInfo`, 5000),
      isIncluded: parseStrictBoolean(raw.isIncluded, `hostingItems[${index}].isIncluded`, true),
      order: parseOrder(raw.order, index + 1, `hostingItems[${index}].order`),
    };
  });
  validateUniqueOrders(items, 'hostingItems');
  return items;
}

export function parseThirdPartyItems(input: unknown): Prisma.ProposalThirdPartyItemCreateWithoutProposalInput[] {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input)) throw new Error('thirdPartyItems must be an array');
  const items = input.map((raw, index) => {
    if (!isRecord(raw)) throw new Error(`Invalid third-party item at index ${index}`);
    return {
      service: parseRequiredString(raw.service, `thirdPartyItems[${index}].service`),
      description: parseOptionalString(raw.description, `thirdPartyItems[${index}].description`, 5000),
      amount: parseMoney(raw.amount, `thirdPartyItems[${index}].amount`)!,
      pricingPeriod: parseOptionalString(raw.pricingPeriod, `thirdPartyItems[${index}].pricingPeriod`),
      responsibility: parseOptionalString(raw.responsibility, `thirdPartyItems[${index}].responsibility`),
      notes: parseOptionalString(raw.notes, `thirdPartyItems[${index}].notes`, 5000),
      isIncluded: parseStrictBoolean(raw.isIncluded, `thirdPartyItems[${index}].isIncluded`, true),
      order: parseOrder(raw.order, index + 1, `thirdPartyItems[${index}].order`),
    };
  });
  validateUniqueOrders(items, 'thirdPartyItems');
  return items;
}

export function parseChangeRequestItems(input: unknown): Prisma.ProposalChangeRequestItemCreateWithoutProposalInput[] {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input)) throw new Error('changeRequestItems must be an array');
  const items = input.map((raw, index) => {
    if (!isRecord(raw)) throw new Error(`Invalid change request item at index ${index}`);
    return {
      description: parseRequiredString(raw.description, `changeRequestItems[${index}].description`, 5000),
      rate: parseMoney(raw.rate, `changeRequestItems[${index}].rate`)!,
      unit: parseOptionalString(raw.unit, `changeRequestItems[${index}].unit`),
      notes: parseOptionalString(raw.notes, `changeRequestItems[${index}].notes`, 5000),
      isIncluded: parseStrictBoolean(raw.isIncluded, `changeRequestItems[${index}].isIncluded`, true),
      order: parseOrder(raw.order, index + 1, `changeRequestItems[${index}].order`),
    };
  });
  validateUniqueOrders(items, 'changeRequestItems');
  return items;
}

export function parseTimelineItems(input: unknown): Prisma.ProposalTimelineItemCreateWithoutProposalInput[] {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input)) throw new Error('timelineItems must be an array');
  const items = input.map((raw, index) => {
    if (!isRecord(raw)) throw new Error(`Invalid timeline item at index ${index}`);
    return {
      phaseName: parseRequiredString(raw.phaseName, `timelineItems[${index}].phaseName`),
      duration: parseRequiredString(raw.duration, `timelineItems[${index}].duration`),
      order: parseOrder(raw.order, index + 1, `timelineItems[${index}].order`),
    };
  });
  validateUniqueOrders(items, 'timelineItems');
  return items;
}

export function parsePaymentPlans(input: unknown) {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input)) throw new Error('paymentPlans must be an array');

  return input.map((raw, planIndex) => {
    if (!isRecord(raw)) throw new Error(`Invalid payment plan at index ${planIndex}`);
    const type = raw.type;
    if (typeof type !== 'string' || !VALID_PAYMENT_PLAN_TYPES.includes(type as PaymentPlanType)) {
      throw new Error(`paymentPlans[${planIndex}].type is invalid`);
    }
    if (!Array.isArray(raw.items)) throw new Error(`paymentPlans[${planIndex}].items must be an array`);

    const items = raw.items.map((itemRaw, itemIndex) => {
      if (!isRecord(itemRaw)) throw new Error(`Invalid payment plan item at ${planIndex}:${itemIndex}`);
      const percentage = parseMoney(itemRaw.percentage, `paymentPlans[${planIndex}].items[${itemIndex}].percentage`, false);
      const amount = parseMoney(itemRaw.amount, `paymentPlans[${planIndex}].items[${itemIndex}].amount`, false);

      if (percentage && percentage.gt(100)) {
        throw new Error(`paymentPlans[${planIndex}].items[${itemIndex}].percentage must be between 0 and 100`);
      }

      if (type === PaymentPlanType.PERCENTAGE && !percentage) {
        throw new Error(`Percentage payment plan item ${planIndex}:${itemIndex} requires percentage`);
      }
      if (type === PaymentPlanType.FIXED && !amount) {
        throw new Error(`Fixed payment plan item ${planIndex}:${itemIndex} requires amount`);
      }
      if (type === PaymentPlanType.PERCENTAGE && amount) {
        throw new Error(`Percentage payment plan item ${planIndex}:${itemIndex} must not provide amount`);
      }
      if (type === PaymentPlanType.FIXED && percentage) {
        throw new Error(`Fixed payment plan item ${planIndex}:${itemIndex} must not provide percentage`);
      }

      return {
        stage: parseRequiredString(itemRaw.stage, `paymentPlans[${planIndex}].items[${itemIndex}].stage`),
        description: parseOptionalString(itemRaw.description, `paymentPlans[${planIndex}].items[${itemIndex}].description`, 5000),
        percentage,
        amount,
        timing: parseOptionalString(itemRaw.timing, `paymentPlans[${planIndex}].items[${itemIndex}].timing`),
        order: parseOrder(itemRaw.order, itemIndex + 1, `paymentPlans[${planIndex}].items[${itemIndex}].order`),
      };
    });

    validateUniqueOrders(items, `paymentPlans[${planIndex}].items`);

    if (type === PaymentPlanType.PERCENTAGE) {
      const totalPercentage = items.reduce(
        (sum, item) => sum.plus(item.percentage ?? 0),
        new Prisma.Decimal(0)
      );
      if (!totalPercentage.eq(100)) {
        throw new Error(`paymentPlans[${planIndex}] percentage stages must total exactly 100`);
      }
    }

    return {
      name: parseRequiredString(raw.name, `paymentPlans[${planIndex}].name`),
      type: type as PaymentPlanType,
      order: parseOrder(raw.order, planIndex + 1, `paymentPlans[${planIndex}].order`),
      items: { create: items },
    };
  });
}

export const proposalInclude = {
  project: true,
  sections: { orderBy: { order: 'asc' as const } },
  pricingItems: { orderBy: { order: 'asc' as const } },
  maintenanceItems: { orderBy: { order: 'asc' as const } },
  hostingItems: { orderBy: { order: 'asc' as const } },
  thirdPartyItems: { orderBy: { order: 'asc' as const } },
  changeRequestItems: { orderBy: { order: 'asc' as const } },
  timelineItems: { orderBy: { order: 'asc' as const } },
  paymentPlans: {
    orderBy: { order: 'asc' as const },
    include: { items: { orderBy: { order: 'asc' as const } } },
  },
} satisfies Prisma.ProposalInclude;

export function parseProposalStatus(value: unknown, current: ProposalStatus = ProposalStatus.DRAFT): ProposalStatus {
  if (value === undefined) return current;
  if (typeof value !== 'string' || !VALID_PROPOSAL_STATUSES.includes(value as ProposalStatus)) {
    throw new Error(`status must be one of: ${VALID_PROPOSAL_STATUSES.join(', ')}`);
  }
  return value as ProposalStatus;
}
