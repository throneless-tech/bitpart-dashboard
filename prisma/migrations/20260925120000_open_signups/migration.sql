-- DropTable
DROP TABLE "InviteCode";

-- CreateTable
CREATE TABLE "SignupAttempt" (
    "id" SERIAL NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SignupAttempt_ipHash_createdAt_idx" ON "SignupAttempt"("ipHash", "createdAt");

