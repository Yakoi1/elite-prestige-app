/*
  Warnings:

  - A unique constraint covering the columns `[licensePlate]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vehicleUuid]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "customPrice" INTEGER,
ADD COLUMN     "licensePlate" TEXT,
ADD COLUMN     "price3d" INTEGER,
ADD COLUMN     "price7d" INTEGER,
ADD COLUMN     "purchasePrice" INTEGER,
ADD COLUMN     "vehicleUuid" TEXT;

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT,
    "vehicleName" TEXT NOT NULL,
    "categoryLabel" TEXT NOT NULL,
    "vehicleUuid" TEXT,
    "licensePlate" TEXT,
    "duration" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdById" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAccount" (
    "id" TEXT NOT NULL DEFAULT 'company',
    "bankBalance" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicleUuid_key" ON "Vehicle"("vehicleUuid");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
