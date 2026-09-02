-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "companyLogo" TEXT,
ADD COLUMN     "companyRating" DOUBLE PRECISION,
ADD COLUMN     "companyResponseCategory" TEXT,
ADD COLUMN     "companyResponseRate" TEXT,
ADD COLUMN     "companyResponseTime" TEXT,
ADD COLUMN     "hiringPeriod" TEXT;
