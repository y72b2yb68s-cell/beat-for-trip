-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT,
    "draftValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteContent_page_locale_idx" ON "SiteContent"("page", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "SiteContent_page_section_key_locale_key" ON "SiteContent"("page", "section", "key", "locale");

