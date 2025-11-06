"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type FactimeSocketEvent =
  | { type: 'user-transcript'; text: string; timestamp?: string }
  | { type: 'ai-response'; text: string; timestamp?: string }
  | { type: 'ai-audio'; audio: string; format?: string; timestamp?: string }
  | { type: 'ai-error'; message: string; retryable?: boolean }
  | { type: 'ice-candidate'; candidate: RTCIceCandidateInit }
  | { type: 'answer'; sdp: string }

export type FactimeConnectionState =
  | 'idle'
  | 'requesting-media'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'

export interface ConnectParams {
  userId: string
  consentToken?: string
}

export interface TranscriptEntry {
  id: string
  role: 'user' | 'ai'
  text: string
  timestamp: number
}

export interface FactimeSessionState {
  connectionState: FactimeConnectionState
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  transcripts: TranscriptEntry[]
  lastError?: string
}

export interface FactimeSessionControls {
  connect: (params: ConnectParams) => Promise<void>
  disconnect: () => void
  sendTranscript: (text: string, audioBase64?: string) => void
}

function parseIceServers(): RTCIceServer[] | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const raw = process.env.NEXT_PUBLIC_FACTIME_ICE_SERVERS

  if (!raw) {
    return undefined
  }

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch (error) {
    console.warn('Unable to parse NEXT_PUBLIC_FACTIME_ICE_SERVERS', error)
  }

  return undefined
}

function ensureWsBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_FACTIME_WS_URL

  if (!url) {
    throw new Error('NEXT_PUBLIC_FACTIME_WS_URL is not defined')
  }

  return url.replace(/\/$/, '')
}

