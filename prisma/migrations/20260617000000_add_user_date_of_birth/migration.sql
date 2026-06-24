-- Add dateOfBirth to User (nullable; existing rows remain null).
-- Captured at registration for the COPPA age gate (must be 13+).
ALTER TABLE "User" ADD COLUMN "dateOfBirth" DATE;
