-- Enable Row Level Security on all public tables.
-- The app connects via Prisma using the postgres role (which bypasses RLS),
-- so this only restricts access through the Supabase REST API (PostgREST).
-- No policies are added because all data access should go through the API
-- routes (server-side Prisma), not directly via the Supabase client.

-- Auth tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

-- Profile & settings
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModuleSetting" ENABLE ROW LEVEL SECURITY;

-- Tasks
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;

-- Routines
ALTER TABLE "Routine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RoutineStep" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RoutineLog" ENABLE ROW LEVEL SECURITY;

-- Wellness & reminders
ALTER TABLE "WellnessCheckin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reminder" ENABLE ROW LEVEL SECURITY;

-- Gamification
ALTER TABLE "Achievement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserAchievement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserStreak" ENABLE ROW LEVEL SECURITY;

-- Productivity
ALTER TABLE "FocusSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlannerItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Habit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HabitCheck" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WeeklyGoal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TimeEntry" ENABLE ROW LEVEL SECURITY;

-- Community
ALTER TABLE "CommunityRoutine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityRoutineStep" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityHelpful" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityReport" ENABLE ROW LEVEL SECURITY;

-- Prisma internals
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
