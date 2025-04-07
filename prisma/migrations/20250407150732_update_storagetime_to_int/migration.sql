/*
  Warnings:

  - The `storageTime` column on the `Bot` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Bot" DROP COLUMN "storageTime",
ADD COLUMN     "storageTime" INTEGER;
