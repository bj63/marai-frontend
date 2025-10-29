# MarAI product flow

This document captures the flow that links authentication, account shaping, collaboration, and community surfaces inside the MarAI frontend. It mirrors the routes available in the Next.js app and clarifies when each persona should land on a page.

## Primary journey

```mermaid
flowchart LR
    A[Start: Visitor lands on /] --> B{Already invited?}
    B -- No --> C[Visit /auth and request access]
    C --> D[Confirm invitation or magic link]
    B -- Yes --> E[Authenticate through preferred method]
    D --> E
    E --> F[Profile setup on /profile]
    F --> G[Invite teammates via /admin]
    G --> H{Role}
    H -- Founder/Admin --> I[Monitor roster + permissions]
    H -- Collaborator --> J[Head to /feed for mood posts]
    J --> K[Spin up conversations in /chat]
    K --> L[Project presence via /avatar]
    L --> M[Adjust personality visuals on /personality]
    M --> N[Engage fans + commerce at /marketplace]
```

## Page intent

| Route | Audience | Purpose |
| --- | --- | --- |
| `/` | Everyone | Establishes the onboarding order, highlights key destinations, and links directly into the most common actions. |
| `/auth` | Founders, admins, collaborators | Presents credential, Google SSO, magic link, and wallet-based authentication lanes with contextual feedback. |
| `/profile` | Authenticated users | Persists the MarAI identity, avatar, and personality sliders to Supabase so every surface shares the same tone. |
| `/admin` | Founders/Admins | Invites or removes teammates, selecting the right auth method and keeping roster state aligned with Supabase. |
| `/feed` | Collaborators | Posts emotional updates, music cues, and other context that syncs with Amaris’ mood. |
| `/chat` | Everyone | Deep conversations with Amaris to gather insights that feed back into the story being told publicly. |
| `/avatar` | Everyone | Projects Amaris’ live presence for events or embedded experiences. |
| `/personality` | Everyone | Visualises the active personality blend driving Amaris’ responses. |
| `/marketplace` | Everyone | Facilitates collectibles, wallet management, and commerce activity. |

## Next steps

1. Wire feed posting and admin actions to Supabase tables so the front-end mirrors production state.
2. Layer notifications and search across the authenticated experience to speed discovery.
3. Align marketplace inventory with on-chain state and surface purchase confirmation flows.
