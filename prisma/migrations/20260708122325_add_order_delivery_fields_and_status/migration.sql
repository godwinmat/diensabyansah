-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('AWAITING_PAYMENT', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" JSONB,
ADD COLUMN     "deliveryContactName" TEXT,
ADD COLUMN     "deliveryNotes" TEXT,
ADD COLUMN     "deliveryPhone" TEXT,
ADD COLUMN     "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
ADD COLUMN     "deliveryUpdatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Order_deliveryStatus_idx" ON "Order"("deliveryStatus");
