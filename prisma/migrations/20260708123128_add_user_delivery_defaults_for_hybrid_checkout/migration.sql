-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deliveryDefaultAddress" JSONB,
ADD COLUMN     "deliveryDefaultContactName" TEXT,
ADD COLUMN     "deliveryDefaultNotes" TEXT,
ADD COLUMN     "deliveryDefaultPhone" TEXT,
ADD COLUMN     "deliveryDefaultUpdatedAt" TIMESTAMP(3);
