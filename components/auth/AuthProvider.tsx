'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { reportError } from '@/lib/observability'
import {
  requestMagicLink,
  signInWithGoogle,
  signInWithPassword,
  signOut as signOutFromSupabase,
  signUpWithPassword,
  type AuthResult,
} from '@/lib/supabaseApi'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  session: Session | null
  user: User | null
  status: AuthStatus
  signInWithMagicLink: (email: string) => Promise<AuthResult>
  signUpWithCredentials: (email: string, password: string, username: string) => Promise<AuthResult>
  signInWithCredentials: (email: string, password: string) => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let active = true

    const resolveSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (!active) return

        if (error) {
          reportError('AuthProvider.getSession', error)
          setSession(null)
          setStatus('unauthenticated')
          return
        }

        setSession(data.session ?? null)
        setStatus(data.session ? 'authenticated' : 'unauthenticated')
      } catch (error) {
        if (!active) return
        reportError('AuthProvider.resolveSession', error)
        setSession(null)
        setStatus('unauthenticated')
      }
    }

    resolveSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setStatus(nextSession ? 'authenticated' : 'unauthenticated')
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signInWithMagicLink = useCallback(
    async (email: string) => {
      setStatus('loading')
      const result = await requestMagicLink(email)
      setStatus(session ? 'authenticated' : 'unauthenticated')
      return result
    },
    [session],
  )

  const signUpWithCredentials = useCallback(
    async (email: string, password: string, username: string) => {
      setStatus('loading')
      const result = await signUpWithPassword(email, password, username)
      setStatus(session ? 'authenticated' : 'unauthenticated')
      return result
    },
    [session],
  )

  const signInWithCredentials = useCallback(
    async (email: string, password: string) => {
      setStatus('loading')
      const result = await signInWithPassword(email, password)
      if (result.error) {
        setStatus(session ? 'authenticated' : 'unauthenticated')
      }
      return result
    },
    [session],
  )

  const signInWithGoogleAccount = useCallback(async () => {
    setStatus('loading')
    const result = await signInWithGoogle()
    if (result.error) {
      setStatus(session ? 'authenticated' : 'unauthenticated')
    }
    return result
  }, [session])

  const signOut = useCallback(async () => {
    setStatus('loading')
    await signOutFromSupabase()
    setSession(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      status,
      signInWithMagicLink,
      signUpWithCredentials,
      signInWithCredentials,
      signInWithGoogle: signInWithGoogleAccount,
      signOut,
    }),
    [session, signInWithCredentials, signInWithGoogleAccount, signInWithMagicLink, signOut, signUpWithCredentials, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
