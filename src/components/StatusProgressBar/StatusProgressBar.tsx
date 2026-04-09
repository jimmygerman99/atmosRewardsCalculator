import { TIERS, MILESTONE_DATA, BAR_MAX, getCurrentTier, getNextTier, getNextMilestone } from '../../data/tiers';

interface Props {
  statusPoints: number;
}

function formatK(n: number) {
  return n >= 1000 ? `${n / 1000}k` : String(n);
}

export default function StatusProgressBar({ statusPoints }: Props) {
  const current = getCurrentTier(statusPoints);
  const next = getNextTier(statusPoints);
  const nextMilestone = getNextMilestone(statusPoints);

  const fillPct = Math.min((statusPoints / BAR_MAX) * 100, 100);

  // Tiers shown on bar (skip Member at 0 to avoid crowding left edge label)
  const tierMarkers = TIERS.filter(t => t.threshold > 0 && t.threshold <= BAR_MAX);
  // Milestones shown on bar
  const milestoneMarkers = MILESTONE_DATA.filter(m => m.points <= BAR_MAX);

  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-slate-900/20 p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Status Progress</h2>
        <span className="text-xs text-gray-400">{statusPoints.toLocaleString()} SP earned</span>
      </div>

      {/* Current tier + points to next */}
      <div className="flex items-baseline gap-2 mb-5">
        <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full border ${current.borderColor} ${current.textColor}`}>
          {current.label}
        </span>
        {next ? (
          <span className="text-sm text-gray-500">
            <span className="font-bold text-blue-950">{(next.threshold - statusPoints).toLocaleString()}</span>
            {' '}more pts to{' '}
            <span className={`font-semibold ${next.textColor}`}>{next.label}</span>
          </span>
        ) : (
          <span className="text-sm font-semibold text-purple-700">Titanium achieved ✦</span>
        )}
      </div>

      {/* ── Single unified bar ── */}
      <div className="relative">

        {/* Tier labels — above the bar */}
        <div className="relative h-5 mb-1">
          {tierMarkers.map(tier => {
            const pos = (tier.threshold / BAR_MAX) * 100;
            const reached = statusPoints >= tier.threshold;
            return (
              <span
                key={tier.tier}
                className={`absolute text-xs font-semibold -translate-x-1/2 ${reached ? tier.textColor : 'text-gray-300'}`}
                style={{ left: `${pos}%` }}
              >
                {tier.label}
              </span>
            );
          })}
        </div>

        {/* The bar itself */}
        <div className="relative h-3 bg-gray-100 rounded-full">
          {/* Fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-950 to-blue-700 transition-all duration-500"
            style={{ width: `${fillPct}%` }}
          />

          {/* Tier dots (large circles) */}
          {tierMarkers.map(tier => {
            const pos = (tier.threshold / BAR_MAX) * 100;
            const reached = statusPoints >= tier.threshold;
            return (
              <div
                key={tier.tier}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-colors ${reached ? tier.dotColor : 'bg-gray-200'}`}
                style={{ left: `${pos}%` }}
              />
            );
          })}

          {/* Milestone diamonds (smaller, sit below tier dots in z-order) */}
          {milestoneMarkers.map(m => {
            const pos = (m.points / BAR_MAX) * 100;
            const reached = statusPoints >= m.points;
            const isNext = nextMilestone?.points === m.points;
            return (
              <div
                key={m.points}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border transition-colors ${
                  reached
                    ? 'bg-yellow-400 border-yellow-500'
                    : isNext
                    ? 'bg-white border-blue-500 ring-1 ring-blue-400'
                    : 'bg-white border-gray-300'
                }`}
                style={{ left: `${pos}%` }}
              />
            );
          })}
        </div>

        {/* SP labels — below the bar, for milestones only */}
        <div className="relative h-5 mt-1">
          {milestoneMarkers.map(m => {
            const pos = (m.points / BAR_MAX) * 100;
            const reached = statusPoints >= m.points;
            const isNext = nextMilestone?.points === m.points;
            return (
              <span
                key={m.points}
                className={`absolute text-[10px] -translate-x-1/2 font-medium ${
                  isNext ? 'text-blue-600' : reached ? 'text-yellow-600' : 'text-gray-300'
                }`}
                style={{ left: `${pos}%` }}
              >
                {formatK(m.points)}
              </span>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-800 inline-block" /> Tier threshold
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rotate-45 bg-yellow-400 border border-yellow-500 inline-block" /> Milestone reward
          </span>
        </div>
      </div>

      {/* ── Next milestone callout ── */}
      {nextMilestone && (
        <div className="mt-5 p-4 bg-blue-950/5 border border-blue-900/15 rounded-xl">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-blue-950 uppercase tracking-wide">
                Next Milestone — {nextMilestone.points.toLocaleString()} SP
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                <span className="font-semibold text-blue-800">{(nextMilestone.points - statusPoints).toLocaleString()}</span> more pts away · Choose {nextMilestone.choices} reward{nextMilestone.choices > 1 ? 's' : ''}
              </p>
            </div>
            <span className="text-xl">🎁</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
            {nextMilestone.rewards.map(r => (
              <li key={r} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
