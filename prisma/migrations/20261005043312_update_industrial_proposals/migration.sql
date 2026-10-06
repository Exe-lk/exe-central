/*
  Warnings:

  - Changed the type of `content` on the `proposal_sections` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'FINAL', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentPlanType" AS ENUM ('PERCENTAGE', 'FIXED');

-- DropForeignKey
ALTER TABLE "proposals" DROP CONSTRAINT "proposals_projectId_fkey";

-- AlterTable
ALTER TABLE "proposal_pricing_items" ADD COLUMN     "is_included" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "quantity" DECIMAL(12,2) NOT NULL DEFAULT 1,
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "unit_price" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "proposal_sections" ADD COLUMN     "is_included" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "proposals" ADD COLUMN     "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "proposal_maintenance_items" (
    "id" UUID NOT NULL,
    "proposalId" UUID NOT NULL,
    "maintenance_type" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "frequency" TEXT,
    "minimum_duration" TEXT,
    "start_period" TEXT,
    "is_included" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,

    CONSTRAINT "proposal_maintenance_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_hosting_items" (
    "id" UUID NOT NULL,
    "proposalId" UUID NOT NULL,
    "provider" TEXT,
    "option" TEXT,
    "features" JSONB,
    "cost" DECIMAL(12,2) NOT NULL,
    "billing_period" TEXT,
    "client_owned" BOOLEAN NOT NULL DEFAULT false,
    "deployment_info" TEXT,
    "is_included" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,

    CONSTRAINT "proposal_hosting_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_third_party_items" (
    "id" UUID NOT NULL,
    "proposalId" UUID NOT NULL,
    "service" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "pricing_period" TEXT,
    "responsibility" TEXT,
    "notes" TEXT,
    "is_included" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,

    CONSTRAINT "proposal_third_party_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_change_request_items" (
    "id" UUID NOT NULL,
    "proposalId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "rate" DECIMAL(12,2) NOT NULL,
    "unit" TEXT,
    "notes" TEXT,
    "is_included" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,

    CONSTRAINT "proposal_change_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_payment_plans" (
    "id" UUID NOT NULL,
    "proposalId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PaymentPlanType" NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "proposal_payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_payment_plan_items" (
    "id" UUID NOT NULL,
    "paymentPlanId" UUID NOT NULL,
    "stage" TEXT NOT NULL,
    "description" TEXT,
    "percentage" DECIMAL(7,2),
    "amount" DECIMAL(12,2),
    "timing" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "proposal_payment_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proposal_maintenance_items_proposalId_order_idx" ON "proposal_maintenance_items"("proposalId", "order");

-- CreateIndex
CREATE INDEX "proposal_hosting_items_proposalId_order_idx" ON "proposal_hosting_items"("proposalId", "order");

-- CreateIndex
CREATE INDEX "proposal_third_party_items_proposalId_order_idx" ON "proposal_third_party_items"("proposalId", "order");

-- CreateIndex
CREATE INDEX "proposal_change_request_items_proposalId_order_idx" ON "proposal_change_request_items"("proposalId", "order");

-- CreateIndex
CREATE INDEX "proposal_payment_plans_proposalId_order_idx" ON "proposal_payment_plans"("proposalId", "order");

-- CreateIndex
CREATE INDEX "proposal_payment_plan_items_paymentPlanId_order_idx" ON "proposal_payment_plan_items"("paymentPlanId", "order");

-- CreateIndex
CREATE INDEX "proposal_pricing_items_proposalId_category_order_idx" ON "proposal_pricing_items"("proposalId", "category", "order");

-- CreateIndex
CREATE INDEX "proposal_sections_proposalId_order_idx" ON "proposal_sections"("proposalId", "order");

-- CreateIndex
CREATE INDEX "proposal_timeline_items_proposalId_order_idx" ON "proposal_timeline_items"("proposalId", "order");

-- CreateIndex
CREATE INDEX "proposals_projectId_status_idx" ON "proposals"("projectId", "status");

-- CreateIndex
CREATE INDEX "proposals_projectId_created_at_idx" ON "proposals"("projectId", "created_at");

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_maintenance_items" ADD CONSTRAINT "proposal_maintenance_items_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_hosting_items" ADD CONSTRAINT "proposal_hosting_items_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_third_party_items" ADD CONSTRAINT "proposal_third_party_items_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_change_request_items" ADD CONSTRAINT "proposal_change_request_items_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_payment_plans" ADD CONSTRAINT "proposal_payment_plans_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_payment_plan_items" ADD CONSTRAINT "proposal_payment_plan_items_paymentPlanId_fkey" FOREIGN KEY ("paymentPlanId") REFERENCES "proposal_payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
