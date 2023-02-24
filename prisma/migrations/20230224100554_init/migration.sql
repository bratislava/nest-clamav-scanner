-- CreateTable
CREATE TABLE "Scanner" (
    "id" TEXT NOT NULL,
    "file_uid" TEXT NOT NULL,
    "bucket_uid" TEXT NOT NULL,
    "user_uid" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scanner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scanner_file_uid_bucket_uid_user_uid_status_idx" ON "Scanner"("file_uid", "bucket_uid", "user_uid", "status");
