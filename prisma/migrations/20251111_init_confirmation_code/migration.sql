-- CreateEnum
CREATE TYPE "ConfirmationStatus" AS ENUM ('UNUSED', 'USED', 'VOID');

-- CreateTable
CREATE TABLE "ConfirmationCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "ConfirmationStatus" NOT NULL DEFAULT 'UNUSED',
    "customerEmail" TEXT,
    "stripePaymentId" TEXT,
    "stripeSessionId" VARCHAR(255),
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "redeemAuditIp" TEXT,
    "redeemAuditUa" TEXT,

    CONSTRAINT "ConfirmationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmationCode_code_key" ON "ConfirmationCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmationCode_stripePaymentId_key" ON "ConfirmationCode"("stripePaymentId");

-- CreateIndex
CREATE INDEX "ConfirmationCode_stripeSessionId_idx" ON "ConfirmationCode"("stripeSessionId");

