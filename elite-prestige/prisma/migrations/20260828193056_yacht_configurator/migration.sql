-- CreateTable
CREATE TABLE "YachtPackage" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YachtPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YachtOptionCategory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YachtOptionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YachtOptionChoice" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YachtOptionChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YachtOptionCategory_key_key" ON "YachtOptionCategory"("key");

-- AddForeignKey
ALTER TABLE "YachtOptionChoice" ADD CONSTRAINT "YachtOptionChoice_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "YachtOptionCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
