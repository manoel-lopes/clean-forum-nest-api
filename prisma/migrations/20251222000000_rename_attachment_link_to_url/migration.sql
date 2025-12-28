-- Rename link column to url in attachments table
ALTER TABLE "attachments" RENAME COLUMN "link" TO "url";

-- Update updatedAt columns to be NOT NULL with default values
ALTER TABLE "comments" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "comments" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "attachments" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "attachments" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
