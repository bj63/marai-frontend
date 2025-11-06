# MarAI Frontend Integration Plan for Factime Backend

This plan outlines how to connect the refreshed Factime backend to a future MarAI
frontend experience.

## 1. Session Bootstrapping
- Use the existing Flask authentication flow to obtain a JWT and reuse the
  `/api/chat` consent payload to preload emotional state.
- Request a WebRTC session by opening a websocket to `ws://<backend>/ws/{userId}`
  immediately after the user lands on the call lobby.
- On connection, listen for the `user-transcript`, `ai-response`, and `ai-audio`
  events emitted by the backend to drive UI state.

## 2. Media and Signaling
- Gather local audio/video using the browser `MediaDevices` API and create a
  `RTCPeerConnection` that mirrors the server behaviour.
- Send an SDP offer via websocket `{ type: "offer", sdp }` and apply the
  returned answer to establish the media channels.
- When the browser generates ICE candidates, forward them as websocket messages
  and extend the backend to echo remote candidates back (if needed for TURN).

## 3. Transcript Pipeline
- Stream microphone audio both to the peer connection and to an on-device STT
  component (e.g. Web Speech API or VAD + Whisper). Forward recognized phrases
  using `{ type: "transcript", text, audio?: base64 }` so the backend can run
  HybridIntelligence.
- Surface interim results in the UI while waiting for the backend `ai-response`
  event. When `ai-audio` is present, play the decoded audio buffer.

## 4. Avatar Rendering
- Subscribe to the remote video track from the peer connection and render it in
  a `<video>` element. The backend refreshes frames with the latest avatar state
  every 5 seconds, so add a subtle loading shimmer when no frames have arrived.
- Provide controls (mute, end call, escalate) that translate to websocket
  messages or REST calls, matching cooldown rules defined in the backend.

## 5. Error Handling & Resilience
- Listen for websocket closures and display a reconnect toast. Retry the entire
  handshake with exponential backoff while preserving the conversation log.
- When `ai-error` events are received, surface a non-blocking banner and allow
  the user to retry the transcript or fall back to text chat via `/api/chat`.
- Log signaling metrics (latency, disconnections) so they can be correlated with
  backend telemetry stored in Supabase.

## 6. Testing & Observability
- Create Playwright specs that mock microphone input to verify transcript → AI
  loops render correctly.
- Add Cypress visual snapshots to ensure avatar frames align with the design
  system.
- Feed websocket events into a Redux slice or React Query cache and assert store
  updates in Jest using the backend-provided mock responses.

Following this plan keeps the frontend thin while leveraging the enriched backend
Factime services for AI avatar calls.
