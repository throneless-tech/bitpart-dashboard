/*
  Warnings:

  - The primary key for the `Bot` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Bot" DROP CONSTRAINT "Bot_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Bot_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Bot_id_seq";
