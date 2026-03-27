-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "activeDays" TEXT NOT NULL DEFAULT '0,1,2,3,4,5,6',
ADD COLUMN     "intervalMinutes" INTEGER,
ADD COLUMN     "notifyEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "presetKey" TEXT,
ADD COLUMN     "scheduledTime" TEXT,
ADD COLUMN     "soundEnabled" BOOLEAN NOT NULL DEFAULT true;
