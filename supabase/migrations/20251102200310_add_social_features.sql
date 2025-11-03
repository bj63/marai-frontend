-- This migration adds social features: likes, replies, and follows.

-- POST LIKES TABLE (renamed to feed_likes for consistency)
CREATE TABLE IF NOT EXISTS feed_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES feed_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id) -- A user can only like a post once
);

ALTER TABLE feed_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes"
  ON feed_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own likes"
  ON feed_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON feed_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- POST REPLIES TABLE (renamed to feed_comments for consistency)
CREATE TABLE IF NOT EXISTS feed_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES feed_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body text NOT NULL, -- Renamed from 'message' to 'body' for consistency
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all replies"
  ON feed_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own replies"
  ON feed_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies"
  ON feed_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies"
  ON feed_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- USER FOLLOWS TABLE (renamed to follows for consistency)
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id) -- Prevent duplicate follow relationships
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follow relationships"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow other users"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow users they follow"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feed_likes_post_id ON feed_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_likes_user_id ON feed_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_comments_post_id ON feed_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- DATABASE FUNCTION to fetch the feed for users someone follows
CREATE OR REPLACE FUNCTION fetch_following_feed(viewer_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  mirai_name text,
  mood text,
  message text,
  music_url text,
  color text,
  created_at timestamptz,
  likes_count bigint,
  comments json[],
  viewer_has_liked boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.mirai_name,
    p.mood,
    p.message,
    p.music_url,
    p.color,
    p.created_at,
    COUNT(l.id) AS likes_count,
    ARRAY(
      SELECT json_build_object(
        'id', c.id,
        'post_id', c.post_id,
        'user_id', c.user_id,
        'body', c.body,
        'created_at', c.created_at,
        'author_name', mp.name,
        'author_avatar', mp.avatar
      )
      FROM feed_comments c
      LEFT JOIN mirai_profile mp ON c.user_id = mp.user_id
      WHERE c.post_id = p.id
      ORDER BY c.created_at ASC
    ) AS comments,
    EXISTS(SELECT 1 FROM feed_likes WHERE post_id = p.id AND user_id = viewer_id) AS viewer_has_liked
  FROM feed_posts p
  LEFT JOIN feed_likes l ON p.id = l.post_id
  WHERE p.user_id IN (SELECT following_id FROM follows WHERE follower_id = viewer_id)
  GROUP BY p.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- DATABASE FUNCTION to fetch the global feed
CREATE OR REPLACE FUNCTION fetch_feed_with_engagement(viewer_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  mirai_name text,
  mood text,
  message text,
  music_url text,
  color text,
  created_at timestamptz,
  likes_count bigint,
  comments json[],
  viewer_has_liked boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.mirai_name,
    p.mood,
    p.message,
    p.music_url,
    p.color,
    p.created_at,
    COUNT(l.id) AS likes_count,
    ARRAY(
      SELECT json_build_object(
        'id', c.id,
        'post_id', c.post_id,
        'user_id', c.user_id,
        'body', c.body,
        'created_at', c.created_at,
        'author_name', mp.name,
        'author_avatar', mp.avatar
      )
      FROM feed_comments c
      LEFT JOIN mirai_profile mp ON c.user_id = mp.user_id
      WHERE c.post_id = p.id
      ORDER BY c.created_at ASC
    ) AS comments,
    EXISTS(SELECT 1 FROM feed_likes WHERE post_id = p.id AND user_id = viewer_id) AS viewer_has_liked
  FROM feed_posts p
  LEFT JOIN feed_likes l ON p.id = l.post_id
  GROUP BY p.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;
