-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "ProductAnswers" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderatedById" TEXT,
ADD COLUMN     "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "rejectionReason" TEXT,
ALTER COLUMN "isPublished" SET DEFAULT false;

-- AlterTable
ALTER TABLE "ProductQuestions" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderatedById" TEXT,
ADD COLUMN     "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "rejectionReason" TEXT,
ALTER COLUMN "isPublished" SET DEFAULT false;

-- AlterTable
ALTER TABLE "ProductReviews" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderatedById" TEXT,
ADD COLUMN     "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "rejectionReason" TEXT,
ALTER COLUMN "isPublished" SET DEFAULT false;

-- CreateIndex
CREATE INDEX "ProductAnswers_moderationStatus_createdAt_idx" ON "ProductAnswers"("moderationStatus", "createdAt");

-- CreateIndex
CREATE INDEX "ProductQuestions_moderationStatus_createdAt_idx" ON "ProductQuestions"("moderationStatus", "createdAt");

-- CreateIndex
CREATE INDEX "ProductReviews_moderationStatus_createdAt_idx" ON "ProductReviews"("moderationStatus", "createdAt");
