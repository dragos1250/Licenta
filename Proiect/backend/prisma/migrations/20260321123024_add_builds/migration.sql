-- CreateTable
CREATE TABLE "Builds" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalNetRon" INTEGER NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.21,
    "totalVatRon" INTEGER NOT NULL,
    "totalGrossRon" INTEGER NOT NULL,
    "isCompatible" BOOLEAN NOT NULL DEFAULT true,
    "estimatedSystemPowerW" INTEGER NOT NULL DEFAULT 0,
    "recommendedPsuW" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Builds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildItems" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "productId" TEXT,
    "slotKey" TEXT NOT NULL,
    "slotLabel" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT,
    "unitPriceRon" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuildItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Builds_userId_createdAt_idx" ON "Builds"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BuildItems_buildId_idx" ON "BuildItems"("buildId");

-- CreateIndex
CREATE INDEX "BuildItems_productId_idx" ON "BuildItems"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "BuildItems_buildId_slotKey_key" ON "BuildItems"("buildId", "slotKey");

-- AddForeignKey
ALTER TABLE "Builds" ADD CONSTRAINT "Builds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildItems" ADD CONSTRAINT "BuildItems_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildItems" ADD CONSTRAINT "BuildItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
