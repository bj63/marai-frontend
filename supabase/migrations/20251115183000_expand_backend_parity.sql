-- Ensure we have a generic trigger helper for updated_at columns
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Extend mirai_profile with handle and bio fields used across the UI
ALTER TABLE public.mirai_profile
  ADD COLUMN IF NOT EXISTS handle text,
  ADD COLUMN IF NOT EXISTS bio text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mirai_profile_handle
  ON public.mirai_profile (handle)
  WHERE handle IS NOT NULL;

-- Persist onboarding state so partially completed flows can resume
CREATE TABLE IF NOT EXISTS public.onboarding_state (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  current_step text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  CONSTRAINT onboarding_state_user_unique UNIQUE (user_id)
);

ALTER TABLE public.onboarding_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their onboarding state"
  ON public.onboarding_state
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their onboarding state"
  ON public.onboarding_state
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their onboarding state"
  ON public.onboarding_state
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER onboarding_state_set_updated_at
  BEFORE UPDATE ON public.onboarding_state
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_onboarding_state_user_id
  ON public.onboarding_state (user_id);

-- Store collaboration and privacy settings surfaced in the settings page
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  profile_visibility text NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
  share_activity boolean NOT NULL DEFAULT true,
  preferred_login text CHECK (preferred_login IN ('password', 'google', 'magic-link', 'wallet')),
  wallet_address text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  CONSTRAINT user_settings_user_unique UNIQUE (user_id)
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their settings"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their settings"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER user_settings_set_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id
  ON public.user_settings (user_id);

-- Capture design DNA, evolution stage, and emotion preferences for the studio
CREATE TABLE IF NOT EXISTS public.user_design_profile (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  design_dna jsonb,
  evolution_stage text,
  preferred_emotion text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  CONSTRAINT user_design_profile_user_unique UNIQUE (user_id)
);

ALTER TABLE public.user_design_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their design profile"
  ON public.user_design_profile
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their design profile"
  ON public.user_design_profile
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their design profile"
  ON public.user_design_profile
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER user_design_profile_set_updated_at
  BEFORE UPDATE ON public.user_design_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_design_profile_user_id
  ON public.user_design_profile (user_id);

-- Notification center storage with read/unread support
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT timezone('utc', now()),
  read_at timestamptz
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications for themselves or via service role"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can mark their notifications as read"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at
  ON public.notifications (user_id, created_at DESC);

-- Direct messaging primitives
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their conversations"
  ON public.conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversation_members cm
      WHERE cm.conversation_id = conversations.id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators or service role can insert conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() = created_by OR auth.role() = 'service_role');

CREATE POLICY "Creators or service role can update conversations"
  ON public.conversations
  FOR UPDATE
  USING (auth.uid() = created_by OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = created_by OR auth.role() = 'service_role');

CREATE TRIGGER conversations_set_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.conversation_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT timezone('utc', now()),
  last_read_at timestamptz,
  CONSTRAINT conversation_members_unique UNIQUE (conversation_id, user_id)
);

ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their conversation membership"
  ON public.conversation_members
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Members or service role can join conversations"
  ON public.conversation_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Members or service role can update membership"
  ON public.conversation_members
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Members or service role can leave conversations"
  ON public.conversation_members
  FOR DELETE
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc', now())
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation members can read messages"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversation_members cm
      WHERE cm.conversation_id = messages.conversation_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Conversation members can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1
      FROM public.conversation_members cm
      WHERE cm.conversation_id = messages.conversation_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Senders or service role can edit messages"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = sender_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = sender_id OR auth.role() = 'service_role');

CREATE POLICY "Senders or service role can delete messages"
  ON public.messages
  FOR DELETE
  USING (auth.uid() = sender_id OR auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_created_at
  ON public.messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id
  ON public.conversation_members (user_id, conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
  ON public.conversations (updated_at DESC);

-- Team roster management for the admin screen
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  name text,
  role text NOT NULL CHECK (role IN ('founder', 'admin', 'collaborator')),
  login_method text NOT NULL CHECK (login_method IN ('password', 'magic-link', 'google', 'wallet')),
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active')),
  created_at timestamptz DEFAULT timezone('utc', now())
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view team members"
  ON public.team_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage team members"
  ON public.team_members
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Founders can manage team members"
  ON public.team_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members founders
      WHERE founders.email = coalesce(auth.jwt() ->> 'email', '')
        AND founders.role = 'founder'
        AND founders.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.team_members founders
      WHERE founders.email = coalesce(auth.jwt() ->> 'email', '')
        AND founders.role = 'founder'
        AND founders.status = 'active'
    )
  );

