-- CreateTable
CREATE TABLE "SiteTheme" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "bg" TEXT NOT NULL DEFAULT '#02121F',
    "card" TEXT NOT NULL DEFAULT '#0a2a4a',
    "gold" TEXT NOT NULL DEFAULT '#c9a24c',
    "goldlight" TEXT NOT NULL DEFAULT '#e7d19a',
    "cream" TEXT NOT NULL DEFAULT '#f3eee5',
    "gray1" TEXT NOT NULL DEFAULT '#949399',
    "gray2" TEXT NOT NULL DEFAULT '#5f5f65',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteTheme_pkey" PRIMARY KEY ("id")
);
