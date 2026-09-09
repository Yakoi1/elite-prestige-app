-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "badgeNew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "badgePromotion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "badgeTrending" BOOLEAN NOT NULL DEFAULT false;
