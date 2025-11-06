'use client'

import { useEffect, useRef, useState } from 'react'
import Peer from '@ffgflash/simple-peer'

interface VideoCallProps {
  initiator: boolean
  onClose: () => void
}

export default function VideoCall({ initiator, onClose }: VideoCallProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [peer, setPeer] = useState<Peer.Instance | null>(null)
  const localVideo = useRef<HTMLVideoElement>(null)
  const remoteVideo = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setStream(stream)
      if (localVideo.current) {
        localVideo.current.srcObject = stream
      }

      const newPeer = new Peer({
        initiator,
        stream,
        trickle: false,
      })

      newPeer.on('signal', (data) => {
        // TODO: Implement signaling server
        console.log('SIGNAL', JSON.stringify(data))
      })

      newPeer.on('stream', (stream) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = stream
        }
      })

      setPeer(newPeer)
    })

    return () => {
      if (peer) {
        peer.destroy()
      }
    }
  }, [initiator, peer])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative h-[80vh] w-[80vw] rounded-lg bg-gray-900 p-4">
        <video ref={localVideo} autoPlay muted className="absolute bottom-4 right-4 h-1/4 w-1/4 rounded-lg border-2 border-white/20" />
        <video ref={remoteVideo} autoPlay className="h-full w-full rounded-lg" />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-red-500 p-2 text-white"
        >
          End Call
        </button>
      </div>
    </div>
  )
}
