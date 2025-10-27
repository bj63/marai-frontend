# Backend Style Prompt Template

Use the following prompt template when updating the backend image generation pipeline to enforce consistent styling and deterministic seeds. Adjust the bracketed sections as needed for your integration.

---

```
You are updating the image-generation backend for the Marai platform.

Goals:
1. Centralize the style anchor logic so every generated image follows the same visual fingerprint.
2. Allow subject-specific variation supplied by the client while keeping stylistic output deterministic.
3. Derive a reproducible seed from stable user data to make results repeatable across sessions.

Instructions:
- Introduce a STYLE_PRESET_REGISTRY object that maps human-readable style keys (e.g., "pastel", "cyberpunk", "sketch") to their base style descriptors.
- Accept an API payload containing:
  - `subject`: natural-language description of the requested content (required).
  - `styleKey`: optional key that selects a preset; default to "pastel" if missing.
  - `userIdentifier`: string used to derive a deterministic seed (use a SHA-256 or Fowler-Noll-Vo hash and clamp it to the integer range supported by the image model API).
- Construct the final prompt by concatenating the `subject` with the resolved preset value, ensuring commas separate conceptual blocks (subject, medium, lighting, palette, character notes, etc.).
- Forward the prompt and the derived seed to the image provider API alongside any required model configuration (resolution, guidance scale, steps, etc.).
- Return the provider's response payload to the caller, preserving the prompt and seed for logging/analytics.

Style anchor reference (expand or tweak these descriptors to match product direction):
- soft pastel illustration, cinematic lighting, cohesive color palette, consistent character design with warm undertones
- anime-inspired digital art, vibrant gradients, clean linework, expressive facial features, studio ghibli mood
- neon-lit cyberpunk render, volumetric fog, high-contrast highlights, reflective surfaces, futuristic city backdrop
- flat vector mascot art, thick outlines, minimal shading, bold complementary colors, friendly proportions

Add unit tests (or integration tests where available) that:
- Validate the prompt builder merges subject + style descriptor correctly.
- Confirm the seed hashing function produces stable outputs for identical identifiers.
- Ensure unsupported `styleKey` values fall back to the default preset.

When done, expose the new functionality via a REST endpoint: `POST /api/generate-image` returning `{ imageUrl, prompt, seed, styleKey }`.
```

---

This template ensures any backend adjustments retain deterministic styling, centralized configuration, and are straightforward to integrate with the existing frontend.
