/*
  Warnings:

  - You are about to drop the column `fileUid` on the `Files` table. All the data in the column will be lost.
  - Added the required column `minioFileName` to the `Files` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Files_fileUid_bucketUid_fileSize_status_notified_idx";

-- AlterTable
ALTER TABLE "Files" DROP COLUMN "fileUid",
ADD COLUMN     "minioFileName" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Files_minioFileName_bucketUid_fileSize_status_notified_idx" ON "Files"("minioFileName", "bucketUid", "fileSize", "status", "notified");
