-- CreateEnum
CREATE TYPE "TestimonialType" AS ENUM ('TEXT', 'VIDEO');

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TestimonialType" NOT NULL,
    "text" TEXT,
    "videoUrl" TEXT,
    "videoPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Testimonial_userId_idx" ON "Testimonial"("userId");

-- CreateIndex
CREATE INDEX "Testimonial_type_idx" ON "Testimonial"("type");

-- CreateIndex
CREATE INDEX "Testimonial_createdAt_idx" ON "Testimonial"("createdAt");

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
