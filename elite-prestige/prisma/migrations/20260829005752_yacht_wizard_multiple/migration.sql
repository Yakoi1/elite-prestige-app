-- AlterTable
ALTER TABLE "YachtOptionCategory" ADD COLUMN     "multiple" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "YachtOptionChoice" ADD COLUMN     "price" INTEGER;
