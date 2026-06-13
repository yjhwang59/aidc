CREATE TYPE "CourseCohortStatus" AS ENUM ('DRAFT', 'OPEN', 'FULL', 'CLOSED', 'COMPLETED', 'CANCELLED');

CREATE TYPE "CourseEnrollmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'WAITLISTED', 'COMPLETED');

CREATE TABLE "CourseProgram" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT,
    "durationWeeks" INTEGER NOT NULL DEFAULT 8,
    "sessionDurationMin" INTEGER NOT NULL DEFAULT 120,
    "capacity" INTEGER NOT NULL DEFAULT 12,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseProgram_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseCohort" (
    "id" TEXT NOT NULL,
    "courseProgramId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "registrationDeadline" TIMESTAMP(3),
    "capacity" INTEGER NOT NULL DEFAULT 12,
    "status" "CourseCohortStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseCohort_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseSession" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "status" "CourseEnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "message" TEXT,
    "adminNote" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseProgram_slug_key" ON "CourseProgram"("slug");
CREATE INDEX "CourseProgram_isActive_sortOrder_idx" ON "CourseProgram"("isActive", "sortOrder");
CREATE INDEX "CourseCohort_courseProgramId_status_idx" ON "CourseCohort"("courseProgramId", "status");
CREATE INDEX "CourseCohort_startsAt_idx" ON "CourseCohort"("startsAt");
CREATE INDEX "CourseCohort_status_idx" ON "CourseCohort"("status");
CREATE UNIQUE INDEX "CourseSession_cohortId_weekNumber_key" ON "CourseSession"("cohortId", "weekNumber");
CREATE INDEX "CourseSession_cohortId_startAt_idx" ON "CourseSession"("cohortId", "startAt");
CREATE INDEX "CourseEnrollment_cohortId_status_idx" ON "CourseEnrollment"("cohortId", "status");
CREATE INDEX "CourseEnrollment_email_idx" ON "CourseEnrollment"("email");
CREATE INDEX "CourseEnrollment_createdAt_idx" ON "CourseEnrollment"("createdAt");

ALTER TABLE "CourseCohort" ADD CONSTRAINT "CourseCohort_courseProgramId_fkey" FOREIGN KEY ("courseProgramId") REFERENCES "CourseProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseSession" ADD CONSTRAINT "CourseSession_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "CourseCohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "CourseCohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
