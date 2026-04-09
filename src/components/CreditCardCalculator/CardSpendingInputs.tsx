import type { CardSpend, CreditCard } from '../../types';

interface Props {
  card: CreditCard;
  spend: CardSpend;
  onChange: (spend: CardSpend) => void;
}

export default function CardSpendingInputs({ card, spend, onChange }: Props) {
  function handleChange(field: keyof Omit<CardSpend, 'cardId'>, value: string) {
    const num = parseFloat(value) || 0;
    onChange({ ...spend, [field]: num });
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
          <p>1x everything else</p>
          <p>1 status pt / ${card.statusPointsPerDollar === 0.5 ? '2' : '3'}</p>
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
    </div>
  );
}
