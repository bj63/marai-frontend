'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'

import { AlertTriangle, Loader2, Mic, MicOff, Video, VideoOff, Waves } from 'lucide-react'

import { useFactimeSession } from '@/lib/factime/use-factime-session'

const connectionLabels: Record<string, string> = {
  idle: 'Idle',
  'requesting-media': 'Requesting camera & microphone',
  connecting: 'Connecting to Factime',
  connected: 'Connected',
  reconnecting: 'Attempting to reconnect',
  error: 'Error',
}

interface FactimeProps {
  userId: string
  consentToken?: string
  onDisconnect: () => void
}

export default function Factime({ userId, consentToken, onDisconnect }: FactimeProps) {
  const [state, controls] = useFactimeSession()
  const [manualTranscript, setManualTranscript] = useState('')
  const [isTranscriptPinned, setIsTranscriptPinned] = useState(true)

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null)

  const timestampFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }),
    []
  )

  useEffect(() => {
    if (localVideoRef.current && state.localStream) {
      localVideoRef.current.srcObject = state.localStream
      void localVideoRef.current.play().catch(() => undefined)
    }
  }, [state.localStream])

  useEffect(() => {
    if (remoteVideoRef.current && state.remoteStream) {
      remoteVideoRef.current.srcObject = state.remoteStream
      void remoteVideoRef.current.play().catch(() => undefined)
    }
  }, [state.remoteStream])

  useEffect(() => {
    if (!isTranscriptPinned) {
      return
    }

    const container = transcriptContainerRef.current
    if (!container) {
      return
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: state.transcripts.length > 1 ? 'smooth' : 'auto',
    })
  }, [isTranscriptPinned, state.transcripts])

  useEffect(() => {
    if (state.connectionState === 'idle') {
      setIsTranscriptPinned(true)
    }
  }, [state.connectionState])

  const isConnecting = useMemo(
    () =>
      state.connectionState === 'requesting-media' ||
      state.connectionState === 'connecting' ||
      state.connectionState === 'reconnecting',
    [state.connectionState]
  )

  const connectionPresentation = useMemo(() => {
    switch (state.connectionState) {
      case 'connected':
        return {
          badge: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
          dot: 'bg-emerald-400',
          icon: <Waves className="h-3 w-3" />,
          shouldPulse: false,
        }
      case 'error':
        return {
          badge: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
          dot: 'bg-rose-400',
          icon: <AlertTriangle className="h-3 w-3" />,
          shouldPulse: false,
        }
      case 'requesting-media':
      case 'connecting':
      case 'reconnecting':
        return {
          badge: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
          dot: 'bg-amber-300',
          icon: <Loader2 className="h-3 w-3 animate-spin" />, 
          shouldPulse: true,
        }
      default:
        return {
          badge: 'border-slate-800 bg-slate-900/80 text-slate-300',
          dot: 'bg-slate-500/70',
          icon: <Waves className="h-3 w-3 opacity-70" />,
          shouldPulse: false,
        }
    }
  }, [state.connectionState])

  const handleTranscriptMouseEnter = () => setIsTranscriptPinned(false)
  const handleTranscriptMouseLeave = () => {
    setIsTranscriptPinned(true)
    requestAnimationFrame(() => {
      const container = transcriptContainerRef.current
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
      }
    })
  }

  const connectionLabel = connectionLabels[state.connectionState] ?? state.connectionState

  useEffect(() => {
    if (userId) {
      controls
        .connect({ userId, consentToken: consentToken || undefined })
        .catch((error) => console.error('Failed to start Factime session', error))
    }

    return () => {
      controls.disconnect()
    }
  }, [userId, consentToken, controls])

  const handleDisconnect = () => {
    controls.disconnect()
    onDisconnect()
  }

  const handleTranscriptSend = (event: FormEvent) => {
    event.preventDefault()
    if (!manualTranscript.trim()) {
      return
    }

    controls.sendTranscript(manualTranscript.trim())
    setManualTranscript('')
  }

  return (
    <div className="flex min-h-screen flex-col gap-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-slate-100">
      <header className="mx-auto flex w-full max-w-5xl flex-col items-start gap-3 text-left">
        <h1 className="text-3xl font-semibold sm:text-4xl">Factime Live Session</h1>
        <p className="text-sm text-slate-300 sm:text-base">
          Connect to the refreshed Factime backend to start an AI avatar call. Configure your user identifier and consent token,
          then share microphone and camera access when prompted.
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium shadow-sm ${connectionPresentation.badge}`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${connectionPresentation.dot} ${connectionPresentation.shouldPulse ? 'animate-pulse' : ''}`}
              aria-hidden
            />
            {connectionPresentation.icon}
            <span>{connectionLabel}</span>
          </span>

          {isConnecting ? (
            <span className="inline-flex items-center gap-2 text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Negotiating media and signaling&hellip;</span>
            </span>
          ) : null}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">

        <section className="grid gap-6 md:grid-cols-2">
          <div className="glass relative flex min-h-[260px] flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">You</h2>
              <span className="text-xs uppercase tracking-wide text-slate-500">Local preview</span>
            </header>
            <div className="relative mt-4 flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-slate-950/60">
              <video ref={localVideoRef} className="h-full w-full object-cover" muted playsInline />
              {state.isVideoMuted ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Camera paused
                </div>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={controls.toggleAudio}
                disabled={!state.localStream}
                aria-pressed={state.isAudioMuted}
                aria-label={state.isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  state.isAudioMuted
                    ? 'border-rose-400/40 bg-rose-500/15 text-rose-100 hover:border-rose-300/60'
                    : 'border-slate-700 bg-slate-900/40 text-slate-100 hover:border-cyan-400/60 hover:text-white'
                } ${!state.localStream ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                {state.isAudioMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span>{state.isAudioMuted ? 'Unmute mic' : 'Mute mic'}</span>
              </button>

              <button
                type="button"
                onClick={controls.toggleVideo}
                disabled={!state.localStream}
                aria-pressed={state.isVideoMuted}
                aria-label={state.isVideoMuted ? 'Resume camera' : 'Turn off camera'}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  state.isVideoMuted
                    ? 'border-amber-400/40 bg-amber-500/15 text-amber-100 hover:border-amber-300/60'
                    : 'border-slate-700 bg-slate-900/40 text-slate-100 hover:border-cyan-400/60 hover:text-white'
                } ${!state.localStream ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                {state.isVideoMuted ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                <span>{state.isVideoMuted ? 'Resume cam' : 'Stop cam'}</span>
              </button>
            </div>
          </div>

          <div className="glass relative flex min-h-[260px] flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">AI Avatar</h2>
              <span className="text-xs uppercase tracking-wide text-slate-500">Remote stream</span>
            </header>
            <div className="mt-4 flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-slate-950/60">
              {state.remoteStream ? (
                <video ref={remoteVideoRef} className="h-full w-full object-cover" playsInline />
              ) : (
                <div className="flex h-48 w-full flex-col items-center justify-center gap-3 text-center text-sm text-slate-500">
                  <div className="h-14 w-14 animate-pulse rounded-full bg-slate-800/80" />
                  <p className="max-w-[14rem] text-xs text-slate-400">
                    Waiting for remote video&mdash;the avatar feed connects automatically once the backend sends frames.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="glass grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <header className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-slate-100">Transcript</h2>
            <p className="text-sm text-slate-400">
              Live transcript of both the participant and the AI avatar. Hover to pause auto-scroll and inspect earlier turns.
            </p>
          </header>

          <div
            ref={transcriptContainerRef}
            className="flex max-h-80 flex-col gap-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm"
            onMouseEnter={handleTranscriptMouseEnter}
            onMouseLeave={handleTranscriptMouseLeave}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {state.transcripts.length === 0 ? (
              <p className="text-slate-500">No conversation yet. Speak to the avatar or send a manual transcript below.</p>
            ) : (
              state.transcripts.map((entry) => {
                const isUser = entry.role === 'user'
                return (
                  <article key={entry.id} className="flex flex-col gap-1">
                    <span
                      className={`text-xs font-medium uppercase tracking-wide ${
                        isUser ? 'text-cyan-300/80' : 'text-violet-200/80'
                      }`}
                    >
                      {isUser ? 'You' : 'AI'} · {timestampFormatter.format(entry.timestamp)}
                    </span>
                    <p
                      className={`rounded-lg border px-3 py-2 text-sm shadow-sm ${
                        isUser
                          ? 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100'
                          : 'border-slate-700 bg-slate-900/80 text-slate-100'
                      }`}
                    >
                      {entry.text}
                    </p>
                  </article>
                )
              })
            )}
          </div>

          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleTranscriptSend}>
            <input
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
              placeholder="Type a transcript snippet to send"
              value={manualTranscript}
              onChange={(event) => setManualTranscript(event.target.value)}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              disabled={!manualTranscript.trim() || state.connectionState === 'idle'}
            >
              Send to Backend
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
