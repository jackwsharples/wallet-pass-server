-- Unguessable per-pass token encoded in the wallet pass QR code (/verify/:token)
ALTER TABLE "DiscountCode" ADD COLUMN "verifyToken" TEXT;

CREATE UNIQUE INDEX "DiscountCode_verifyToken_key" ON "DiscountCode"("verifyToken");