-- Views powering the social graph and messaging UI
CREATE OR REPLACE VIEW public.followers_view AS
SELECT
  f.id,
  f.following_id AS target_id,
  f.follower_id,
  f.created_at,
  mp.user_id,
  mp.name,
  mp.avatar,
  mp.color,
  mp.handle,
  mp.bio,
  EXISTS (
    SELECT 1
    FROM public.follows reciprocal
    WHERE reciprocal.follower_id = f.following_id
      AND reciprocal.following_id = f.follower_id
  ) AS is_following
FROM public.follows f
JOIN public.mirai_profile mp
  ON mp.user_id = f.follower_id;

CREATE OR REPLACE VIEW public.following_view AS
SELECT
  f.id,
  f.follower_id,
  f.following_id AS user_id,
  f.created_at,
  mp.name,
  mp.avatar,
  mp.color,
  mp.handle,
  mp.bio,
  true AS is_following
FROM public.follows f
JOIN public.mirai_profile mp
  ON mp.user_id = f.following_id;

CREATE OR REPLACE VIEW public.feed_comments_view AS
SELECT
  c.id,
  c.post_id,
  c.user_id,
  c.body,
  c.created_at,
  mp.name AS author_name,
  mp.avatar AS author_avatar
FROM public.feed_comments c
LEFT JOIN public.mirai_profile mp
  ON mp.user_id = c.user_id;

CREATE OR REPLACE VIEW public.messages_view AS
SELECT
  m.id,
  m.conversation_id,
  m.sender_id,
  m.body,
  m.created_at,
  mp.name AS sender_name,
  mp.avatar AS sender_avatar
FROM public.messages m
LEFT JOIN public.mirai_profile mp
  ON mp.user_id = m.sender_id;

CREATE OR REPLACE VIEW public.conversations_view AS
SELECT
  cm.conversation_id AS id,
  cm.user_id AS member_id,
  COALESCE(c.title, 'Direct message') AS title,
  c.updated_at,
  lm.body AS last_message_preview
FROM public.conversation_members cm
JOIN public.conversations c
  ON c.id = cm.conversation_id
LEFT JOIN LATERAL (
  SELECT m.body
  FROM public.messages m
  WHERE m.conversation_id = c.id
  ORDER BY m.created_at DESC
  LIMIT 1
) lm ON true;

-- Directory search combining profiles and posts
CREATE OR REPLACE FUNCTION public.search_directory(search_query text)
RETURNS TABLE (
  id text,
  type text,
  title text,
  subtitle text,
  href text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mp.user_id::text AS id,
    'profile'::text AS type,
    mp.name AS title,
    mp.bio AS subtitle,
    '/profile/' || COALESCE(mp.handle, mp.user_id::text) AS href
  FROM public.mirai_profile mp
  WHERE search_query IS NULL
     OR search_query = ''
     OR mp.name ILIKE '%' || search_query || '%'
     OR mp.handle ILIKE '%' || search_query || '%'
     OR mp.bio ILIKE '%' || search_query || '%'

  UNION ALL

  SELECT
    fp.id::text AS id,
    'post'::text AS type,
    COALESCE(fp.mirai_name, 'Mirai update') AS title,
    left(coalesce(fp.message, ''), 160) AS subtitle,
    '/feed/' || fp.id::text AS href
  FROM public.feed_posts fp
  WHERE search_query IS NULL
     OR search_query = ''
     OR fp.message ILIKE '%' || search_query || '%'
     OR fp.mirai_name ILIKE '%' || search_query || '%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profile-specific feed RPC used by the profile timeline
CREATE OR REPLACE FUNCTION public.fetch_profile_feed(target_user_id uuid, viewer_id uuid)
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
    ARRAY (
      SELECT json_build_object(
        'id', cv.id,
        'post_id', cv.post_id,
        'user_id', cv.user_id,
        'body', cv.body,
        'created_at', cv.created_at,
        'author_name', cv.author_name,
        'author_avatar', cv.author_avatar
      )
      FROM public.feed_comments_view cv
      WHERE cv.post_id = p.id
      ORDER BY cv.created_at ASC
    ) AS comments,
    EXISTS (
      SELECT 1
      FROM public.feed_likes
      WHERE post_id = p.id
        AND user_id = viewer_id
    ) AS viewer_has_liked
  FROM public.feed_posts p
  LEFT JOIN public.feed_likes l
    ON p.id = l.post_id
  WHERE p.user_id = target_user_id
  GROUP BY p.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Keep follows-based views fast
CREATE INDEX IF NOT EXISTS idx_followers_view_target_id ON public.follows (following_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_following_view_follower_id ON public.follows (follower_id, created_at DESC);
