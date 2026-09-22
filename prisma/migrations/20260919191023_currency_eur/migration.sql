-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Beat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "bpm" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "coverUrl" TEXT NOT NULL DEFAULT '',
    "previewUrl" TEXT NOT NULL DEFAULT '',
    "fileKey" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'unpublished',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Beat" ("bpm", "coverUrl", "createdAt", "currency", "description", "duration", "fileKey", "genre", "id", "key", "previewUrl", "price", "slug", "status", "title", "updatedAt") SELECT "bpm", "coverUrl", "createdAt", "currency", "description", "duration", "fileKey", "genre", "id", "key", "previewUrl", "price", "slug", "status", "title", "updatedAt" FROM "Beat";
DROP TABLE "Beat";
ALTER TABLE "new_Beat" RENAME TO "Beat";
CREATE UNIQUE INDEX "Beat_slug_key" ON "Beat"("slug");
CREATE INDEX "Beat_status_idx" ON "Beat"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
