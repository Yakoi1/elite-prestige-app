-- AlterTable
ALTER TABLE "CompanyAccount" ADD COLUMN     "taxRatePercent" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "clientPhone" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "imageUrl2" TEXT,
ADD COLUMN     "imageUrl3" TEXT,
ADD COLUMN     "imageUrl4" TEXT;

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "driverLicenseImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountingArchive" (
    "id" TEXT NOT NULL,
    "totalRevenue" INTEGER NOT NULL,
    "totalPurchaseCost" INTEGER NOT NULL,
    "totalCustomCost" INTEGER NOT NULL,
    "totalExpenses" INTEGER NOT NULL,
    "taxRatePercent" DOUBLE PRECISION NOT NULL,
    "taxAmount" INTEGER NOT NULL,
    "netResult" INTEGER NOT NULL,
    "bankBalanceBefore" INTEGER NOT NULL,
    "bankBalanceAfter" INTEGER NOT NULL,
    "invoiceCount" INTEGER NOT NULL,
    "closedByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountingArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedInvoice" (
    "id" TEXT NOT NULL,
    "archiveId" TEXT NOT NULL,
    "vehicleName" TEXT NOT NULL,
    "categoryLabel" TEXT NOT NULL,
    "vehicleUuid" TEXT,
    "licensePlate" TEXT,
    "duration" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "clientName" TEXT,
    "clientPhone" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchivedInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedExpense" (
    "id" TEXT NOT NULL,
    "archiveId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchivedExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_name_phone_key" ON "Client"("name", "phone");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivedInvoice" ADD CONSTRAINT "ArchivedInvoice_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "AccountingArchive"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivedExpense" ADD CONSTRAINT "ArchivedExpense_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "AccountingArchive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
