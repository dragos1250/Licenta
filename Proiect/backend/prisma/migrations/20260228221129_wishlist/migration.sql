-- CreateTable
CREATE TABLE "Wishlists" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistItems" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wishlists_userId_name_key" ON "Wishlists"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItems_wishlistId_productId_key" ON "WishlistItems"("wishlistId", "productId");

-- AddForeignKey
ALTER TABLE "Wishlists" ADD CONSTRAINT "Wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItems" ADD CONSTRAINT "WishlistItems_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItems" ADD CONSTRAINT "WishlistItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
