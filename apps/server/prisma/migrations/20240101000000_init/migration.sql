-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'lobby',
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "isHost" BOOLEAN NOT NULL DEFAULT false,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "scoreTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "videoType" TEXT NOT NULL,
    "videoId" TEXT,
    "videoUrl" TEXT,
    "durationSec" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parlay" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "normalizedText" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "scoreRaw" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreFinal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "legsHit" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Parlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "normalizedText" TEXT NOT NULL,
    "tVideoSec" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marker" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "tVideoSec" DOUBLE PRECISION NOT NULL,
    "note" TEXT,

    CONSTRAINT "Marker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfirmedEvent" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "normalizedText" TEXT NOT NULL,
    "tVideoSec" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "awardedTo" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfirmedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WheelEntry" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "submittedByPlayerId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WheelEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PunishmentSpin" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "loserPlayerId" TEXT NOT NULL,
    "selectedEntryId" TEXT NOT NULL,
    "entriesJson" JSONB NOT NULL,
    "commitSeed" TEXT NOT NULL,
    "revealSeed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PunishmentSpin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_code_key" ON "Room"("code");

-- CreateIndex
CREATE INDEX "Room_code_idx" ON "Room"("code");

-- CreateIndex
CREATE INDEX "Room_hostId_idx" ON "Room"("hostId");

-- CreateIndex
CREATE INDEX "Player_roomId_idx" ON "Player"("roomId");

-- CreateIndex
CREATE INDEX "Round_roomId_idx" ON "Round"("roomId");

-- CreateIndex
CREATE INDEX "Round_roomId_index_idx" ON "Round"("roomId", "index");

-- CreateIndex
CREATE INDEX "Parlay_roundId_idx" ON "Parlay"("roundId");

-- CreateIndex
CREATE INDEX "Parlay_playerId_idx" ON "Parlay"("playerId");

-- CreateIndex
CREATE INDEX "Parlay_normalizedText_idx" ON "Parlay"("normalizedText");

-- CreateIndex
CREATE INDEX "Vote_roundId_idx" ON "Vote"("roundId");

-- CreateIndex
CREATE INDEX "Vote_playerId_idx" ON "Vote"("playerId");

-- CreateIndex
CREATE INDEX "Vote_normalizedText_idx" ON "Vote"("normalizedText");

-- CreateIndex
CREATE INDEX "Vote_roundId_tVideoSec_idx" ON "Vote"("roundId", "tVideoSec");

-- CreateIndex
CREATE INDEX "Marker_roundId_idx" ON "Marker"("roundId");

-- CreateIndex
CREATE INDEX "Marker_tVideoSec_idx" ON "Marker"("tVideoSec");

-- CreateIndex
CREATE INDEX "ConfirmedEvent_roundId_idx" ON "ConfirmedEvent"("roundId");

-- CreateIndex
CREATE INDEX "ConfirmedEvent_normalizedText_idx" ON "ConfirmedEvent"("normalizedText");

-- CreateIndex
CREATE INDEX "WheelEntry_roundId_idx" ON "WheelEntry"("roundId");

-- CreateIndex
CREATE INDEX "WheelEntry_status_idx" ON "WheelEntry"("status");

-- CreateIndex
CREATE INDEX "PunishmentSpin_roundId_idx" ON "PunishmentSpin"("roundId");

-- CreateIndex
CREATE INDEX "PunishmentSpin_loserPlayerId_idx" ON "PunishmentSpin"("loserPlayerId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parlay" ADD CONSTRAINT "Parlay_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parlay" ADD CONSTRAINT "Parlay_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marker" ADD CONSTRAINT "Marker_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marker" ADD CONSTRAINT "Marker_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmedEvent" ADD CONSTRAINT "ConfirmedEvent_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WheelEntry" ADD CONSTRAINT "WheelEntry_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WheelEntry" ADD CONSTRAINT "WheelEntry_submittedByPlayerId_fkey" FOREIGN KEY ("submittedByPlayerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PunishmentSpin" ADD CONSTRAINT "PunishmentSpin_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PunishmentSpin" ADD CONSTRAINT "PunishmentSpin_loserPlayerId_fkey" FOREIGN KEY ("loserPlayerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

