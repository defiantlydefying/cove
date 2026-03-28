-- AlterTable
ALTER TABLE "Routine" ADD COLUMN     "showDurations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showTimes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startTime" TEXT;

-- AlterTable
ALTER TABLE "RoutineStep" ADD COLUMN     "durationMinutes" INTEGER;
