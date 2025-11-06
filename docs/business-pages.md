# MarAI Business & Pro Mode Frontend Guide

This guide sketches the recommended structure for building the business and pro-mode surfaces in the MarAI frontend. Treat it as a living brief that maps how established social platforms (Facebook Pages, Instagram Professional, Snapchat Business, X for Business) organise their tools. Use it to align navigation, component architecture, and data flows when you implement campaign management and employee sentiment storytelling.

## 1. Core layout & navigation

- **Primary sidebar**
  - Company overview (profile card, verified badge, quick stats)
  - Planner (Autoposts, scheduled drops, release queue)
  - Content library (AI creative variants, assets, saved briefs)
  - Insights (performance dashboards, sentiment analytics, conversion goals)
  - Team room (employee reflections, mood snapshots, permissions)
  - Settings (billing, roles, integrations, brand voice)
- **Top utility bar**
  - Org switcher for companies / agencies
  - Quick actions: “Create campaign”, “Invite teammate”, “Launch ritual”
  - Notification bell + emotion pulse indicator for real-time sentiment shifts
- **Responsive breakpoints** that collapse the sidebar into an app bar on tablets/phones while keeping the planner + insights accessible via tabs.

## 2. Business profile foundation

- Hero header with cover media, brand avatar, tagline, and CTA button (mirrors Facebook Page + LinkedIn Company aesthetics).
- Sub-navigation tabs:
  1. **Overview** – pinned announcements, featured campaigns, live sentiment badge.
  2. **Posts** – feed of published + scheduled content with promoted labels.
  3. **Insights** – charts for reach, engagement, conversions, employee sentiment.
  4. **Team** – roster of contributors with emotion reflections and role labels.
  5. **Assets** – grid of approved media, copy snippets, brand rules.
- Right-hand rail for quick metrics (audience growth, active campaigns, trending emotions).

## 3. Autopost management flow

- Reuse `AutopostPanel` under `/admin` for power users; expose a trimmed version inside business pages.
- Break the workflow into three cards:
  1. **Campaign brief intake** – form fields for objective, audience, mood, employee reflections. Surface AI helper chips that pull past high-performing variants.
  2. **AI creative preview** – call the `/api/autoposts/creative` hook, show copy, asset preview, CTA, emotion badge (`emotionState.label`). Allow quick edits before committing.
  3. **Queue timeline** – list of scheduled drops grouped by status (scheduled, publishing, published). Provide bulk release + export actions.
- Highlight promoted posts in the feed via the metadata flag `feedHints.isPromoted` and show CTA chips like Instagram’s ad preview.

## 4. Employee sentiment storytelling

- Dedicate a “Team Pulse” module sourced from the backend emotion signals.
  - Bar chart or timeline for confidence / joy / focus trends (inspired by Snapchat’s brand sentiment dashboards).
  - Quote carousel with employee reflections (“How does this campaign feel to you?”).
  - Badge that contributes to company “Value Index” derived from worker emotions (displayed beside the brand CTA).
- Allow workers to opt-in to share sentiments; mirror Slack canvas or Facebook Workplace vibes.

## 5. Analytics & reporting primitives

- Create a `/analytics` route nested inside the business area.
- Core widgets:
  - Performance funnel (impressions → clicks → conversions) with campaign filters.
  - Sentiment heatmap by employee role / geography.
  - Creative variant leaderboard referencing `metadata.adCampaign.variantKey`.
  - Export buttons generating CSV / JSON using the queue metadata (no schema migrations needed).
- Support scheduled email summaries pulling from the same JSON payloads.

## 6. Component library notes

- Build reusable cards for “Promoted Post”, “Sentiment Badge”, and “Campaign Metric”.
- Extend the existing `MoodCard` to detect ads by checking `metadata.feedHints?.isPromoted` and overlaying a “Promoted” pill.
- Centralise campaign-specific types under `types/business.ts` so the API contracts match backend metadata.
- Keep data fetchers in `lib/hooks` (e.g., `useAutopostQueue`, `useBusinessSentiment`) to mirror how other sections load content.

## 7. States, loading, and testing

- Provide skeleton placeholders for queue tables, charts, and creative previews.
- Include optimistic updates when scheduling or publishing autoposts, reverting on error.
- Add Playwright smoke tests that navigate a seeded business page, schedule an autopost, and verify the promoted badge appears.
- Track feature flags (e.g., `proModeEnabled`) in a dedicated Zustand slice or Supabase table for gradual rollout.

## 8. Next steps checklist

- [ ] Wire the new backend `/api/autoposts/*` routes into the admin console and business UI.
- [ ] Implement sentiment badges sourced from `emotionState.aggregate`.
- [ ] Prototype the analytics dashboard layout.
- [ ] Co-design onboarding for company sign-ups / upgrades to pro mode.

Use this doc as the onboarding touchstone for anyone building the business experience—keep it updated as navigation, permissions, or data contracts evolve.
