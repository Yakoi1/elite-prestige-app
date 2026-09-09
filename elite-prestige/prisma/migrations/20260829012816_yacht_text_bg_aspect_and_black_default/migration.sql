-- AlterTable
ALTER TABLE "YachtOptionCategory" ALTER COLUMN "textColor" SET DEFAULT '#000000';

-- AlterTable
ALTER TABLE "YachtSettings" ADD COLUMN     "textBackgroundAspect" TEXT NOT NULL DEFAULT 'video';
