-- AlterTable
ALTER TABLE "Round" ADD COLUMN "streamUrl" TEXT;
ALTER TABLE "Round" ADD COLUMN "streamPlatform" TEXT;
ALTER TABLE "Round" ADD COLUMN "streamDelaySec" INTEGER DEFAULT 10;

-- AlterTable
ALTER TABLE "VideoQueue" ADD COLUMN "streamPlatform" TEXT;
