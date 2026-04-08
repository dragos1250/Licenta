-- CreateIndex
CREATE INDEX "ProductAnswers_questionId_isPublished_createdAt_idx" ON "ProductAnswers"("questionId", "isPublished", "createdAt");

-- CreateIndex
CREATE INDEX "ProductImages_productId_isPrimary_idx" ON "ProductImages"("productId", "isPrimary");

-- CreateIndex
CREATE INDEX "ProductQuestions_productId_isPublished_createdAt_idx" ON "ProductQuestions"("productId", "isPublished", "createdAt");

-- CreateIndex
CREATE INDEX "ProductReviews_productId_isPublished_createdAt_idx" ON "ProductReviews"("productId", "isPublished", "createdAt");

-- CreateIndex
CREATE INDEX "Products_isActive_idx" ON "Products"("isActive");
