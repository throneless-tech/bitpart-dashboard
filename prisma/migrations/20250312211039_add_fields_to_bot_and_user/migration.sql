/*
  Warnings:

  - You are about to drop the column `content` on the `Bot` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Bot` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Bot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bot" DROP COLUMN "content",
DROP COLUMN "published",
ADD COLUMN     "activationInstructions" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "faq" JSONB[],
ADD COLUMN     "helpInstructions" TEXT,
ADD COLUMN     "locations" JSONB[],
ADD COLUMN     "plans" JSONB[],
ADD COLUMN     "problems" JSONB[],
ADD COLUMN     "referral" TEXT,
ADD COLUMN     "storageAccess" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vpnName" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminPhones" TEXT[];
