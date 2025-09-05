/*
  Warnings:

  - Added the required column `instance` to the `Bot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "instance" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "currentInstance" TEXT,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);
