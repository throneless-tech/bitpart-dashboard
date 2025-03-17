/*
  Warnings:

  - You are about to drop the column `adminPhones` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "adminPhones" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "adminPhones";
