-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "UserAddresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "recipientName" TEXT,
    "phone" TEXT,
    "country" TEXT NOT NULL DEFAULT 'RO',
    "county" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "postalCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAddresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAddresses_userId_idx" ON "UserAddresses"("userId");

-- CreateIndex
CREATE INDEX "UserAddresses_userId_isDefault_idx" ON "UserAddresses"("userId", "isDefault");

-- AddForeignKey
ALTER TABLE "UserAddresses" ADD CONSTRAINT "UserAddresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
