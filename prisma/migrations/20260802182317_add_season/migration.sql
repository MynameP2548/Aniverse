/*
  Warnings:

  - A unique constraint covering the columns `[animeId,seasonId,episodeNumber]` on the table `Episode` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Episode_seasonId_episodeNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "Episode_animeId_seasonId_episodeNumber_key" ON "Episode"("animeId", "seasonId", "episodeNumber");
