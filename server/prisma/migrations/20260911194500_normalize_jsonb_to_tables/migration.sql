-- Normalizes several JSONB array columns into real child tables with
-- foreign keys, so they can be queried/filtered/joined directly instead of
-- scanned as opaque blobs. Existing data is backfilled from the JSON arrays
-- before the old columns are dropped. Every row gets a fresh generated id
-- (source JSON element ids were only ever unique within one array - e.g. the
-- frontend's mock seed data reuses literal ids like "edu-1" across every
-- candidate's education list - so they aren't safe as a global primary key);
-- original timestamps are preserved where the source JSON had a real one.

-- ============ 1. CREATE TABLES ============

CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT,
    "fieldOfStudy" TEXT,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "grade" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT,
    "location" TEXT,
    "workType" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "skillsUsed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PostLink" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PostLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PostMedia" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "size" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PostMedia_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MeetingNote" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MeetingActionItem" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "assignee" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MeetingActionItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MeetingTranscriptEntry" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "speaker" TEXT NOT NULL,
    "speakerRole" TEXT,
    "text" TEXT NOT NULL,
    "timestamp" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingTranscriptEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MeetingChatMessage" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "senderId" TEXT,
    "senderName" TEXT,
    "text" TEXT NOT NULL,
    "timestamp" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Education_candidateId_idx" ON "Education"("candidateId");
CREATE INDEX "Experience_candidateId_idx" ON "Experience"("candidateId");
CREATE INDEX "PostLink_postId_idx" ON "PostLink"("postId");
CREATE INDEX "PostMedia_postId_idx" ON "PostMedia"("postId");
CREATE INDEX "MeetingNote_meetingId_idx" ON "MeetingNote"("meetingId");
CREATE INDEX "MeetingActionItem_meetingId_idx" ON "MeetingActionItem"("meetingId");
CREATE INDEX "MeetingTranscriptEntry_meetingId_idx" ON "MeetingTranscriptEntry"("meetingId");
CREATE INDEX "MeetingChatMessage_meetingId_idx" ON "MeetingChatMessage"("meetingId");

ALTER TABLE "Education" ADD CONSTRAINT "Education_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostLink" ADD CONSTRAINT "PostLink_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetingNote" ADD CONSTRAINT "MeetingNote_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetingActionItem" ADD CONSTRAINT "MeetingActionItem_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetingTranscriptEntry" ADD CONSTRAINT "MeetingTranscriptEntry_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetingChatMessage" ADD CONSTRAINT "MeetingChatMessage_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============ 2. BACKFILL existing JSON array data into the new tables ============

INSERT INTO "Education" (id, "candidateId", institution, degree, "fieldOfStudy", "startYear", "endYear", grade, "order")
SELECT
  gen_random_uuid()::text,
  cp."userId",
  COALESCE(elem->>'institution', ''),
  elem->>'degree',
  elem->>'fieldOfStudy',
  NULLIF(elem->>'startYear', '')::int,
  NULLIF(elem->>'endYear', '')::int,
  elem->>'grade',
  (ord - 1)::int
FROM "CandidateProfile" cp
CROSS JOIN LATERAL jsonb_array_elements(cp.education) WITH ORDINALITY AS x(elem, ord);

INSERT INTO "Experience" (id, "candidateId", company, position, location, "workType", "startDate", "endDate", "isCurrent", description, "skillsUsed", "order")
SELECT
  gen_random_uuid()::text,
  cp."userId",
  COALESCE(elem->>'company', ''),
  elem->>'position',
  elem->>'location',
  elem->>'workType',
  elem->>'startDate',
  elem->>'endDate',
  COALESCE((elem->>'isCurrent')::boolean, false),
  elem->>'description',
  COALESCE((SELECT array_agg(x2.value #>> '{}') FROM jsonb_array_elements(elem->'skillsUsed') AS x2), ARRAY[]::text[]),
  (ord - 1)::int
FROM "CandidateProfile" cp
CROSS JOIN LATERAL jsonb_array_elements(cp.experience) WITH ORDINALITY AS x(elem, ord);

INSERT INTO "PostLink" (id, "postId", label, url, "order")
SELECT
  gen_random_uuid()::text,
  p.id,
  COALESCE(elem->>'label', ''),
  COALESCE(elem->>'url', ''),
  (ord - 1)::int
FROM "Post" p
CROSS JOIN LATERAL jsonb_array_elements(p.links) WITH ORDINALITY AS x(elem, ord);

INSERT INTO "PostMedia" (id, "postId", type, url, name, size, "order")
SELECT
  gen_random_uuid()::text,
  p.id,
  COALESCE(elem->>'type', 'image'),
  COALESCE(elem->>'url', ''),
  elem->>'name',
  NULLIF(elem->>'size', '')::int,
  (ord - 1)::int
FROM "Post" p
CROSS JOIN LATERAL jsonb_array_elements(p.media) WITH ORDINALITY AS x(elem, ord);

INSERT INTO "MeetingNote" (id, "meetingId", "timestamp", author, text, "createdAt")
SELECT
  gen_random_uuid()::text,
  m.id,
  COALESCE(elem->>'timestamp', ''),
  COALESCE(elem->>'author', ''),
  COALESCE(elem->>'text', ''),
  CASE WHEN elem->>'createdAt' ~ '^\d{4}-\d{2}-\d{2}' THEN (elem->>'createdAt')::timestamptz ELSE now() END
FROM "Meeting" m
CROSS JOIN LATERAL jsonb_array_elements(m.notes) AS elem;

INSERT INTO "MeetingActionItem" (id, "meetingId", assignee, task, done, "order")
SELECT
  gen_random_uuid()::text,
  m.id,
  COALESCE(elem->>'assignee', ''),
  COALESCE(elem->>'task', ''),
  COALESCE((elem->>'done')::boolean, false),
  (ord - 1)::int
FROM "Meeting" m
CROSS JOIN LATERAL jsonb_array_elements(m."actionItems") WITH ORDINALITY AS x(elem, ord);

INSERT INTO "MeetingTranscriptEntry" (id, "meetingId", speaker, "speakerRole", text, "timestamp", "createdAt")
SELECT
  gen_random_uuid()::text,
  m.id,
  COALESCE(elem->>'speaker', ''),
  elem->>'speakerRole',
  COALESCE(elem->>'text', ''),
  elem->>'timestamp',
  now() + (ord * interval '1 millisecond')
FROM "Meeting" m
CROSS JOIN LATERAL jsonb_array_elements(m.transcript) WITH ORDINALITY AS x(elem, ord);

INSERT INTO "MeetingChatMessage" (id, "meetingId", "senderId", "senderName", text, "timestamp", "createdAt")
SELECT
  gen_random_uuid()::text,
  m.id,
  elem->>'senderId',
  elem->>'senderName',
  COALESCE(elem->>'text', ''),
  elem->>'timestamp',
  CASE WHEN elem->>'timestamp' ~ '^\d{4}-\d{2}-\d{2}' THEN (elem->>'timestamp')::timestamptz ELSE now() + (ord * interval '1 millisecond') END
FROM "Meeting" m
CROSS JOIN LATERAL jsonb_array_elements(m.chats) WITH ORDINALITY AS x(elem, ord);

-- ============ 3. DROP the old JSON columns now that data has been migrated ============

ALTER TABLE "CandidateProfile" DROP COLUMN "education", DROP COLUMN "experience";
ALTER TABLE "Meeting" DROP COLUMN "actionItems", DROP COLUMN "chats", DROP COLUMN "notes", DROP COLUMN "transcript";
ALTER TABLE "Post" DROP COLUMN "links", DROP COLUMN "media";
