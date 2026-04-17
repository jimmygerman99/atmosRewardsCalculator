import type { CardSpend, CreditCard } from '../../types';

interface Props {
  card: CreditCard;
  spend: CardSpend;
  onChange: (spend: CardSpend) => void;
}

export default function CardSpendingInputs({ card, spend, onChange }: Props) {
  function handleChange(field: keyof Omit<CardSpend, 'cardId' | 'bonusSpend' | 'includeAnniversaryBonus'>, value: string) {
    const num = parseFloat(value) || 0;
    onChange({ ...spend, [field]: num });
  }

  function handleBonusSpendChange(field: string, value: string) {
    const num = parseFloat(value) || 0;
    onChange({ ...spend, bonusSpend: { ...(spend.bonusSpend ?? {}), [field]: num } });
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">{card.name}</h3>
          <p className="text-xs text-gray-500">{card.issuer} · ${card.annualFee}/yr annual fee</p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>3x Alaska/Hawaiian flights</p>
          {card.bonusCategories.map(cat => (
            <p key={cat.field}>{cat.multiplier}x {cat.label.split(',')[0].toLowerCase()}, etc.</p>
          ))}
          <p>1x everything else</p>
          <p>1 SP / ${card.statusPointsPerDollar === 0.5 ? '2' : '3'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Alaska/Hawaiian Airline Purchases
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              min="0"
              step="1"
              value={spend.alaskaHawaiianFlights || ''}
              placeholder="0"
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => handleChange('alaskaHawaiianFlights', e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Earns 3x miles</p>
        </div>

        {card.bonusCategories.map(cat => (
          <div key={cat.field}>
            <label className="block text-sm text-gray-600 mb-1">{cat.label}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number" min="0" step="1"
                value={(spend.bonusSpend ?? {})[cat.field] || ''}
                placeholder="0"
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => handleBonusSpendChange(cat.field, e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Earns {cat.multiplier}x miles</p>
          </div>
        ))}

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            All Other Purchases
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              min="0"
              step="1"
              value={spend.other || ''}
              placeholder="0"
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => handleChange('other', e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Earns 1x miles</p>
        </div>
      </div>

      {card.boaAccountBonus && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={spend.includeBoaBonus ?? false}
              onChange={(e) => onChange({ ...spend, includeBoaBonus: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-900 cursor-pointer"
            />
            <div>
              <span className="text-sm text-gray-700 font-medium">I have an eligible Bank of America account</span>
              <span className="ml-2 text-xs text-blue-600 font-semibold">+10% on all purchase miles</span>
              <p className="text-xs text-gray-400">Applies to miles earned from card purchases only</p>
            </div>
          </label>
        </div>
      )}

      {card.anniversaryStatusPoints && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={spend.includeAnniversaryBonus ?? false}
              onChange={(e) => onChange({ ...spend, includeAnniversaryBonus: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-900 cursor-pointer"
            />
            <div>
              <span className="text-sm text-gray-700 font-medium">Include anniversary bonus</span>
              <span className="ml-2 text-xs text-emerald-600 font-semibold">+{card.anniversaryStatusPoints.toLocaleString()} status pts</span>
              <p className="text-xs text-gray-400">Awarded once per year on your card anniversary date</p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
