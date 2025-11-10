import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  IS_DEVELOPMENT,
  IS_OFFLINE_MODE,
  IS_PRODUCTION,
  IS_SUPABASE_CONFIGURED,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from '@/constants/config'
import { getOfflineSession, getOfflineUser } from './offlineSession'

export type SupabaseRuntimeMode = 'online' | 'offline' | 'disabled'

const runtimeMode: SupabaseRuntimeMode = IS_SUPABASE_CONFIGURED
  ? 'online'
  : IS_OFFLINE_MODE
    ? 'offline'
    : 'disabled'

const configurationMessage = !IS_SUPABASE_CONFIGURED
  ? 'Supabase credentials are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
  : null

if (configurationMessage) {
  const logger = IS_PRODUCTION ? console.error : console.warn
  logger(`[supabase] ${configurationMessage}${IS_PRODUCTION ? '' : ' Falling back to mocked data.'}`)
}

export const supabaseRuntime = {
  mode: runtimeMode,
  message: configurationMessage,
}

export const isSupabaseConfigured = runtimeMode === 'online'
export const isSupabaseDisabled = runtimeMode === 'disabled'

export const supabase: SupabaseClient = runtimeMode === 'online' && SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
  : runtimeMode === 'offline'
    ? createOfflineSupabaseClient()
    : createDisabledSupabaseClient(configurationMessage ?? 'Supabase credentials are not configured.')

function createOfflineSupabaseClient(): SupabaseClient {
  if (!IS_DEVELOPMENT) {
    throw new Error('Offline mode is only supported during development.')
  }

  console.warn('Running in offline mode. Supabase operations are mocked and not persisted.')

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

function createDisabledSupabaseClient(reason: string): SupabaseClient {
  const errorFactory = (method: string) => () => {
    throw new Error(`${method} cannot run because ${reason}`)
  }

  const promiseReject = (method: string) => async (..._args: unknown[]) => {
    throw new Error(`${method} cannot run because ${reason}`)
  }

  const builder = () => {
    const fail = (method: string) => () => builder()

    return {
      select: fail('supabase.from().select'),
      insert: fail('supabase.from().insert'),
      update: fail('supabase.from().update'),
      delete: fail('supabase.from().delete'),
      eq: fail('supabase.from().eq'),
      neq: fail('supabase.from().neq'),
      order: fail('supabase.from().order'),
      range: fail('supabase.from().range'),
      limit: fail('supabase.from().limit'),
      match: fail('supabase.from().match'),
      contains: fail('supabase.from().contains'),
      in: fail('supabase.from().in'),
      ilike: fail('supabase.from().ilike'),
      textSearch: fail('supabase.from().textSearch'),
      returns: fail('supabase.from().returns'),
      maybeSingle: promiseReject('supabase.from().maybeSingle'),
      single: promiseReject('supabase.from().single'),
      throwOnError: fail('supabase.from().throwOnError'),
      then: undefined,
    }
  }

  const disabledError = new Error(reason)

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: disabledError }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
        error: disabledError,
      }),
      updateUser: async () => ({ data: { user: null }, error: disabledError }),
      signInWithOtp: async () => ({ data: { session: null }, error: disabledError }),
      signUp: async () => ({ data: { session: null }, error: disabledError }),
      signInWithPassword: async () => ({ data: { session: null }, error: disabledError }),
      signInWithOAuth: async () => ({ data: { session: null }, error: disabledError }),
      signOut: async () => ({ error: disabledError }),
      reauthenticate: promiseReject('supabase.auth.reauthenticate'),
      refreshSession: promiseReject('supabase.auth.refreshSession'),
      exchangeCodeForSession: promiseReject('supabase.auth.exchangeCodeForSession'),
      getUser: promiseReject('supabase.auth.getUser'),
      getSessionFromUrl: promiseReject('supabase.auth.getSessionFromUrl'),
      getUserIdentities: promiseReject('supabase.auth.getUserIdentities'),
      listFactors: promiseReject('supabase.auth.listFactors'),
      onTokenChanged: () => ({ data: { subscription: { unsubscribe() {} } }, error: disabledError }),
      resetPasswordForEmail: promiseReject('supabase.auth.resetPasswordForEmail'),
      resend: promiseReject('supabase.auth.resend'),
      verifyOtp: promiseReject('supabase.auth.verifyOtp'),
      mfa: {
        enroll: promiseReject('supabase.auth.mfa.enroll'),
        unenroll: promiseReject('supabase.auth.mfa.unenroll'),
        challengeAndVerify: promiseReject('supabase.auth.mfa.challengeAndVerify'),
        challenge: promiseReject('supabase.auth.mfa.challenge'),
        verify: promiseReject('supabase.auth.mfa.verify'),
      },
    },
    from: ((..._args: Parameters<SupabaseClient['from']>) => builder()) as SupabaseClient['from'],
    rpc: promiseReject('supabase.rpc') as SupabaseClient['rpc'],
    removeAllSubscriptions: promiseReject('supabase.removeAllSubscriptions'),
    channel: () => ({
      subscribe: promiseReject('supabase.channel().subscribe'),
      on: errorFactory('supabase.channel().on'),
      send: promiseReject('supabase.channel().send'),
      unsubscribe: promiseReject('supabase.channel().unsubscribe'),
    }),
    getChannels: () => [],
    functions: {
      invoke: async () => ({ data: null, error: disabledError }),
    },
    storage: {
      from: () => ({
        download: promiseReject('supabase.storage.from().download'),
        upload: promiseReject('supabase.storage.from().upload'),
        remove: promiseReject('supabase.storage.from().remove'),
        update: promiseReject('supabase.storage.from().update'),
        createSignedUrl: promiseReject('supabase.storage.from().createSignedUrl'),
        createSignedUrls: promiseReject('supabase.storage.from().createSignedUrls'),
        createSignedUploadUrl: promiseReject('supabase.storage.from().createSignedUploadUrl'),
        list: promiseReject('supabase.storage.from().list'),
        move: promiseReject('supabase.storage.from().move'),
        copy: promiseReject('supabase.storage.from().copy'),
        getPublicUrl: () => ({ data: { publicUrl: null }, error: disabledError }),
        removeSigneds: promiseReject('supabase.storage.from().removeSigneds'),
        downloadSignedUrl: promiseReject('supabase.storage.from().downloadSignedUrl'),
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
