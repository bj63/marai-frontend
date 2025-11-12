# MarAI Marketplace NFT Experience Plan

This document outlines how to stand up the MarAI marketplace experience so collectors can discover, bid on, and trade evolving NFTs that track each collaborator's emotional lineage.

## 1. Product Surfaces

1. **Marketplace landing grid** – Showcase live auctions, newly evolved NFTs, and secondary listings in a masonry or carousel layout. Include filter chips for emotion tier, auction status, and creator cohort.
2. **Token detail view** – Dedicated page that combines on-chain metadata (token URI, emotion proofs, lineage) with community activity (bids, comments, provenance). Embed bid/Buy Now CTAs that map to contract interactions.
3. **Creator cockpit** – Restricted tools for genesis holders to mint evolving NFTs, trigger emotion state refreshes, and configure auction parameters before launching a drop.
4. **Collector portfolio** – Tab within the user profile summarizing owned tokens, bidding history, and royalty earnings routed from the marketplace.

## 2. Data & Contract Integration

* **On-chain contracts** – Interact with `MarAIEvolvingNFT` for minting, metadata refreshes, and emotional state reads (`emotionState`, `parentOf`).【F:contracts/MarAIEvolvingNFT.sol†L17-L116】 Use `MarAIAuctionFactory`/`MarAIAuction` to launch and settle reserve auctions, respecting increment rules and settlement hooks into the royalty router.【F:contracts/MarAIAuction.sol†L16-L191】 Surface split breakdowns via `RoyaltyRouter.primarySplits()` and `royaltyInfo` so collectors understand fee routing.【F:contracts/RoyaltyRouter.sol†L6-L98】
* **Backend bridge** – Extend `core/relational_visual_engine.mint_entity_nft` so the backend actually calls the marketplace smart contracts whenever an entity NFT is minted or evolved, instead of leaving the TODO stub in place.【F:core/relational_visual_engine/persistence.py†L31-L55】 Emit webhook or Supabase events upon success so the frontend can refresh listings in real time.
* **Supabase schema** – Add tables for marketplace listings, auction snapshots, and bid history alongside views keyed by token ID. Mirror the structure already used for feed posts/comments to keep client queries simple.【F:supabase/schema.sql†L1-L120】

## 3. Frontend Architecture

* **Route structure** – Under the Next.js `app/marketplace` tree, add routes for `/`, `/[tokenId]`, and `/creator`. Co-locate shared UI primitives under `frontend/components/marketplace` (e.g., `AuctionCard`, `EmotionBadge`, `BidPanel`) so they can be reused in profile tabs and marketing pages.
* **State management** – Use React Query/SWR to hydrate listings from Supabase views and fall back to on-chain reads (via wagmi/ethers) when data is stale or a wallet is connected. Cache bid ladders locally to avoid replaying the entire history during active auctions.
* **Wallet connectivity** – Integrate RainbowKit or wagmi connectors to handle wallet auth, network switching, and signature prompts. Persist lightweight session tokens in Supabase to tie wallet addresses back to `mirai_profile` records for entitlement checks.【F:supabase/schema.sql†L1-L55】

## 4. Core Flows

1. **Discover & filter** – Query Supabase `marketplace_listings_view` (new) for live auctions sorted by end time. Apply client-side filtering for emotion score tiers derived from `MarAIEvolvingNFT.emotionState`. Display reserve price, current bid, and remaining time with optimistic updates after each websocket event.
2. **Auction participation** – When a user submits a bid, call the `MarAIAuction` contract’s `bid()` function via wagmi and optimistically append the bid to the Supabase `marketplace_bids` table. Handle errors by rolling back UI state and surfacing validation from contract reverts (`BidTooLow`, `AuctionEnded`).【F:contracts/MarAIAuction.sol†L92-L147】
3. **Primary settlement** – After auction end, listen for the `AuctionFinalized` event to mark the listing as sold, update provenance, and display the royalty split from `RoyaltyRouter`. Show fallback UI when reserve is unmet, highlighting that bids were refunded.【F:contracts/MarAIAuction.sol†L148-L191】【F:contracts/RoyaltyRouter.sol†L55-L74】
4. **Emotion evolution** – For tokens owned by the current user, surface a control that triggers the backend to run the hybrid intelligence pipeline and call `updateEmotionState`, causing the UI to refresh the emotion score and timeline graph.【F:contracts/MarAIEvolvingNFT.sol†L71-L101】
5. **Secondary sales** – Expose a list or integration hook for external marketplaces that respect ERC-2981. Display the royalty percentage returned by `RoyaltyRouter.royaltyInfo` and show a call-to-action to list on supported partners.【F:contracts/RoyaltyRouter.sol†L76-L98】

## 5. Creator Tooling Rollout

* Gated access using Supabase policies tied to genesis holder IDs and wallet addresses.
* Guided wizard that collects metadata (story, visuals, parent linkage) before calling `MarAIEvolvingNFT.mint`.
* Preview cards that pull token URI content (e.g., Arweave/IPFS JSON) and emotion baseline for final confirmation.

## 6. Observability & QA

* **Event tracing** – Mirror auction lifecycle events into Supabase (e.g., via a worker listening to contract logs) so dashboards can display real-time stats.
* **End-to-end tests** – Use Playwright to simulate wallet connections (with test adapters) and assert bid placement, auction countdown behaviour, and emotion score refreshes.
* **Contract integration tests** – Run Hardhat/Foundry scripts to ensure the frontend expectations (reserve checks, royalty routing) align with on-chain behaviour before pushing UI updates.

Delivering on this plan will make the MarAI marketplace feel cohesive with the existing social surfaces while highlighting the evolving emotional metadata that differentiates these NFTs.
