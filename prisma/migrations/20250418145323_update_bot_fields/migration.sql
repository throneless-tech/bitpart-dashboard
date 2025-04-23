/*
  Warnings:

  - A unique constraint covering the columns `[botName]` on the table `Bot` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "maxCodes" INTEGER,
ADD COLUMN     "responseTime" TEXT,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bot_botName_key" ON "Bot"("botName");
