'use client'

import { useMemo, useState } from 'react'

type RequestState = 'idle' | 'pending' | 'accepted' | 'rejected'
type Variant = 'primary' | 'pending' | 'success' | 'danger'

type FriendRequestButtonProps = {
  initialState?: RequestState
  onSendRequest?: () => Promise<void> | void
  onCancelRequest?: () => Promise<void> | void
  onAcceptRequest?: () => Promise<void> | void
  onRejectRequest?: () => Promise<void> | void
}

export function FriendRequestButton({
  initialState = 'idle',
  onSendRequest,
  onCancelRequest,
  onAcceptRequest,
  onRejectRequest,
}: FriendRequestButtonProps) {
  const [state, setState] = useState<RequestState>(initialState)
  const [isLoading, setIsLoading] = useState(false)

  const canAccept = typeof onAcceptRequest === 'function'
  const canReject = typeof onRejectRequest === 'function'
  const canRespondToIncomingRequest = canAccept || canReject

  const { label, variant } = useMemo(() => {
    switch (state) {
      case 'pending':
        return { label: 'Request Sent', variant: 'pending' as Variant }
      case 'accepted':
        return { label: 'Friends', variant: 'success' as Variant }
      case 'rejected':
        return { label: 'Request Rejected', variant: 'danger' as Variant }
      default:
        return { label: 'Add Friend', variant: 'primary' as Variant }
    }
  }, [state])

  async function handle(action: () => Promise<void> | void, nextState: RequestState) {
    try {
      setIsLoading(true)
      await action()
      setState(nextState)
    } finally {
      setIsLoading(false)
    }
  }

  const baseStyles =
    'rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60'
  const variantStyles: Record<Variant, string> = {
    primary: 'border-emerald-400 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30',
    pending: 'border-white/20 bg-white/10 text-white/70 hover:bg-white/20',
    success: 'border-indigo-400 bg-indigo-500/20 text-indigo-200',
    danger: 'border-rose-400 bg-rose-500/20 text-rose-200',
  }

  const shouldShowResponseControls =
    state === 'pending' && Boolean(onAcceptRequest || onRejectRequest)

  return (
    <div className="flex flex-wrap items-center gap-3 text-white/70">
      <button
        type="button"
        disabled={state === 'accepted' || state === 'rejected' || isLoading}
        className={[baseStyles, variantStyles[variant]].join(' ')}
        onClick={() => {
          if (state === 'idle') {
            void handle(async () => {
              await onSendRequest?.()
            }, 'pending')
          }
        }}
      >
        {isLoading ? 'Processing…' : label}
      </button>

      {state === 'pending' && (
        <button
          type="button"
          className="text-xs font-medium uppercase tracking-wide text-white/60 hover:text-white"
          onClick={() => {
            void handle(async () => {
              await onCancelRequest?.()
            }, 'idle')
          }}
        >
          Cancel
        </button>
      )}

      {state === 'idle' && (
        <button
          type="button"
          className="text-xs font-medium uppercase tracking-wide text-white/60 hover:text-white"
          onClick={() => {
            void handle(async () => {
              await onRejectRequest?.()
            }, 'rejected')
          }}
        >
          Block
        </button>
      )}

      {state === 'pending' && canRespondToIncomingRequest && (
        <>
          {canAccept && (
      {state === 'pending' && (onAcceptRequest || onRejectRequest) && (
      {shouldShowResponseControls && (
        <>
          {onAcceptRequest && (
            <button
              type="button"
              className="text-xs font-medium uppercase tracking-wide text-emerald-300 hover:text-emerald-200"
              onClick={() => {
                void handle(async () => {
                  await onAcceptRequest?.()
                  await onAcceptRequest()
                }, 'accepted')
              }}
            >
              Accept
            </button>
          )}
          {canReject && (
          {onRejectRequest && (
            <button
              type="button"
              className="text-xs font-medium uppercase tracking-wide text-rose-300 hover:text-rose-200"
              onClick={() => {
                void handle(async () => {
                  await onRejectRequest?.()
                  await onRejectRequest()
                }, 'rejected')
              }}
            >
              Decline
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default FriendRequestButton
