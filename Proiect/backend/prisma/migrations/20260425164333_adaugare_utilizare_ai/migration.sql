-- CreateTable
CREATE TABLE "AiUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiUsage_userId_idx" ON "AiUsage"("userId");

-- CreateIndex
CREATE INDEX "AiUsage_dateKey_idx" ON "AiUsage"("dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "AiUsage_userId_dateKey_key" ON "AiUsage"("userId", "dateKey");

-- AddForeignKey
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
