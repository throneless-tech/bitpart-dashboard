-- move from next-auth to better auth, keeping every user, password and bot.
-- everyone is logged out: the old sessions were JWTs and aren't carried over.

-- 1. new user columns
ALTER TABLE "User"
ADD COLUMN "name" TEXT,
ADD COLUMN "image" TEXT,
ADD COLUMN "emailVerifiedFlag" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User"
SET "name" = "username",
    "emailVerifiedFlag" = "emailVerified" IS NOT NULL;

ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "User" DROP COLUMN "emailVerified";
ALTER TABLE "User" RENAME COLUMN "emailVerifiedFlag" TO "emailVerified";

-- 2. better auth looks emails up in lowercase. sign-up and email changes
-- refused case-insensitive duplicates, so this can't collide; stop rather
-- than merge accounts if it somehow does.
DO $$
BEGIN
  IF EXISTS (
    SELECT lower("email") FROM "User"
    WHERE "email" IS NOT NULL
    GROUP BY lower("email")
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'two users have the same email apart from case; resolve this before migrating';
  END IF;
END $$;

UPDATE "User" SET "email" = lower("email") WHERE "email" IS NOT NULL;
UPDATE "User" SET "pendingEmail" = lower("pendingEmail") WHERE "pendingEmail" IS NOT NULL;

-- accounts without an email get a unique placeholder (never verified)
UPDATE "User"
SET "email" = gen_random_uuid()::text || '@no-email.invalid',
    "emailVerified" = false
WHERE "email" IS NULL;

ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

-- 3. replace the unused auth.js tables (JWT sessions, no OAuth)
DROP TABLE "Account";
DROP TABLE "Session";
DROP TABLE "VerificationToken";

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");
CREATE UNIQUE INDEX "RateLimit_key_key" ON "RateLimit"("key");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. one credential account per user, keeping the bcrypt hash
INSERT INTO "Account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'credential', "id", "password", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "User";

-- 5. now on the credential account / replaced by database sessions
ALTER TABLE "User" DROP COLUMN "password";
ALTER TABLE "User" DROP COLUMN "sessionVersion";
