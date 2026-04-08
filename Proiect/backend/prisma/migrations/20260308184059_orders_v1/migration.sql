/*
  Warnings:

  - You are about to drop the column `brandSnapshot` on the `OrderItems` table. All the data in the column will be lost.
  - You are about to drop the column `categorySnapshot` on the `OrderItems` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrlSnapshot` on the `OrderItems` table. All the data in the column will be lost.
  - You are about to drop the column `nameSnapshot` on the `OrderItems` table. All the data in the column will be lost.
  - You are about to drop the column `shippingRon` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `tvaRon` on the `Orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderNumber]` on the table `Orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `brand` to the `OrderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `OrderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lineTotalRon` to the `OrderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `OrderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerEmail` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderNumber` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingCity` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingCounty` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vatRon` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('COURIER_STANDARD', 'COURIER_EXPRESS', 'EASYBOX');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'CASH_ON_DELIVERY');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PROCESSING';

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_userId_fkey";

-- AlterTable
ALTER TABLE "OrderItems" DROP COLUMN "brandSnapshot",
DROP COLUMN "categorySnapshot",
DROP COLUMN "imageUrlSnapshot",
DROP COLUMN "nameSnapshot",
ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lineTotalRon" INTEGER NOT NULL,
ADD COLUMN     "productName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "shippingRon",
DROP COLUMN "tvaRon",
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "easyboxCity" TEXT,
ADD COLUMN     "easyboxLockerId" TEXT,
ADD COLUMN     "easyboxLockerName" TEXT,
ADD COLUMN     "orderNumber" TEXT NOT NULL,
ADD COLUMN     "paymentFeeRon" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CARD',
ADD COLUMN     "shippingCity" TEXT NOT NULL,
ADD COLUMN     "shippingCountry" TEXT NOT NULL DEFAULT 'RO',
ADD COLUMN     "shippingCounty" TEXT NOT NULL,
ADD COLUMN     "shippingFeeRon" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shippingMethod" "ShippingMethod" NOT NULL DEFAULT 'COURIER_STANDARD',
ADD COLUMN     "shippingPostalCode" TEXT,
ADD COLUMN     "shippingStreet" TEXT,
ADD COLUMN     "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.21,
ADD COLUMN     "vatRon" INTEGER NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "OrderItems_orderId_idx" ON "OrderItems"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_orderNumber_key" ON "Orders"("orderNumber");

-- CreateIndex
CREATE INDEX "Orders_userId_idx" ON "Orders"("userId");

-- CreateIndex
CREATE INDEX "Orders_status_idx" ON "Orders"("status");

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
