-- CreateTable
CREATE TABLE "VideoQueue" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "videoType" TEXT NOT NULL,
    "videoId" TEXT,
    "videoUrl" TEXT,
    "title" TEXT,
    "addedBy" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoQueue_roomId_idx" ON "VideoQueue"("roomId");

-- CreateIndex
CREATE INDEX "VideoQueue_roomId_order_idx" ON "VideoQueue"("roomId", "order");

-- AddForeignKey
ALTER TABLE "VideoQueue" ADD CONSTRAINT "VideoQueue_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

