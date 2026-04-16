-- Add companion type to user settings
ALTER TABLE "UserSettings" ADD COLUMN "companionType" TEXT NOT NULL DEFAULT 'fox';

-- Create InboxItem table
CREATE TABLE "InboxItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'text',
    "status" TEXT NOT NULL DEFAULT 'unprocessed',
    "convertedTo" TEXT,
    "convertedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboxItem_pkey" PRIMARY KEY ("id")
);

-- Create index for efficient queries
CREATE INDEX "InboxItem_userId_status_idx" ON "InboxItem"("userId", "status");

-- Add foreign key
ALTER TABLE "InboxItem" ADD CONSTRAINT "InboxItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS on the new table
ALTER TABLE "InboxItem" ENABLE ROW LEVEL SECURITY;
