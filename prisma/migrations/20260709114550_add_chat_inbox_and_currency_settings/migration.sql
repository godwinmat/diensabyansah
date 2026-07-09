-- CreateEnum
CREATE TYPE "ChatMessageSender" AS ENUM ('VISITOR', 'ADMIN');

-- AlterTable
ALTER TABLE "CompanyProfile"
ADD COLUMN "currencyCode" TEXT DEFAULT 'XAF',
ADD COLUMN "currencySymbol" TEXT DEFAULT 'FCFA';

-- CreateTable
CREATE TABLE "ChatConversation" (
	"id" TEXT NOT NULL,
	"name" TEXT,
	"email" TEXT NOT NULL,
	"phone" TEXT NOT NULL,
	"status" TEXT NOT NULL DEFAULT 'OPEN',
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
	"id" TEXT NOT NULL,
	"conversationId" TEXT NOT NULL,
	"sender" "ChatMessageSender" NOT NULL,
	"body" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatConversation_email_idx" ON "ChatConversation"("email");

-- CreateIndex
CREATE INDEX "ChatConversation_status_idx" ON "ChatConversation"("status");

-- CreateIndex
CREATE INDEX "ChatConversation_updatedAt_idx" ON "ChatConversation"("updatedAt");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