function generateId(prefix: 'user' | 'ai'): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${prefix}-${random}`
}

function toTranscript(entry: { role: 'user' | 'ai'; text: string; timestamp?: string }): TranscriptEntry {
  return {
    id: generateId(entry.role),
    role: entry.role,
    text: entry.text,
    timestamp: entry.timestamp ? Date.parse(entry.timestamp) : Date.now(),
  }
}

function decodeBase64Audio(payload: { audio: string; format?: string }): Blob {
  const { audio, format } = payload
  const binaryString = atob(audio)
  const len = binaryString.length
  const bytes = new Uint8Array(len)

  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return new Blob([bytes], { type: format ?? 'audio/mpeg' })
}

export function useFactimeSession(): [FactimeSessionState, FactimeSessionControls] {
  const [connectionState, setConnectionState] = useState<FactimeConnectionState>('idle')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([])
  const [lastError, setLastError] = useState<string>()

  const wsRef = useRef<WebSocket | null>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const remoteMediaRef = useRef<MediaStream | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastConnectParamsRef = useRef<ConnectParams | null>(null)
  const connectRef = useRef<((params: ConnectParams) => Promise<void>) | null>(null)

  const peerConfig = useMemo<RTCConfiguration | undefined>(() => {
    const iceServers = parseIceServers()
    if (!iceServers) {
      return undefined
    }

    return { iceServers }
  }, [])

  const cleanup = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null

    peerRef.current?.getSenders().forEach((sender) => {
      sender.track?.stop()
    })
    peerRef.current?.close()
    peerRef.current = null

    localStream?.getTracks().forEach((track) => track.stop())
    setLocalStream(null)

    remoteMediaRef.current = null
    setRemoteStream(null)

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }, [localStream])

  const disconnect = useCallback(() => {
    lastConnectParamsRef.current = null
    cleanup()
    setConnectionState('idle')
    setTranscripts([])
    setLastError(undefined)
  }, [cleanup])

  const handleIncomingMessage = useCallback(
    async (event: MessageEvent<string>) => {
      try {
        const message: FactimeSocketEvent = JSON.parse(event.data)

        switch (message.type) {
          case 'answer': {
            if (!peerRef.current) {
              return
            }

            await peerRef.current.setRemoteDescription({ type: 'answer', sdp: message.sdp })
            break
          }

          case 'ice-candidate': {
            if (!peerRef.current) {
              return
            }

            try {
              await peerRef.current.addIceCandidate(message.candidate)
            } catch (error) {
              console.error('Failed to add ICE candidate', error)
            }
            break
          }

          case 'user-transcript':
            setTranscripts((prev) => [...prev, toTranscript({ role: 'user', text: message.text, timestamp: message.timestamp })])
            break

          case 'ai-response':
            setTranscripts((prev) => [...prev, toTranscript({ role: 'ai', text: message.text, timestamp: message.timestamp })])
            break

          case 'ai-audio': {
            const blob = decodeBase64Audio(message)
            const url = URL.createObjectURL(blob)
            const audio = new Audio(url)
            audio.onended = () => URL.revokeObjectURL(url)
            audio.play().catch((error) => console.warn('Unable to autoplay AI audio', error))
            break
          }

          case 'ai-error':
            setLastError(message.message)
            break

          default:
            break
        }
      } catch (error) {
        console.error('Unable to parse Factime socket event', error)
      }
    },
    []
  )

  const createPeerConnection = useCallback(
    (stream: MediaStream) => {
      const peer = new RTCPeerConnection(peerConfig)
      peerRef.current = peer

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream)
      })

      const remoteStreamInstance = new MediaStream()
      remoteMediaRef.current = remoteStreamInstance
      setRemoteStream(remoteStreamInstance)

      peer.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => {
          remoteStreamInstance.addTrack(track)
        })
      }

      peer.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }))
        }
      }

      peer.onconnectionstatechange = () => {
        if (!peerRef.current) {
          return
        }

        const state = peerRef.current.connectionState
        if (state === 'connected') {
          setConnectionState('connected')
        } else if (state === 'failed') {
          setConnectionState('error')
        } else if (state === 'disconnected') {
          setConnectionState('reconnecting')
        }
      }

      return peer
    },
    [peerConfig]
  )

  const setupWebSocket = useCallback(
    async (params: ConnectParams, stream: MediaStream) => {
      const baseUrl = ensureWsBaseUrl()
      const ws = new WebSocket(`${baseUrl}/ws/${encodeURIComponent(params.userId)}`)

      wsRef.current = ws

      ws.onopen = async () => {
        setConnectionState('connecting')
        setLastError(undefined)

        const peer = createPeerConnection(stream)

        const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        await peer.setLocalDescription(offer)

        ws.send(
          JSON.stringify({
            type: 'offer',
            sdp: offer.sdp,
            consentToken: params.consentToken,
          })
        )
      }

      ws.onmessage = handleIncomingMessage

      ws.onclose = () => {
        setConnectionState((state) => (state === 'connected' ? 'reconnecting' : state))
        if (lastConnectParamsRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            if (connectRef.current && lastConnectParamsRef.current) {
              connectRef.current(lastConnectParamsRef.current).catch((error) => {
                console.error('Failed to reconnect Factime session', error)
              })
            }
          }, 2000)
        }
      }

      ws.onerror = (event) => {
        console.error('Factime websocket error', event)
        setConnectionState('error')
        setLastError('Unable to maintain websocket connection.')
      }
    },
    [createPeerConnection, handleIncomingMessage]
  )

  const connect = useCallback(
    async (params: ConnectParams) => {
      lastConnectParamsRef.current = params
      setConnectionState('requesting-media')
      setTranscripts([])
      setLastError(undefined)

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        setLocalStream(stream)

        await setupWebSocket(params, stream)
      } catch (error) {
        console.error('Unable to start Factime session', error)
        setConnectionState('error')
        setLastError(error instanceof Error ? error.message : 'Unknown error obtaining media devices.')
      }
    },
    [setupWebSocket]
  )

  useEffect(() => {
    connectRef.current = connect
    return () => {
      connectRef.current = null
    }
  }, [connect])

  useEffect(() => () => {
    cleanup()
  }, [cleanup])

  const sendTranscript = useCallback((text: string, audioBase64?: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Factime websocket is not open; skipping transcript send')
      return
    }

    wsRef.current.send(
      JSON.stringify({
        type: 'transcript',
        text,
        audio: audioBase64,
      })
    )

    setTranscripts((prev) => [...prev, { id: generateId('user'), role: 'user', text, timestamp: Date.now() }])
  }, [])

  return [
    { connectionState, localStream, remoteStream, transcripts, lastError },
    { connect, disconnect, sendTranscript },
  ]
}
