/*
  Warnings:

  - You are about to drop the column `authorId` on the `Bot` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `Bot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bot" DROP CONSTRAINT "Bot_authorId_fkey";

-- AlterTable
ALTER TABLE "Bot" DROP COLUMN "authorId",
ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Bot" ADD CONSTRAINT "Bot_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
