-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "EpisodeLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EpisodeLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EpisodeLike_episodeId_idx" ON "EpisodeLike"("episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "EpisodeLike_userId_episodeId_key" ON "EpisodeLike"("userId", "episodeId");

-- AddForeignKey
ALTER TABLE "EpisodeLike" ADD CONSTRAINT "EpisodeLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeLike" ADD CONSTRAINT "EpisodeLike_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
