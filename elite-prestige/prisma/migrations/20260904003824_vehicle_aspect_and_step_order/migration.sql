-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "imageAspect" TEXT NOT NULL DEFAULT 'video';

-- AlterTable
ALTER TABLE "YachtSettings" ADD COLUMN     "packageStepOrder" INTEGER NOT NULL DEFAULT -1;
