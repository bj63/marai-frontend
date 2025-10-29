# MOA_AI_V3 Backend Integration Roadmap

This document captures the database objects, views, and edge functions that the
front-end currently expects from the Supabase-powered MOA_AI_V3 backend. Use it
as a checklist while provisioning tables, policies, and RPCs so the social and
collaboration flows stay in sync with the UI.

## Identity & Onboarding

| Object | Purpose | Key Columns / Notes |
| --- | --- | --- |
| `mirai_profile` table | Persist per-user identity surfaced in headers, feed cards, and profile tabs. | `id`, `user_id` (FK to auth.users), `name`, `avatar`, `color`, timestamps. |
| `personality` table | Backing store for the six personality sliders exposed across onboarding and profile editing. | `user_id`, numeric traits (`empathy`, `creativity`, `confidence`, `curiosity`, `humor`, `energy`), `updated_at`. |
| `onboarding_state` table | Tracks wizard progress so partially completed flows resume gracefully. | `user_id`, `completed`, `current_step`, `completed_at`, timestamps. |

## Feed & Engagement

| Object | Purpose | Key Columns / Notes |
| --- | --- | --- |
| `feed_posts` table | Stores community updates composed in the feed publisher, including Amaris mood context and media links. | `id`, `user_id`, `mirai_name`, `mood`, `message`, `music_url`, `color`, timestamps. |
| `feed_likes` table | Toggleable reactions powering the empathy counter on each card. | `post_id`, `user_id`, unique constraint to prevent duplicates, timestamps. |
| `feed_comments` table | Inline reply threads underneath each post. | `id`, `post_id`, `user_id`, `body`, timestamps. |
| `fetch_feed_with_engagement(viewer_id UUID)` | RPC returning feed rows enriched with `likes_count`, nested comments, and `viewer_has_liked`. | Should join posts, profiles, likes, and comments via SQL or materialized views. |
| `fetch_profile_feed(target_user_id UUID, viewer_id UUID)` | RPC backing the profile "Posts" tab. | Mirrors the feed RPC but scoped to a single author. |
| `feed_comments_view` | Read-only join that injects author metadata for each comment. | Useful for enforcing row-level security while keeping queries simple. |

## Social Graph & Discovery

| Object | Purpose | Key Columns / Notes |
| --- | --- | --- |
| `follows` table | Records follower/following relationships for graph counts and follow buttons. | `follower_id`, `following_id`, `created_at`. |
| `followers_view`, `following_view` | Join helper tables for profile tabs showing lists of followers and followings. | Include `handle`, `avatar`, `color`, `bio`. |
| `search_directory(query TEXT)` | RPC aggregating profiles and posts for the global Explore search. | Return `id`, `type`, `title`, `subtitle`, `href`. |

## Notifications & Messaging

| Object | Purpose | Key Columns / Notes |
| --- | --- | --- |
| `notifications` table | Stores activity feed items with read/unread state. | `id`, `user_id`, `title`, `body`, `type`, `metadata JSONB`, `created_at`, `read_at`. |
| `conversations` table | Represents a DM thread. | `id`, `created_at`, `updated_at`. |
| `conversation_members` table | Associates users with conversations and read receipts. | `conversation_id`, `user_id`, `last_read_at`. |
| `messages` table | Persists each DM entry. | `id`, `conversation_id`, `sender_id`, `body`, `created_at`. |
| `conversations_view` | View combining conversations with the latest message preview per user. | Columns: `id`, `member_id`, `title`, `updated_at`, `last_message_preview`. |
| `messages_view` | View joining messages with sender metadata for thread rendering. | Columns: `conversation_id`, `sender_id`, `body`, `created_at`, `sender_name`, `sender_avatar`. |

## Settings, Admin, & Team Management

| Object | Purpose | Key Columns / Notes |
| --- | --- | --- |
| `user_settings` table | Stores privacy, login preference, and wallet data exposed in Settings. | `user_id`, `profile_visibility`, `share_activity`, `preferred_login`, `wallet_address`, timestamps. |
| `team_members` table | Founder-managed roster powering the admin page. | `id`, `email`, `name`, `role`, `login_method`, `status`, `created_at`. |
| RLS policies | Ensure founders can manage the team while regular collaborators can only view. | Tailor policies per table. |

## Edge Functions & Metadata

| Object | Purpose | Key Columns / Notes |
| --- | --- | --- |
| `generate-caption` edge function | Accepts `{ mood, message }` to produce AI-enhanced captions for posts. | Deployed in Supabase Edge Functions; callable via `supabase.functions.invoke`. |
| Auth metadata writes | Keep Supabase auth user metadata (username, avatar emoji, accent color) in sync with profile tables. | Update via `auth.admin.updateUserById` or `auth.updateUser`. |

## Implementation Tips

1. **Foreign Keys & Indexes** – Add foreign keys into `auth.users` and index common filters (`user_id`, `post_id`) to keep Supabase queries fast.
2. **Row Level Security** – Enable RLS on every table and craft helper policies. Lean on views/RPCs to centralize joins while keeping policies simple.
3. **TypeScript Types** – Generate Supabase types (`supabase gen types typescript`) so the front-end consumes strongly typed responses.
4. **Edge Function Auth** – Secure `generate-caption` with service role keys and verify the calling user/session inside the function.
5. **Migration Tracking** – Use Supabase migrations or Prisma schema files to version these objects, ensuring deploy parity across environments.

Keeping this schema parity in place will let the MarAI front-end run the rich social, onboarding, and collaboration flows without hitting missing-table errors.
