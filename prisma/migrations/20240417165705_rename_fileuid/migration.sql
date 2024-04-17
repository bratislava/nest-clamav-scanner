-- DropIndex
DROP INDEX "Files_fileUid_bucketUid_fileSize_status_notified_idx";

-- AlterTable
ALTER TABLE "Files" RENAME COLUMN "fileUid" TO "minioFileName";

-- CreateIndex
CREATE INDEX "Files_minioFileName_bucketUid_fileSize_status_notified_idx" ON "Files"("minioFileName", "bucketUid", "fileSize", "status", "notified");
