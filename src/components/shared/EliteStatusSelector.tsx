import type { EliteTier } from '../../types';
import { ELITE_LABELS } from '../../data/flights';

interface Props {
  value: EliteTier;
  onChange: (tier: EliteTier) => void;
  onHighlightFlightChips: () => void;
}

const TIERS: EliteTier[] = ['none', 'silver', 'gold', 'platinum', 'titanium'];

const TIER_COLORS: Record<EliteTier, string> = {
  none: 'bg-gray-100 border-gray-300 text-gray-600',
  silver: 'bg-gray-200 border-gray-400 text-gray-700',
  gold: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  platinum: 'bg-sky-100 border-sky-400 text-sky-800',
  titanium: 'bg-purple-100 border-purple-400 text-purple-800',
};

const TIER_SELECTED: Record<EliteTier, string> = {
  none: 'bg-gray-600 border-gray-600 text-white',
  silver: 'bg-gray-500 border-gray-500 text-white',
  gold: 'bg-yellow-500 border-yellow-500 text-white',
  platinum: 'bg-sky-600 border-sky-600 text-white',
  titanium: 'bg-purple-600 border-purple-600 text-white',
};

export default function EliteStatusSelector({ value, onChange, onHighlightFlightChips }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-1">Elite Status</h2>
      <p className="text-xs text-gray-500 mb-3">
        Applies a bonus multiplier to your Atmos Miles on flights. You can also{' '}
        <button
          onClick={onHighlightFlightChips}
          className="underline decoration-dotted text-blue-800 hover:text-blue-950 cursor-pointer transition-colors"
        >
          override it per flight leg
        </button>
        {' '}if needed.
      </p>
      <div className="grid grid-cols-5 gap-2">
        {TIERS.map((tier) => (
          <button
            key={tier}
            onClick={() => onChange(tier)}
            className={`py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer text-center ${
              value === tier ? TIER_SELECTED[tier] : TIER_COLORS[tier] + ' hover:opacity-80'
            }`}
          >
            {ELITE_LABELS[tier]}
          </button>
        ))}
      </div>
    </div>
  );
}
