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
  getUserSettings,
  getUserDesignProfile,
  type AuthResult,
  type UserSettings,
  type UserDesignProfile,
} from '@/lib/supabaseApi'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  session: Session | null
  user: User | null
  status: AuthStatus
  settings: UserSettings | null
  designProfile: UserDesignProfile | null
  accountHydrated: boolean
  refreshAccountData: () => Promise<void>
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
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [designProfile, setDesignProfile] = useState<UserDesignProfile | null>(null)
  const [accountHydrated, setAccountHydrated] = useState(false)

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
      if (!nextSession) {
        setSettings(null)
        setDesignProfile(null)
        setAccountHydrated(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const hydrateForUser = useCallback(async (userId: string) => {
    try {
      const [fetchedSettings, fetchedDesignProfile] = await Promise.all([
        getUserSettings(userId),
        getUserDesignProfile(userId),
      ])

      setSettings(fetchedSettings)
      setDesignProfile(fetchedDesignProfile)
      setAccountHydrated(true)
    } catch (error) {
      reportError('AuthProvider.hydrateForUser', error, { userId })
      setAccountHydrated(false)
    }
  }, [])

  const refreshAccountData = useCallback(async () => {
    const userId = session?.user?.id
    if (!userId) {
      setSettings(null)
      setDesignProfile(null)
      setAccountHydrated(false)
      return
    }

    await hydrateForUser(userId)
  }, [hydrateForUser, session?.user?.id])

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setSettings(null)
      setDesignProfile(null)
      setAccountHydrated(false)
      return
    }

    let active = true

    const hydrate = async () => {
      try {
        await hydrateForUser(session.user.id)
        if (!active) return
      } catch (error) {
        if (!active) return
        reportError('AuthProvider.hydrateAccount', error, { userId: session.user.id })
        setAccountHydrated(false)
      }
    }

    hydrate()

    return () => {
      active = false
    }
  }, [hydrateForUser, session?.user?.id, status])

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
      if (!result.error) {
        const { data } = await supabase.auth.getSession()
        const userId = data.session?.user?.id
        if (userId) {
          await hydrateForUser(userId)
        }
      }
      return result
    },
    [hydrateForUser, session],
  )

  const signInWithCredentials = useCallback(
    async (email: string, password: string) => {
      setStatus('loading')
      const result = await signInWithPassword(email, password)
      if (result.error) {
        setStatus(session ? 'authenticated' : 'unauthenticated')
      } else {
        const { data } = await supabase.auth.getSession()
        const userId = data.session?.user?.id
        if (userId) {
          await hydrateForUser(userId)
        }
      }
      return result
    },
    [hydrateForUser, session],
  )

  const signInWithGoogleAccount = useCallback(async () => {
    setStatus('loading')
    const result = await signInWithGoogle()
    if (result.error) {
      setStatus(session ? 'authenticated' : 'unauthenticated')
    } else {
      const { data } = await supabase.auth.getSession()
      const userId = data.session?.user?.id
      if (userId) {
        await hydrateForUser(userId)
      }
    }
    return result
  }, [hydrateForUser, session])

  const signOut = useCallback(async () => {
    setStatus('loading')
    await signOutFromSupabase()
    setSession(null)
    setStatus('unauthenticated')
    setSettings(null)
    setDesignProfile(null)
    setAccountHydrated(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      status,
      settings,
      designProfile,
      accountHydrated,
      refreshAccountData,
      signInWithMagicLink,
      signUpWithCredentials,
      signInWithCredentials,
      signInWithGoogle: signInWithGoogleAccount,
      signOut,
    }),
    [
      accountHydrated,
      designProfile,
      refreshAccountData,
      session,
      settings,
      signInWithCredentials,
      signInWithGoogleAccount,
      signInWithMagicLink,
      signOut,
      signUpWithCredentials,
      status,
    ],
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
