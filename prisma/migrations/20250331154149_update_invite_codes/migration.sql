-- DropIndex
DROP INDEX "InviteCode_code_key";

-- AlterTable
ALTER TABLE "InviteCode" ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false;
