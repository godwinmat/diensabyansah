-- CreateEnum
CREATE TYPE "InboxMessageSource" AS ENUM ('CHAT', 'CONTACT');

-- CreateTable
CREATE TABLE "InboxMessage" (
    "id" TEXT NOT NULL,
    "source" "InboxMessageSource" NOT NULL DEFAULT 'CHAT',
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InboxMessage_source_idx" ON "InboxMessage"("source");

-- CreateIndex
CREATE INDEX "InboxMessage_email_idx" ON "InboxMessage"("email");

-- CreateIndex
CREATE INDEX "InboxMessage_createdAt_idx" ON "InboxMessage"("createdAt");
