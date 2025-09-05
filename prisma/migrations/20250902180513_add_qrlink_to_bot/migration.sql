/*
  Warnings:

  - Added the required column `qrLink` to the `Bot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "qrLink" TEXT NOT NULL;
