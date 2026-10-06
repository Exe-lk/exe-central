import { Prisma } from '@prisma/client';

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value.trim());
}

export function parseDecimal(value: unknown, fieldName: string): Prisma.Decimal {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName.toUpperCase()}_REQUIRED`);
  }

  try {
    const decimal = new Prisma.Decimal(String(value).trim());
    if (!decimal.isFinite()) throw new Error('INVALID_DECIMAL');
    return decimal;
  } catch {
    throw new Error(`INVALID_${fieldName.toUpperCase()}_DECIMAL`);
  }
}

export function parseNonNegativeDecimal(value: unknown, fieldName: string): Prisma.Decimal {
  const decimal = parseDecimal(value, fieldName);
  if (decimal.lt(0)) throw new Error(`${fieldName.toUpperCase()}_NEGATIVE`);
  return decimal;
}

export function parsePositiveDecimal(value: unknown, fieldName: string): Prisma.Decimal {
  const decimal = parseDecimal(value, fieldName);
  if (decimal.lte(0)) throw new Error(`${fieldName.toUpperCase()}_NOT_POSITIVE`);
  return decimal;
}

export function parseDateOnly(value: unknown, fieldName: string, required = false): Date | null {
  if (value === undefined || value === null || value === '') {
    if (required) throw new Error(`${fieldName.toUpperCase()}_REQUIRED`);
    return null;
  }

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`INVALID_${fieldName.toUpperCase()}`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`INVALID_${fieldName.toUpperCase()}`);
  }

  return date;
}

export function errorResponse(jsonError: Function, error: unknown, fallback: string) {
  if (!(error instanceof Error)) return jsonError(fallback, 500);

  const messages: Record<string, [string, number]> = {
    PROJECT_NOT_FOUND: ['Project not found', 404],
    OUTSOURCING_ONLY: ['This operation is only available for OUTSOURCING projects', 400],
    OUTSOURCING_CONFIG_MISSING: ['Outsourcing configuration is missing for this project', 400],
    PARTICIPANT_NOT_FOUND: ['Participant not found', 404],
    PARTICIPANT_MISMATCH: ['Participant does not belong to this project', 400],
    MILESTONE_NOT_FOUND: ['Milestone not found', 404],
    MILESTONE_MISMATCH: ['Milestone does not belong to this project', 400],
    PACKAGE_NOT_FOUND: ['Project package not found', 404],
    TEMPLATE_NOT_FOUND: ['Package template not found', 404],
    FINANCIAL_LOCK: ['This project cannot be structurally changed because financial processing has already started', 409],
    COST_LOCK: ['Additional costs cannot be changed after an invoice has been created for this project', 409],
    INVOICE_NOT_FOUND: ['Invoice not found', 404],
    INVOICE_NOT_PAYABLE: ['Only pending invoices can receive payments', 409],
    PAYMENT_OVERFLOW: ['Payment amount exceeds the invoice outstanding balance', 400],
    PAYMENT_NOT_FOUND: ['Payment not found', 404],
    PAYMENT_NOT_VERIFIED: ['Payment is not verified', 409],
    RECEIPT_SEQUENCE_NOT_CONFIGURED: ['Receipt document sequence is not configured', 500],
    INVOICE_SEQUENCE_NOT_CONFIGURED: ['Invoice document sequence is not configured', 500],
    INVOICE_ALREADY_PAID: ['Invoice is already fully paid', 409],
    PAYMENT_ALREADY_HAS_RECEIPT: ['A receipt already exists for this payment', 409],
    RECEIPT_NOT_FOUND: ['Receipt not found', 404],
    FILE_REQUIRED: ['A file is required', 400],
    FILE_TOO_LARGE: ['File exceeds the maximum allowed size of 10 MB', 400],
    INVALID_FILE_TYPE: ['Only PDF, JPG, JPEG, and PNG files are allowed', 400],
    NO_DRIVE_FOLDER: ['Project does not have a Google Drive folder configured', 409],
  };

  const mapped = messages[error.message];
  if (mapped) return jsonError(mapped[0], mapped[1]);

  if (error.message.endsWith('_REQUIRED')) return jsonError(`${error.message.replace('_REQUIRED', '').toLowerCase()} is required`, 400);
  if (error.message.includes('_NEGATIVE')) return jsonError(`${error.message.split('_')[0].toLowerCase()} cannot be negative`, 400);
  if (error.message.includes('_NOT_POSITIVE')) return jsonError(`${error.message.split('_')[0].toLowerCase()} must be greater than zero`, 400);
  if (error.message.includes('DECIMAL')) return jsonError('Invalid monetary decimal value', 400);
  if (error.message.startsWith('INVALID_')) return jsonError(`Invalid ${error.message.slice(8).toLowerCase()} value`, 400);

  return jsonError(error.message || fallback, 500);
}

export function assertAllowedDocumentFile(file: File) {
  if (!file || file.size === 0) throw new Error('FILE_REQUIRED');
  if (file.size > 10 * 1024 * 1024) throw new Error('FILE_TOO_LARGE');

  const allowed = new Set(['application/pdf', 'image/jpeg', 'image/png']);
  if (!allowed.has(file.type)) throw new Error('INVALID_FILE_TYPE');
}
