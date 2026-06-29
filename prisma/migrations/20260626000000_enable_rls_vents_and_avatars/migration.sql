-- Enable RLS on tables added in 20260504000000_add_vents_and_avatars,
-- which were created after the earlier RLS migrations and missed it.
-- No policies are added: all data access goes through server-side Prisma
-- (the postgres role bypasses RLS), so this only locks down the Supabase
-- REST API (PostgREST), matching the rest of the schema.
ALTER TABLE "CommunityAvatar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VentComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VentReport" ENABLE ROW LEVEL SECURITY;
