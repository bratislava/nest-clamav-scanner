-- CreateTable
CREATE TABLE "Files"
(
    "id"        TEXT         NOT NULL,
    "fileUid"   TEXT         NOT NULL,
    "bucketUid" TEXT         NOT NULL,
    "userUid"   TEXT,
    "status"    TEXT         NOT NULL DEFAULT 'ACCEPTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Files_fileUid_bucketUid_userUid_status_idx" ON "Files" ("fileUid", "bucketUid", "userUid", "status");
