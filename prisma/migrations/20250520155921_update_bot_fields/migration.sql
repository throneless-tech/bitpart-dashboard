/*
  Warnings:

  - A unique constraint covering the columns `[bitpartId]` on the table `Bot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bitpartId` to the `Bot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Bot_botName_key";

-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "bitpartId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bot_bitpartId_key" ON "Bot"("bitpartId");
