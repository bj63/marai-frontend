/*
  # MOA AI Application Schema

  1. New Tables
    - `mirai_profile` - User's AI companion profile
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, companion name)
      - `avatar` (text, emoji or avatar identifier)
      - `color` (text, theme color)
      - `created_at` (timestamptz)
    
    - `personality` - AI personality traits (0.0 to 1.0 scale)
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `empathy`, `humor`, `confidence`, `creativity`, `curiosity`, `loyalty`, `trust`, `energy` (float)
      - `updated_at` (timestamptz)
    
    - `feed_posts` - Social feed posts with mood and music
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `mirai_name` (text, companion name)
      - `mood` (text, mood descriptor)
      - `message` (text, post content)
      - `music_url` (text, optional music link)
      - `color` (text, theme color)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own mirai_profile and personality data
    - Feed posts are publicly readable but only the owner can create/update/delete
*/

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- MIRAI PROFILE TABLE
CREATE TABLE IF NOT EXISTS mirai_profile (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  avatar text DEFAULT '🐱',
  color text DEFAULT '#6366F1',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE mirai_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON mirai_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON mirai_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON mirai_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON mirai_profile FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- PERSONALITY TABLE
CREATE TABLE IF NOT EXISTS personality (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  empathy float DEFAULT 0.5,
  humor float DEFAULT 0.5,
  confidence float DEFAULT 0.5,
  creativity float DEFAULT 0.5,
  curiosity float DEFAULT 0.5,
  loyalty float DEFAULT 0.5,
  trust float DEFAULT 0.5,
  energy float DEFAULT 0.5,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE personality ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own personality"
  ON personality FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personality"
  ON personality FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personality"
  ON personality FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own personality"
  ON personality FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- FEED POSTS TABLE
CREATE TABLE IF NOT EXISTS feed_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mirai_name text,
  mood text,
  message text,
  music_url text,
  color text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feed posts"
  ON feed_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own posts"
  ON feed_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON feed_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON feed_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mirai_profile_user_id ON mirai_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_personality_user_id ON personality(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_user_id ON feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON feed_posts(created_at DESC);