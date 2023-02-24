-- CreateTable
CREATE TABLE "Scanner" (
    "id" TEXT NOT NULL,
    "fileUid" TEXT NOT NULL,
    "bucketUid" TEXT NOT NULL,
    "userUid" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACCEPTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scanner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scanner_fileUid_bucketUid_userUid_status_idx" ON "Scanner"("fileUid", "bucketUid", "userUid", "status");
