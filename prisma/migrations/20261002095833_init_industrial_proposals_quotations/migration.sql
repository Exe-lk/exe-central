-- CreateEnum
CREATE TYPE "PricingCategory" AS ENUM ('BASE_COST', 'OPTIONAL_PRODUCT', 'OPTIONAL_SERVICE', 'AMC', 'HOSTING', 'THIRD_PARTY');

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "quotationId" UUID;

-- CreateTable
CREATE TABLE "industrial_projects" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,

    CONSTRAINT "industrial_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "valid_until" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_sections" (
    "id" UUID NOT NULL,
    "proposalId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "proposal_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_pricing_items" (
    "id" UUID NOT NULL,
    "proposalId" UUID NOT NULL,
    "category" "PricingCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "billing_frequency" TEXT,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "proposal_pricing_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_timeline_items" (
    "id" UUID NOT NULL,
    "proposalId" UUID NOT NULL,
    "phase_name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "proposal_timeline_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "proposalId" UUID,
    "quotation_no" TEXT NOT NULL,
    "valid_until" DATE,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_items" (
    "id" UUID NOT NULL,
    "quotationId" UUID NOT NULL,
    "category" "PricingCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "billing_frequency" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "industrial_projects_projectId_key" ON "industrial_projects"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quotation_no_key" ON "quotations"("quotation_no");

-- AddForeignKey
ALTER TABLE "industrial_projects" ADD CONSTRAINT "industrial_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_sections" ADD CONSTRAINT "proposal_sections_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_pricing_items" ADD CONSTRAINT "proposal_pricing_items_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_timeline_items" ADD CONSTRAINT "proposal_timeline_items_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
