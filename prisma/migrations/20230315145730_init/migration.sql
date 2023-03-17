-- CreateTable
CREATE TABLE "Files"
(
    "id"           TEXT         NOT NULL,
    "fileUid"      TEXT         NOT NULL,
    "bucketUid"    TEXT         NOT NULL,
    "userUid"      TEXT,
    "fileSize"     INTEGER      NOT NULL,
    "fileMimeType" TEXT         NOT NULL,
    "status"       TEXT         NOT NULL DEFAULT 'ACCEPTED',
    "notified"     BOOLEAN      NOT NULL DEFAULT false,
    "runs"         INTEGER      NOT NULL DEFAULT 0,
    "meta"         JSONB,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Files_fileUid_bucketUid_userUid_fileSize_status_notified_idx" ON "Files" ("fileUid", "bucketUid", "userUid", "fileSize", "status", "notified");
