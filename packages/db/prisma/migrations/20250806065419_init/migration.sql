-- CreateEnum
CREATE TYPE "public"."StreamType" AS ENUM ('Youtube', 'Spotify');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('Streamer', 'Voter');

-- CreateEnum
CREATE TYPE "public"."Provider" AS ENUM ('Google');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "provider" "public"."Provider" NOT NULL,
    "role" "public"."Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stream" (
    "id" TEXT NOT NULL,
    "type" "public"."StreamType" NOT NULL,
    "active" BOOLEAN NOT NULL,
    "upvotes" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "extractedId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Upvote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streamId" TEXT NOT NULL,

    CONSTRAINT "Upvote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Upvote_userId_streamId_key" ON "public"."Upvote"("userId", "streamId");

-- AddForeignKey
ALTER TABLE "public"."Stream" ADD CONSTRAINT "Stream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Upvote" ADD CONSTRAINT "Upvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
