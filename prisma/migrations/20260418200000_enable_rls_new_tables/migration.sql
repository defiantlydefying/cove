-- Enable RLS on tables added after the initial RLS migration
ALTER TABLE "DailyActivity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InboxItem" ENABLE ROW LEVEL SECURITY;
