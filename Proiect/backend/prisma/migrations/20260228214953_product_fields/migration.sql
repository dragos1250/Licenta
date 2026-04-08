-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "originalPriceRon" INTEGER,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reviews" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Products_category_idx" ON "Products"("category");

-- CreateIndex
CREATE INDEX "Products_brand_idx" ON "Products"("brand");

-- CreateIndex
CREATE INDEX "Products_priceRon_idx" ON "Products"("priceRon");

-- CreateIndex
CREATE INDEX "Products_rating_idx" ON "Products"("rating");
