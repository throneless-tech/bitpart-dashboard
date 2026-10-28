-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifyBotIssues" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "challengeToken" TEXT,
ADD COLUMN     "lastLinkStatus" TEXT,
ADD COLUMN     "lastSendStatus" TEXT;

-- CreateTable
CREATE TABLE "BotAlert" (
    "id" SERIAL NOT NULL,
    "botId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "lastSentAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollerLease" (
    "name" TEXT NOT NULL,
    "holder" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PollerLease_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "BotAlert_botId_kind_key" ON "BotAlert"("botId", "kind");

-- AddForeignKey
ALTER TABLE "BotAlert" ADD CONSTRAINT "BotAlert_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

