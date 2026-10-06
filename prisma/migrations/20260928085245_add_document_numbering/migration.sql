/*
  Warnings:

  - You are about to alter the column `subtotal` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `discount_amount` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `tax_amount` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `total_amount` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `outsourcing_additional_costs` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `outsourcing_milestones` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `totalAmount` on the `package_templates` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `totalAmount` on the `project_packages` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `discountAmount` on the `project_packages` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `taxAmount` on the `project_packages` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `receipt_items` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `template_milestones` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'RECEIPT', 'QUOTATION', 'COST_ESTIMATION');

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_projectId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_projectId_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_projectId_fkey";

-- DropIndex
DROP INDEX "payments_invoiceId_key";

-- AlterTable
ALTER TABLE "invoices" ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "discount_amount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "tax_amount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "outsourcing_additional_costs" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "outsourcing_milestones" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "package_templates" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "project_packages" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "taxAmount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "receipt_items" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "template_milestones" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- CreateTable
CREATE TABLE "global_document_sequences" (
    "type" "DocumentType" NOT NULL,
    "prefix" TEXT NOT NULL,
    "nextValue" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "global_document_sequences_pkey" PRIMARY KEY ("type")
);

-- CreateTable
CREATE TABLE "project_document_series" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "rootNumber" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_document_series_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_document_series_rootNumber_key" ON "project_document_series"("rootNumber");

-- CreateIndex
CREATE UNIQUE INDEX "project_document_series_projectId_documentType_key" ON "project_document_series"("projectId", "documentType");

-- AddForeignKey
ALTER TABLE "project_document_series" ADD CONSTRAINT "project_document_series_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
