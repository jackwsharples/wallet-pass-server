-- CreateEnum
CREATE TYPE "DiscountCodeStatus" AS ENUM ('UNUSED', 'USED');

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "email" TEXT,
    "status" "DiscountCodeStatus" NOT NULL DEFAULT 'UNUSED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_stripeSessionId_key" ON "DiscountCode"("stripeSessionId");

-- CreateIndex
CREATE INDEX "DiscountCode_stripeSessionId_idx" ON "DiscountCode"("stripeSessionId");
