import { useMemo } from "react";

export interface EmotionSnapshot {
  timestamp: string;
  score: number;
  note?: string;
}

export interface EvolutionCardProps {
  marAiId: number;
  name: string;
  imageUrl: string;
  bondScore: number;
  emotionStateScore?: number;
  emotionStateUpdatedAt?: string;
  history?: EmotionSnapshot[];
  onEvolve?: () => void;
  loading?: boolean;
  emotionTone?: string;
  emotionIntensity?: number;
}

const clampScore = (value: number) => Math.min(100, Math.max(0, value));
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const toneColors: Record<string, [number, number, number]> = {
  joy: [255, 198, 69],
  happy: [255, 206, 86],
  calm: [56, 189, 248],
  focused: [129, 140, 248],
  tired: [244, 114, 182],
  sad: [96, 165, 250],
  angry: [248, 113, 113],
  grateful: [161, 98, 247],
  neutral: [165, 180, 252],
};

const toRgba = (rgb: [number, number, number], alpha: number) =>
  `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(3)})`;

const scoreToLabel = (score: number): string => {
  if (score >= 90) return "Transcendent";
  if (score >= 75) return "Deeply Connected";
  if (score >= 55) return "Growing";
  if (score >= 35) return "Emerging";
  return "Dormant";
};

export const EvolutionCard = ({
  marAiId,
  name,
  imageUrl,
  bondScore,
  emotionStateScore,
  emotionStateUpdatedAt,
  history = [],
  onEvolve,
  loading = false,
  emotionTone = "neutral",
  emotionIntensity,
}: EvolutionCardProps) => {
  const normalizedBond = clampScore(bondScore);
  const normalizedState = clampScore(emotionStateScore ?? bondScore);
  const normalizedIntensity = clamp01(emotionIntensity ?? normalizedState / 100);

  const statusLabel = useMemo(() => scoreToLabel(normalizedState), [normalizedState]);
  const auraStyle = useMemo(() => {
    const toneKey = emotionTone.toLowerCase();
    const rgb = toneColors[toneKey] ?? toneColors.neutral;
    const glowAlpha = 0.2 + normalizedIntensity * 0.45;
    const haloAlpha = 0.06 + normalizedIntensity * 0.25;
    const blurRadius = 36 + normalizedIntensity * 60;

    return {
      boxShadow: `0 0 ${blurRadius}px ${toRgba(rgb, glowAlpha)}`,
      background: `radial-gradient(circle at 20% 20%, ${toRgba(rgb, glowAlpha)} 0%, ${toRgba(
        rgb,
        haloAlpha
      )} 45%, rgba(255,255,255,0) 70%)`,
      opacity: 0.85,
    } as const;
  }, [emotionTone, normalizedIntensity]);

  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-lg backdrop-blur">
      <div
        className="pointer-events-none absolute -inset-6 rounded-[48px] blur-3xl transition-all duration-700"
        style={auraStyle}
        aria-hidden
      />

      <div className="relative flex flex-col gap-4">
        <header className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${name} avatar`}
            className="h-16 w-16 rounded-2xl object-cover shadow-md"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              MarAI #{marAiId}
            </span>
            <h2 className="text-2xl font-bold text-slate-900">{name}</h2>
            <span className="text-sm font-medium text-indigo-600">{statusLabel}</span>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">Bond Meter</span>
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 transition-all"
                style={{ width: `${normalizedBond}%` }}
              />
            </div>
            <span className="text-sm text-slate-600">
              {normalizedBond}% connection strength with you
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">Live Emotion State</span>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3">
              <p className="text-3xl font-semibold text-indigo-600">{normalizedState}</p>
              <p className="text-xs text-indigo-500">
                Last evolved {emotionStateUpdatedAt ? new Date(emotionStateUpdatedAt).toLocaleString() : "—"}
              </p>
            </div>
          </div>
        </section>

        {history.length > 0 && (
          <section className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-wide text-slate-500">Connection Timeline</span>
            <ol className="flex flex-col gap-2">
              {history.map((snapshot) => (
                <li
                  key={`${snapshot.timestamp}-${snapshot.score}`}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600"
                >
                  <span className="font-medium text-slate-700">
                    {new Date(snapshot.timestamp).toLocaleString()}
                  </span>
                  <span className="text-slate-500">
                    Score {clampScore(snapshot.score)}
                    {snapshot.note ? ` · ${snapshot.note}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <footer className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Emotional merit drives visual evolution in real time.
          </span>
          {onEvolve && (
            <button
              type="button"
              onClick={onEvolve}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Evolving…" : "Evolve"}
            </button>
          )}
        </footer>
      </div>
    </article>
  );
};

export default EvolutionCard;
