-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "cons" JSONB,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "features" JSONB,
ADD COLUMN     "pros" JSONB,
ADD COLUMN     "shortDescription" TEXT;

-- CreateTable
CREATE TABLE "ProductImages" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSpecifications" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSpecifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductReviews" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductReviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductQuestions" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAnswers" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAnswers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductImages_productId_sortOrder_idx" ON "ProductImages"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductSpecifications_productId_sortOrder_idx" ON "ProductSpecifications"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductReviews_productId_createdAt_idx" ON "ProductReviews"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductReviews_productId_rating_idx" ON "ProductReviews"("productId", "rating");

-- CreateIndex
CREATE INDEX "ProductReviews_userId_idx" ON "ProductReviews"("userId");

-- CreateIndex
CREATE INDEX "ProductQuestions_productId_createdAt_idx" ON "ProductQuestions"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductQuestions_userId_idx" ON "ProductQuestions"("userId");

-- CreateIndex
CREATE INDEX "ProductAnswers_questionId_createdAt_idx" ON "ProductAnswers"("questionId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductAnswers_userId_idx" ON "ProductAnswers"("userId");

-- AddForeignKey
ALTER TABLE "ProductImages" ADD CONSTRAINT "ProductImages_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecifications" ADD CONSTRAINT "ProductSpecifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReviews" ADD CONSTRAINT "ProductReviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReviews" ADD CONSTRAINT "ProductReviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductQuestions" ADD CONSTRAINT "ProductQuestions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductQuestions" ADD CONSTRAINT "ProductQuestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAnswers" ADD CONSTRAINT "ProductAnswers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ProductQuestions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAnswers" ADD CONSTRAINT "ProductAnswers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
