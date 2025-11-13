import type { Session, User } from '@supabase/supabase-js'

const OFFLINE_USER_ID = 'offline-user'

const now = new Date().toISOString()

const offlineUser = {
  id: OFFLINE_USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'builder@marai.local',
  email_confirmed_at: now,
  phone: '',
  last_sign_in_at: now,
  created_at: now,
  updated_at: now,
  confirmation_sent_at: now,
  confirmed_at: now,
  app_metadata: {
    provider: 'email',
    providers: ['email'],
    roles: ['admin', 'developer', 'pro', 'founder'],
    isAdmin: true,
    isDeveloper: true,
    isPro: true,
    isFounder: true,
  },
  user_metadata: {
    username: 'mirai-builder',
    full_name: 'Mirai Dev',
    roles: ['admin', 'developer', 'pro', 'founder'],
    is_admin: true,
    is_developer: true,
    is_pro: true,
    pro_mode: true,
    is_founder: true,
  },
  identities: [],
  factors: null,
  is_anonymous: false,
} as unknown as User

const offlineSession = {
  provider_token: null,
  provider_refresh_token: null,
  access_token: 'offline-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.round(Date.now() / 1000) + 3600,
  refresh_token: 'offline-refresh-token',
  user: offlineUser,
} as unknown as Session

export function getOfflineSession(): Session {
  return offlineSession
}

export function getOfflineUser(): User {
  return offlineUser
}

export { OFFLINE_USER_ID }
