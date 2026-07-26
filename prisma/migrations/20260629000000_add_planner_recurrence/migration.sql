-- Add optional recurrence to planner items (null/"none" | "daily" | "weekdays" | "weekly").
ALTER TABLE "PlannerItem" ADD COLUMN IF NOT EXISTS "recurrence" TEXT;
