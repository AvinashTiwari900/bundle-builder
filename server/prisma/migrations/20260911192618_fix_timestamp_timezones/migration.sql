-- These columns were created as `timestamp` (no time zone). Every value in
-- them was already written as a UTC instant (Prisma/JS Date always operate in
-- UTC) - only the column's *type* failed to say so, which is why clients like
-- pgAdmin displayed the raw UTC digits as if they were local wall-clock time.
--
-- The bare `ALTER COLUMN ... SET DATA TYPE TIMESTAMPTZ` cast Postgres would
-- generate by default reinterprets the naive value using the CURRENT SESSION
-- timezone (this server defaults to Asia/Calcutta, UTC+5:30) - applied here,
-- that would silently shift every existing timestamp by 5:30 and corrupt the
-- data. Explicitly reinterpreting `AT TIME ZONE 'UTC'` (the zone the values
-- are actually already in) instead relabels them correctly with no shift.

-- AlterTable
ALTER TABLE "Application"
  ALTER COLUMN "interviewDate" TYPE TIMESTAMPTZ(3) USING "interviewDate" AT TIME ZONE 'UTC',
  ALTER COLUMN "appliedDate" TYPE TIMESTAMPTZ(3) USING "appliedDate" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "CandidateProfile"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Connection"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Document"
  ALTER COLUMN "uploadedAt" TYPE TIMESTAMPTZ(3) USING "uploadedAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Job"
  ALTER COLUMN "postedDate" TYPE TIMESTAMPTZ(3) USING "postedDate" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Meeting"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Notification"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Portfolio"
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Post"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "PostComment"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Project"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Resume"
  ALTER COLUMN "uploadedAt" TYPE TIMESTAMPTZ(3) USING "uploadedAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "User"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';
