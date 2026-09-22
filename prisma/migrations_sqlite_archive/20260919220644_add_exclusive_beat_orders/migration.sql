-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'BEAT',
    "email" TEXT NOT NULL,
    "customerName" TEXT,
    "beatId" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "paymentProvider" TEXT NOT NULL,
    "paymentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "fulfillmentStatus" TEXT,
    "downloadToken" TEXT,
    "downloadTokenExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("amount", "beatId", "createdAt", "currency", "downloadToken", "downloadTokenExpiresAt", "email", "id", "paymentId", "paymentProvider", "status", "updatedAt") SELECT "amount", "beatId", "createdAt", "currency", "downloadToken", "downloadTokenExpiresAt", "email", "id", "paymentId", "paymentProvider", "status", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_downloadToken_key" ON "Order"("downloadToken");
CREATE INDEX "Order_email_idx" ON "Order"("email");
CREATE INDEX "Order_paymentId_idx" ON "Order"("paymentId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_type_idx" ON "Order"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
