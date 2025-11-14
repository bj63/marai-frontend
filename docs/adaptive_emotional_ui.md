# Adaptive Emotional UI System Implementation Guide

This document captures the concrete requirements for introducing an adaptive, emotion-aware UI foundation into MarAI. It synthesizes the business page conventions described in `frontend/README.md`, the current styling practices in `frontend/marai-frontend`, and the inter-agent relay behavior exposed via the `relayMarAI` helper. Use it as the blueprint for both the design language extensions and the runtime plumbing.

## 1. Design Tokens

1. **Central token manifest.** Consolidate the hard-coded colors, typography, radii, shadows, and spacing values scattered through `styles/globals.css`, `Chat`, `CharacterAvatar`, `EvolutionCard`, and `AutopostPanel` into a dedicated token JSON/TS file (e.g., `frontend/marai-frontend/src/theme/tokens.ts`). Tokens should expose:
   - Core palette ramps (`base.900 = #040711`, `accent.primary = #70f5d1`, etc.).
   - Typography stacks (Inter 400–700) with size/line-height pairs for hero, summary, body, meta.
   - Spatial primitives (4 px modular scale), radii tiers (12, 16, 24 px), depth/shadow levels, and semantic state colors.
2. **Emotion primitives.** Extend the manifest with mood-specific slots (`emotion.calm.hues`, `emotion.charged.gradient`, `emotion.melancholy.blur`). These should reference the same base values so light/dark or accessibility changes propagate automatically.
3. **Documentation.** Update the existing business page guide (hero strip, pinned summary bar, tab navigation) to reference the tokens, ensuring every net-new surface consumes the shared vocabulary rather than inventing bespoke spacing or typography.

## 2. Theme Engine

1. **Resolver.** Create a theme resolver that ingests global toggles (dark/light, reduced motion) and live emotion signals exposed by MarAI entities (`emotionState`, `mood`, `metadata.companySentiment`). The resolver should output a computed theme object injected through a React context/provider at the app shell level so all widgets share the same adaptive palette and typography decisions.
2. **Deterministic guard rails.** For each content zone (hero, summary, card grids) defined in the business guide, whitelist which properties emotions may alter (e.g., gradients, glows, motion intensity) and lock structural tokens (spacing, typography scale) to preserve usability.
3. **CSS variable bridge.** Emit CSS custom properties from the theme object so downstream components can swap visuals without triggering heavy React re-renders.

## 3. Emotion → UI Mapping

1. **Signal normalization.** Map raw telemetry (post `mood`, autopost `emotionState`, `metadata.companySentiment`, timeline sentiments) into a manageable quadrant set (calm, optimistic, urgent, reflective, charged). Store this mapping next to the theme resolver for reuse.
2. **Visual responses.** Define how each quadrant mutates the UI: background gradients, avatar halos, summary pill icons, insight card glows, autopost emphasis borders. Keep these responses declarative (e.g., `emotionStyles.charged = { bubbleGradient: tokens.emotion.charged.gradient }`).
3. **Cross-component alignment.** Ensure the mapping drives consistent responses across Chat, MediaDreams, EvolutionCard, and autopost timelines to avoid emotional dissonance.

## 4. Component State Variants

1. **State inventory.** Document current states (idle, loading, error, disabled) for core components like Chat, CharacterAvatar, AutopostPanel, and campaign cards.
2. **Emotional overlays.** Introduce variant props that combine mechanical state with emotion (e.g., `<SendButton state="loading" mood="charged" />`). Use the theme engine output to render the correct gradient, border, or animation for each combination.
3. **Business module matrices.** For hero strips, insights tiles, and campaign cards, enumerate baseline/high-trust/crisis or positive/negative sentiment templates so QA can snapshot each combination.

## 5. Animation Rules

1. **Motion scale.** Publish `motion.duration`, `motion.easing`, and `motion.curve` tokens aligned with emotion intensity (subtle opacity fades for calm, parallax glows for ecstatic, dampened jitter for somber).
2. **Accessibility.** Respect reduced-motion preferences by clamping the motion scale at runtime. Centralizing the tokens ensures components stop defining bespoke transitions inline.
3. **Shared utilities.** Provide helper hooks (e.g., `useEmotionMotion()`) that translate the theme’s motion tokens into React Spring or CSS transitions used by Chat bubbles, insight pills, and autopost tiles.

## 6. Layout Shifts

1. **Template catalog.** Encode the hero strip, summary bar, and tab layouts as reusable templates documented in the business guide. When emotional escalations demand emphasis, swap to pre-approved templates (e.g., expanded insights column) instead of ad-hoc DOM mutations to avoid layout instability.
2. **Component-level constraints.** Keep adaptive styling within existing containers (e.g., AnalysisPanel grid) so emotional responses adjust styles, not structure, minimizing cumulative layout shift.

## 7. Performance Considerations

1. **Memoization.** Cache theme computations and emotion lookups using hooks like `useMemo` or dedicated selectors. Chat already memoizes the latest analysis—mirror that pattern for the adaptive theme to prevent redundant recalculations.
2. **CSS variable updates.** Favor CSS variable updates over React re-renders for token swaps to keep paint costs low.
3. **Lazy assets & batching.** Only load rich media (MediaDreams posters, attachment thumbnails) when the emotional layer requests them. Continue batching API calls (as the autopost queue already does) and stream emotion summaries server-side so client transitions remain smooth.

## 8. Inter-Agent Relay Context

The adaptive UI must also respect cross-user messaging flows. The `relayMarAI` helper (sketched below) shows how messages pass through each user’s agent before rendering:

```ts
async function relayMarAI(fromUserId, toUserId, rawMessage) {
    // 1. Interpret the sender’s message using their MarAI agent
    const senderPacket = await MarAI[fromUserId].interpret(rawMessage);

    // 2. Translate sender → receiver using the DNA engine
    const dnaPacket = await DNAEngine.translate(senderPacket, {
        from: fromUserId,
        to: toUserId
    });

    // 3. Ask the receiver’s MarAI to generate the final message
    const receiverOutput = await MarAI[toUserId].renderIncoming(dnaPacket);

    // 4. Deliver the final message to User B
    await deliverToUser(toUserId, receiverOutput);
}
```

When the receiver’s agent calls into the UI layer, feed the normalized emotional metadata from `receiverOutput` into the theme engine so the interface mirrors the sender’s emotional intent without leaking raw agent details.
