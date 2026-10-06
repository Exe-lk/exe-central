/*
  Warnings:

  - A unique constraint covering the columns `[sequence_no]` on the table `projects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OutsourcingMode" AS ENUM ('INDIVIDUAL', 'GROUP');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "country" TEXT,
ADD COLUMN     "drive_folder_id" TEXT,
ADD COLUMN     "sequence_no" SERIAL NOT NULL;

-- CreateTable
CREATE TABLE "company_bank_details" (
    "id" UUID NOT NULL,
    "account_no" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "swift_code" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "branch_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "company_bank_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outsourcing_projects" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "mode" "OutsourcingMode" NOT NULL,

    CONSTRAINT "outsourcing_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outsourcing_participants" (
    "id" UUID NOT NULL,
    "outsourcingProjectId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "outsourcing_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "package_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_milestones" (
    "id" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "template_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_packages" (
    "id" UUID NOT NULL,
    "outsourcingProjectId" UUID NOT NULL,
    "templateId" UUID,
    "name" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "project_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outsourcing_milestones" (
    "id" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "due_date" DATE,
    "order" INTEGER NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "outsourcing_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outsourcing_additional_costs" (
    "id" UUID NOT NULL,
    "outsourcingProjectId" UUID NOT NULL,
    "participantId" UUID,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "outsourcing_additional_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "participantId" UUID,
    "milestoneId" UUID,
    "proposal_no" TEXT,
    "invoice_no" TEXT NOT NULL,
    "cost_estimation_no" TEXT,
    "client_name" TEXT NOT NULL,
    "client_company" TEXT,
    "country" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'LKR',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "payment_note" TEXT,
    "bank_account_no" TEXT,
    "bank_account_name" TEXT,
    "bank_swift_code" TEXT,
    "bank_name" TEXT,
    "bank_branch" TEXT,
    "bank_address" TEXT,
    "bank_country" TEXT,
    "drive_file_id" TEXT,
    "drive_file_url" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issued_date" DATE,
    "due_date" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_date" DATE NOT NULL,
    "method" TEXT NOT NULL,
    "reference_no" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_proofs" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "drive_file_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "url" TEXT,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "receipt_no" TEXT NOT NULL,
    "drive_file_id" TEXT,
    "drive_file_url" TEXT,
    "generated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_items" (
    "id" UUID NOT NULL,
    "receiptId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "outsourcing_projects_projectId_key" ON "outsourcing_projects"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "outsourcing_participants_outsourcingProjectId_code_key" ON "outsourcing_participants"("outsourcingProjectId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "project_packages_outsourcingProjectId_key" ON "project_packages"("outsourcingProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_no_key" ON "invoices"("invoice_no");

-- CreateIndex
CREATE UNIQUE INDEX "payments_invoiceId_key" ON "payments"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_proofs_paymentId_key" ON "payment_proofs"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_paymentId_key" ON "receipts"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_receipt_no_key" ON "receipts"("receipt_no");

-- CreateIndex
CREATE UNIQUE INDEX "projects_sequence_no_key" ON "projects"("sequence_no");

-- AddForeignKey
ALTER TABLE "outsourcing_projects" ADD CONSTRAINT "outsourcing_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outsourcing_participants" ADD CONSTRAINT "outsourcing_participants_outsourcingProjectId_fkey" FOREIGN KEY ("outsourcingProjectId") REFERENCES "outsourcing_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_milestones" ADD CONSTRAINT "template_milestones_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "package_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_packages" ADD CONSTRAINT "project_packages_outsourcingProjectId_fkey" FOREIGN KEY ("outsourcingProjectId") REFERENCES "outsourcing_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outsourcing_milestones" ADD CONSTRAINT "outsourcing_milestones_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "project_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outsourcing_additional_costs" ADD CONSTRAINT "outsourcing_additional_costs_outsourcingProjectId_fkey" FOREIGN KEY ("outsourcingProjectId") REFERENCES "outsourcing_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outsourcing_additional_costs" ADD CONSTRAINT "outsourcing_additional_costs_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "outsourcing_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "outsourcing_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "outsourcing_milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_items" ADD CONSTRAINT "receipt_items_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
