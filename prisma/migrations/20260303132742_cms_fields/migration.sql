-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "img" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "img" TEXT NOT NULL DEFAULT '';
