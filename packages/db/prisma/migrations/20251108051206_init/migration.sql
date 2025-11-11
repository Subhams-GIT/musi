-- CreateEnum
CREATE TYPE "StreamType" AS ENUM ('Youtube', 'Spotify');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Streamer', 'Voter');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('Google');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "type" "StreamType" NOT NULL,
    "active" BOOLEAN NOT NULL,
    "upvotes" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "extractedId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "largeThumbnail" TEXT NOT NULL DEFAULT '',
    "smallThumbnail" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "played" BOOLEAN NOT NULL DEFAULT false,
    "playedTs" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT NOT NULL,
    "spaceId" TEXT,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrentStream" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streamId" TEXT,
    "spaceId" TEXT,

    CONSTRAINT "CurrentStream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "link" TEXT NOT NULL,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upvote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,

    CONSTRAINT "Upvote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_spaceParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_spaceParticipants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStream_streamId_key" ON "CurrentStream"("streamId");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStream_spaceId_key" ON "CurrentStream"("spaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Upvote_userId_streamId_key" ON "Upvote"("userId", "streamId");

-- CreateIndex
CREATE INDEX "_spaceParticipants_B_index" ON "_spaceParticipants"("B");

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_spaceParticipants" ADD CONSTRAINT "_spaceParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_spaceParticipants" ADD CONSTRAINT "_spaceParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
