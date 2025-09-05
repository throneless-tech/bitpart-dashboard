/*
  Warnings:

  - You are about to drop the column `currentInstance` on the `State` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "State" DROP COLUMN "currentInstance",
ADD COLUMN     "lastInstance" TEXT;
