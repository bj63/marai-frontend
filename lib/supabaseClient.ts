import { createClient } from '@supabase/supabase-js'

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

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not configured. Set SUPABASE_URL and SUPABASE_KEY in your environment.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'marai-auth-session',
    storage: typeof window === 'undefined' ? undefined : window.localStorage,
  },
})
