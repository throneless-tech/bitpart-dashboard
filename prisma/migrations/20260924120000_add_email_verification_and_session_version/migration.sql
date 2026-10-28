-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "pendingEmail" TEXT,
ADD COLUMN     "sessionVersion" INTEGER NOT NULL DEFAULT 0;
