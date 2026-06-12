CREATE TYPE "MemberStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'DISABLED', 'BLACKLISTED', 'DELETED');
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'LINE');

CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MemberOAuthAccount" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberOAuthAccount_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Booking" ADD COLUMN "memberId" TEXT;

CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
CREATE INDEX "Member_status_idx" ON "Member"("status");
CREATE INDEX "Member_createdAt_idx" ON "Member"("createdAt");
CREATE UNIQUE INDEX "MemberOAuthAccount_provider_providerAccountId_key" ON "MemberOAuthAccount"("provider", "providerAccountId");
CREATE INDEX "MemberOAuthAccount_memberId_idx" ON "MemberOAuthAccount"("memberId");
CREATE INDEX "Booking_memberId_idx" ON "Booking"("memberId");

ALTER TABLE "MemberOAuthAccount" ADD CONSTRAINT "MemberOAuthAccount_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
