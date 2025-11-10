export const IS_OFFLINE_MODE =
  process.env.NODE_ENV === 'development' &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
