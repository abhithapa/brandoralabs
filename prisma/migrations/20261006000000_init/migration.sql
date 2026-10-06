-- Release 1a initial schema.
-- Written to match prisma/schema.prisma. CI runs `prisma migrate diff` against the
-- schema to fail the build if the two ever drift (see .github/workflows/ci.yml).

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('not_sure', 'business_consulting', 'digital_marketing', 'branding_creative', 'website_software_development', 'ai_automation', 'cloud_it_solutions', 'cybersecurity', 'digital_transformation', 'other');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('email', 'phone', 'whatsapp', 'online_meeting');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'qualified', 'in_progress', 'closed_won', 'closed_lost', 'spam', 'archived');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('professional', 'consultant', 'developer', 'agency', 'technology_provider', 'specialized_service_provider', 'other');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('new', 'reviewing', 'approved', 'declined', 'archived');

-- CreateEnum
CREATE TYPE "NotificationTarget" AS ENUM ('lead', 'partner_application');

-- CreateEnum
CREATE TYPE "NotificationTemplate" AS ENUM ('lead_acknowledgement', 'lead_internal_alert', 'partner_acknowledgement', 'partner_internal_alert');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('pending', 'sending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "public_ref" VARCHAR(20) NOT NULL,
    "idempotency_key" UUID NOT NULL,
    "payload_hash" CHAR(64) NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "company" VARCHAR(160),
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(32),
    "category" "ServiceCategory" NOT NULL,
    "description" VARCHAR(5000) NOT NULL,
    "budget" VARCHAR(120),
    "contact_method" "ContactMethod" NOT NULL DEFAULT 'email',
    "status" "LeadStatus" NOT NULL DEFAULT 'new',
    "first_contacted_at" TIMESTAMPTZ(3),
    "notice_version" VARCHAR(40) NOT NULL,
    "utm_source" VARCHAR(200),
    "utm_medium" VARCHAR(200),
    "utm_campaign" VARCHAR(200),
    "utm_term" VARCHAR(200),
    "utm_content" VARCHAR(200),
    "landing_path" VARCHAR(300),
    "referrer_domain" VARCHAR(253),
    "submitted_from_path" VARCHAR(300),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_applications" (
    "id" UUID NOT NULL,
    "public_ref" VARCHAR(20) NOT NULL,
    "idempotency_key" UUID NOT NULL,
    "payload_hash" CHAR(64) NOT NULL,
    "contact_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "organization" VARCHAR(160),
    "phone" VARCHAR(32),
    "provider_type" "ProviderType" NOT NULL,
    "expertise" "ServiceCategory"[],
    "website_url" VARCHAR(2048),
    "capabilities" VARCHAR(5000) NOT NULL,
    "status" "PartnerStatus" NOT NULL DEFAULT 'new',
    "notice_version" VARCHAR(40) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "partner_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_outbox" (
    "id" UUID NOT NULL,
    "target_type" "NotificationTarget" NOT NULL,
    "target_id" UUID NOT NULL,
    "template" "NotificationTemplate" NOT NULL,
    "recipient" VARCHAR(254) NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "next_attempt_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked_until" TIMESTAMPTZ(3),
    "last_error_code" VARCHAR(64),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMPTZ(3),

    CONSTRAINT "notification_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_buckets" (
    "key" CHAR(64) NOT NULL,
    "window_start" TIMESTAMPTZ(3) NOT NULL,
    "count" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_public_ref_key" ON "leads"("public_ref");

-- CreateIndex
CREATE UNIQUE INDEX "leads_idempotency_key_key" ON "leads"("idempotency_key");

-- CreateIndex
CREATE INDEX "leads_created_at_id_idx" ON "leads"("created_at" DESC, "id");

-- CreateIndex
CREATE INDEX "leads_status_created_at_idx" ON "leads"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "leads_category_created_at_idx" ON "leads"("category", "created_at" DESC);

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partner_applications_public_ref_key" ON "partner_applications"("public_ref");

-- CreateIndex
CREATE UNIQUE INDEX "partner_applications_idempotency_key_key" ON "partner_applications"("idempotency_key");

-- CreateIndex
CREATE INDEX "partner_applications_created_at_id_idx" ON "partner_applications"("created_at" DESC, "id");

-- CreateIndex
CREATE INDEX "partner_applications_status_created_at_idx" ON "partner_applications"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notification_outbox_status_next_attempt_at_idx" ON "notification_outbox"("status", "next_attempt_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_outbox_target_type_target_id_template_recipie_key" ON "notification_outbox"("target_type", "target_id", "template", "recipient");

-- CreateIndex
CREATE INDEX "rate_limit_buckets_expires_at_idx" ON "rate_limit_buckets"("expires_at");
