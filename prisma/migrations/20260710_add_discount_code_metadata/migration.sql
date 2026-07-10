-- Add metadata (region, gift flag, etc. from the Stripe session) to DiscountCode
ALTER TABLE "DiscountCode" ADD COLUMN "metadata" JSONB;

-- Account page looks up cards by owner email
CREATE INDEX "DiscountCode_email_idx" ON "DiscountCode"("email");
