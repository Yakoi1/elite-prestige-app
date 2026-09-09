-- CreateTable
CREATE TABLE "YachtSettings" (
    "id" TEXT NOT NULL DEFAULT 'yacht',
    "presentationImageUrl" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YachtSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YachtGalleryImage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YachtGalleryImage_pkey" PRIMARY KEY ("id")
);
