-- This migration adds an avatar_url column to the mirai_profile table.

ALTER TABLE mirai_profile
ADD COLUMN avatar_url text;
