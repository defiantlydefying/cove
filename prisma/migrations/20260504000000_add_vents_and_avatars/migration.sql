-- Add avatarKey to User
ALTER TABLE "User" ADD COLUMN "avatarKey" TEXT;

-- CreateTable CommunityAvatar
CREATE TABLE "CommunityAvatar" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'starter',
    "unlockType" TEXT NOT NULL DEFAULT 'default',
    "unlockThreshold" INTEGER,

    CONSTRAINT "CommunityAvatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable Vent
CREATE TABLE "Vent" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "lifespan" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "contactPreference" TEXT NOT NULL DEFAULT 'both',
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vent_pkey" PRIMARY KEY ("id")
);

-- CreateTable VentComment
CREATE TABLE "VentComment" (
    "id" TEXT NOT NULL,
    "ventId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VentComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable VentReport
CREATE TABLE "VentReport" (
    "id" TEXT NOT NULL,
    "ventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VentReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityAvatar_key_key" ON "CommunityAvatar"("key");

-- CreateIndex
CREATE INDEX "Vent_expiresAt_idx" ON "Vent"("expiresAt");

-- CreateIndex
CREATE INDEX "Vent_authorId_idx" ON "Vent"("authorId");

-- CreateIndex
CREATE INDEX "VentComment_ventId_idx" ON "VentComment"("ventId");

-- CreateIndex
CREATE UNIQUE INDEX "VentReport_userId_ventId_key" ON "VentReport"("userId", "ventId");

-- AddForeignKey
ALTER TABLE "Vent" ADD CONSTRAINT "Vent_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentComment" ADD CONSTRAINT "VentComment_ventId_fkey" FOREIGN KEY ("ventId") REFERENCES "Vent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentComment" ADD CONSTRAINT "VentComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentReport" ADD CONSTRAINT "VentReport_ventId_fkey" FOREIGN KEY ("ventId") REFERENCES "Vent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentReport" ADD CONSTRAINT "VentReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
