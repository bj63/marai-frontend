import Link from 'next/link'
import { supabaseRuntime } from '@/lib/supabaseClient'
import { IS_OFFLINE_MODE, IS_PRODUCTION } from '@/constants/config'

const severityStyles = {
  offline: 'bg-amber-500/10 text-amber-200 border-amber-400/40',
  disabled: 'bg-red-500/10 text-red-200 border-red-500/40',
}

export default function DeploymentBanner() {
  if (supabaseRuntime.mode === 'online') {
    return null
  }

  const isDisabled = supabaseRuntime.mode === 'disabled'
  const tone = isDisabled ? severityStyles.disabled : severityStyles.offline
  const message = isDisabled
    ? 'Supabase credentials are missing in this deployment. Requests use mock data only. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Railway environment variables to re-enable live data.'
    : 'Supabase credentials are missing, so the app is running with mock data. Changes will not be persisted.'

  return (
    <div
      role="status"
      className={`relative z-30 border-b px-4 py-3 text-sm backdrop-blur-md ${tone}`}
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <span className="font-medium uppercase tracking-[0.3em] text-xs">
          {isDisabled ? 'Deployment misconfiguration' : 'Offline development mode'}
        </span>
        <p className="text-sm leading-relaxed md:flex-1 md:text-base">
          {message}
        </p>
        {isDisabled ? (
          <Link
            href="https://docs.railway.app/guides/variables"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/30"
          >
            Review env vars
          </Link>
        ) : null}
      </div>
      {IS_OFFLINE_MODE && !IS_PRODUCTION ? (
        <p className="mt-2 text-xs text-amber-200/70">
          Offline mode is enabled because this development build does not define public Supabase credentials.
        </p>
      ) : null}
    </div>
  )
}
