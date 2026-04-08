-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED');

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT,
    "priceRon" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItems" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceRon" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotalRon" INTEGER NOT NULL,
    "tvaRon" INTEGER NOT NULL,
    "shippingRon" INTEGER NOT NULL,
    "totalRon" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItems" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "nameSnapshot" TEXT NOT NULL,
    "brandSnapshot" TEXT NOT NULL,
    "categorySnapshot" TEXT NOT NULL,
    "imageUrlSnapshot" TEXT,
    "unitPriceRon" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "OrderItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Carts_userId_key" ON "Carts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItems_cartId_productId_key" ON "CartItems"("cartId", "productId");

-- AddForeignKey
ALTER TABLE "Carts" ADD CONSTRAINT "Carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
