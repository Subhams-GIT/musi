-- AlterTable
ALTER TABLE "public"."Stream" ADD COLUMN     "largeThumbnail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "smallThumbnail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';
