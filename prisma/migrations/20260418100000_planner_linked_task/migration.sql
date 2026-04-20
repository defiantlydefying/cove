ALTER TABLE "PlannerItem" ADD COLUMN "linkedTaskId" TEXT;
ALTER TABLE "PlannerItem" ADD CONSTRAINT "PlannerItem_linkedTaskId_fkey"
  FOREIGN KEY ("linkedTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
