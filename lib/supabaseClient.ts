import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { IS_OFFLINE_MODE } from '@/constants/config'
import { getOfflineSession, getOfflineUser } from './offlineSession'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!IS_OFFLINE_MODE && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    'Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.',
  )
}

if (process.env.NODE_ENV === 'production' && IS_OFFLINE_MODE) {
  throw new Error('Offline mode cannot be used in production.')
}

export const supabase: SupabaseClient = !IS_OFFLINE_MODE && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'marai-auth-session',
        storage: typeof window === 'undefined' ? undefined : window.localStorage,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'X-Client-Info': `marai-frontend/${process.env.npm_package_version || '1.0.0'}`,
        },
      },
    })
  : createOfflineSupabaseClient()

function createOfflineSupabaseClient(): SupabaseClient {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Offline mode is disabled in production.')
  }

  console.warn('Running in offline mode. Supabase operations are mocked.')

  const offlineSession = getOfflineSession()
  const offlineUser = getOfflineUser()

  const unavailable = (method: string) => () => {
    throw new Error(
      `${method}() is unavailable in offline mode. Provide mock data for your component or hook instead.`,
    )
  }

  const auth = {
    async getSession() {
      return { data: { session: offlineSession }, error: null }
    },
    onAuthStateChange(callback: (event: string, session: typeof offlineSession | null) => void) {
      const subscription = {
        unsubscribe() {
          // no-op
        },
      }
      if (typeof callback === 'function') {
        callback('SIGNED_IN', offlineSession)
      }
      return { data: { subscription } }
    },
    async updateUser({ data }: { data?: Record<string, unknown> }) {
      offlineUser.user_metadata = { ...(offlineUser.user_metadata ?? {}), ...data }
      return { data: { user: offlineUser }, error: null }
    },
    async signInWithOtp() {
      return { data: { session: offlineSession }, error: null }
    },
    async signUp() {
      return { data: { session: offlineSession }, error: null }
    },
    async signInWithPassword() {
      return { data: { session: offlineSession }, error: null }
    },
    async signInWithOAuth() {
      return { data: { session: offlineSession }, error: null }
    },
    async signOut() {
      return { error: null }
    },
  }

  return {
    auth,
    from: () => ({
      select: unavailable('supabase.from().select'),
      insert: unavailable('supabase.from().insert'),
      update: unavailable('supabase.from().update'),
      delete: unavailable('supabase.from().delete'),
      eq: () => ({ execute: unavailable('execute') }),
    }),
    rpc: unavailable('supabase.rpc'),
    removeAllSubscriptions: unavailable('supabase.removeAllSubscriptions'),
    channel: unavailable('supabase.channel'),
    getChannels: unavailable('supabase.getChannels'),
    functions: {
      invoke: async () => ({
        data: null,
        error: new Error('Supabase Functions are disabled in offline mode.'),
      }),
    },
  } as unknown as SupabaseClient
}

export { getOfflineSession }

export async function isAuthenticated(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session !== null
}
