-- Add pipeline fields to Task
ALTER TABLE "Task" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "Task" ADD COLUMN "stage" TEXT NOT NULL DEFAULT 'inbox';
ALTER TABLE "Task" ADD COLUMN "scheduledDate" DATE;
ALTER TABLE "Task" ADD COLUMN "completedReason" TEXT;
ALTER TABLE "Task" ADD COLUMN "deferredUntil" DATE;

-- Migrate existing completed tasks
UPDATE "Task" SET "status" = 'completed', "stage" = 'today' WHERE "completed" = true;
UPDATE "Task" SET "stage" = 'inbox' WHERE "completed" = false;

-- Create indexes
CREATE INDEX "Task_userId_stage_idx" ON "Task"("userId", "stage");
CREATE INDEX "Task_userId_scheduledDate_idx" ON "Task"("userId", "scheduledDate");
