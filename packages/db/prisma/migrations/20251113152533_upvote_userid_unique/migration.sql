/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Upvote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Upvote_userId_streamId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Upvote_userId_key" ON "Upvote"("userId");
