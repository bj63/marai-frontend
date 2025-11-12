# Business Profile Frontend Expansion Guide

This guide outlines how to expand the MarAI frontend so business profiles feel fully realised and actionable.

## Page Shell

* **Hero strip** – Reserve a responsive hero section with cover media, the company logo/avatar, verified badges, and primary call-to-action (CTA) buttons (e.g., *Follow*, *Message*, *Visit Site*). Keep spacing consistent with existing profile headers in `components/profile` for easy reuse.
* **Pinned summary bar** – Immediately below the hero, surface quick metrics (followers, campaign reach, employee pulse). Mirror the compact pill styling used on personal dashboards so users recognise the pattern.
* **Tab navigation** – Provide tabs for `Posts`, `About`, `Campaigns`, and `Insights`. Tabs should map to dedicated routes/views under `frontend/components/business` to keep code separation clear.

## Content Zones

### Posts
Use the existing feed rendering stack to show published updates. Tag advertising entries by checking `metadata.type === "adCampaign"` so you can badge them as *Sponsored* and render the creative CTA pulled from the new autopost payloads.

### About
Break the profile story into modular cards:

1. Mission & vision copy.
2. Key products/services.
3. Contact & location tiles.
4. Team spotlights (use employee proxy data when available to visualise company mood).

### Campaigns
* Provide a grid/list of scheduled and running campaigns pulled from `/api/autoposts?status=scheduled|publishing|published`.
* Include filters for `campaignName`, target personas, and scheduled windows so operators can audit upcoming drops quickly.
* Each card should preview the AI-generated headline, relational hooks, CTA, and sentiment (from `metadata.companySentiment`), along with employee proxy avatars if supplied.

### Autopost metadata → UI components

| `metadata.type` | Additional key fields | Suggested UI component | Notes |
| --- | --- | --- | --- |
| `connectionDream` | `creativeType` = `dreamVideo`, `partnerId`, `partnerName`, optional `dreamMetadata`, `callToAction` | `ConnectionDreamAutopostCard` (Dream Video player with CTA) | Triggered by the relationship milestone flow. Surface partner info, CTA button, and adaptive feed badges pulled from `feedHints`. |
| `creative` + `creativeType` = `dreamVideo` | `creativeTitle`, `creativeSummary`, `adaptiveProfile`, optional `callToAction` | `CreativeDreamVideoCard` | Mirrors the creative scheduler output. Highlight inspirations (`inspirations`), CTA, and adaptive engine signals. |
| `creative` + `creativeType` = `poem` | `creativeSummary`, `inspirations`, `hashtags` | `CreativePoemCard` | Render stanza-friendly typography; include inspiration chips and CTA if provided. |
| `creative` + `creativeType` = `story` | `creativeSummary`, `inspirations`, `feedHints.categories` | `CreativeStoryCard` | Layout as narrative paragraphs with optional illustration poster. |
| `creative` + `creativeType` = `imageArt` | `creativeSummary`, `posterUrl`, `feedHints.creativeMedium` | `CreativeImageArtCard` | Gallery/grid rendering with optional CTA button. |
| `adCampaign` | `campaignId`, `campaignName`, `headline`, `script`, `targetPersonas`, `budget`, `companySentiment` | `SponsoredCampaignCard` | Badge as *Sponsored*. Show relational hooks, personas, budget, and CTA. |
| (fallback / anything else) | n/a | `GenericAutopostCard` | Default renderer. Inspect `metadata` to decide if you should promote it to a dedicated component. |

### Insights
Aggregate:

* Engagement metrics and budget tracking (combine `metadata.budget` with analytics service results).
* Sentiment trends by comparing `emotionState` snapshots across posts.
* Audience resonance using `metadata.feedHints.relationalHooks` and `targetPersonas`.

## Authoring Workflow

1. **Campaign composer modal** – Extend `AutopostPanel` (or add `BusinessCampaignPanel`) to capture the new backend fields:
   * Campaign identity: `campaignId`, `campaignName`, `brandPageId`.
   * Creative inputs: headline, script copy, relational hooks, media assets.
   * Targeting: personas, audience, scheduled publish window, hashtags.
   * Budget & billing references plus employee proxy selector.
   * Company sentiment snapshot (sliders/toggles) to mirror the emotion telemetry saved with the post.
2. **Preview pane** – Render a live mockup of how the ad will appear in the feed, including the employee proxy mood badge.
3. **Submission** – POST to `/api/autoposts/creative` with `creativeType: "adCampaign"`. The backend routes this through `build_ad_campaign_autopost_payload`, so any fields you collect here will be persisted automatically.

## Component Structure Recommendations

* Namespace shared widgets under `components/business` (e.g., `BusinessHeader`, `CampaignCard`, `SentimentBadge`) to stay organised.
* Leverage existing typography and spacing tokens from the design system to maintain brand cohesion.
* Ensure layouts collapse cleanly on narrow viewports—hero media should scale, and the tab bar should convert to a segmented control.
* Implement feature flags to hide campaign tooling for profiles without advertising permissions.
