-- CreateTable
CREATE TABLE "SavingAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SavingAccount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavingAccount" ADD CONSTRAINT "SavingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
