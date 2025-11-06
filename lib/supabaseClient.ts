import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getOfflineSession, getOfflineUser } from './offlineSession'

const resolveEnv = (primary: string | undefined, fallback?: string | undefined) => {
  if (primary && primary.trim().length > 0) {
    return primary.trim()
  }

  if (fallback && fallback.trim().length > 0) {
    return fallback.trim()
  }

  return null
}

const supabaseUrl = resolveEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL)
const supabaseAnonKey = resolveEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, process.env.SUPABASE_KEY)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

function createOfflineSupabaseClient(): SupabaseClient {
  const offlineSession = getOfflineSession()
  const offlineUser = getOfflineUser()

  const unavailable = (method: string) => () => {
    throw new Error(
      `${method} is unavailable because Supabase credentials are not configured. ` +
        'The offline API stubs should handle your data needs while developing without the backend.',
    )
  }

  const auth = {
    async getSession() {
      return { data: { session: offlineSession }, error: null }
    },
    onAuthStateChange(callback: (event: string, session: typeof offlineSession | null) => void) {
      const subscription = {
        unsubscribe() {
          // no-op in offline mode
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
    from: unavailable('supabase.from'),
    rpc: unavailable('supabase.rpc'),
    removeAllSubscriptions: unavailable('supabase.removeAllSubscriptions'),
    channel: unavailable('supabase.channel'),
    getChannels: unavailable('supabase.getChannels'),
    functions: {
      invoke: async () => ({ data: null, error: new Error('Supabase functions are disabled in offline mode.') }),
    },
  } as unknown as SupabaseClient
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'marai-auth-session',
        storage: typeof window === 'undefined' ? undefined : window.localStorage,
      },
    })
  : createOfflineSupabaseClient()

export { getOfflineSession }
