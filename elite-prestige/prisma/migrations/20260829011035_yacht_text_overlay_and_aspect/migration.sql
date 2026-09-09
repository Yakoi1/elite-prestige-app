-- AlterTable
ALTER TABLE "YachtOptionCategory" ADD COLUMN     "imageAspect" TEXT NOT NULL DEFAULT 'video',
ADD COLUMN     "textColor" TEXT NOT NULL DEFAULT '#f3eee5',
ADD COLUMN     "textFontFamily" TEXT,
ADD COLUMN     "textFontSize" INTEGER NOT NULL DEFAULT 32,
ADD COLUMN     "textItalic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "textPositionX" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "textPositionY" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "YachtSettings" ADD COLUMN     "textBackgroundImageUrl" TEXT NOT NULL DEFAULT '';
