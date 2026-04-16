import type { PartnerSpend, PartnerEarningsResult } from '../../types';
import { SHOPPING_DEFAULT_MILES_PER_DOLLAR } from '../../data/partners';

interface Props {
  spend: PartnerSpend;
  earnings: PartnerEarningsResult;
  carRentalMilesPerRental: number;
  onChange: (spend: PartnerSpend) => void;
}

interface CategoryRowProps {
  label: string;
  description: string;
  icon: string;
  children: React.ReactNode;
  miles: number;
  statusPoints: number;
}

function CategoryRow({ label, description, icon, children, miles, statusPoints }: CategoryRowProps) {
  const hasEarnings = miles > 0 || statusPoints > 0;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>
        {hasEarnings && (
          <div className="text-right text-xs shrink-0 ml-3">
            <p><span className="font-semibold text-blue-600">{miles.toLocaleString()}</span> <span className="text-gray-400">miles</span></p>
            <p><span className="font-semibold text-emerald-600">{statusPoints.toLocaleString()}</span> <span className="text-gray-400">status pts</span></p>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

function blockInvalidKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
}

function DollarInput({ label, value, onChange, placeholder, hint }: {
  label: string; value: number; onChange: (v: number) => void; placeholder?: string; hint?: string;
}) {
  return (
    <div className="flex-1 min-w-32">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
        <input
          type="number" min="0" step="1"
          value={value || ''}
          placeholder={placeholder ?? '0'}
          onKeyDown={blockInvalidKeys}
          onWheel={(e) => e.currentTarget.blur()}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function NumberInput({ label, value, onChange, placeholder, suffix, hint }: {
  label: string; value: number; onChange: (v: number) => void; placeholder?: string; suffix?: string; hint?: string;
}) {
  return (
    <div className="flex-1 min-w-32">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number" min="0" step="1"
          value={value || ''}
          placeholder={placeholder ?? '0'}
          onKeyDown={blockInvalidKeys}
          onWheel={(e) => e.currentTarget.blur()}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${suffix ? 'pr-16' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function PartnerEarnings({ spend, earnings, carRentalMilesPerRental, onChange }: Props) {
  function update(patch: Partial<PartnerSpend>) {
    onChange({ ...spend, ...patch });
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {/* Shopping Portal */}
        <CategoryRow
          label="Atmos Shopping Portal"
          description="Rate varies by retailer — 1 SP per 3 miles earned"
          icon="🛍️"
          miles={earnings.shopping.miles}
          statusPoints={earnings.shopping.statusPoints}
        >
          <DollarInput
            label="Amount spent"
            value={spend.shoppingDollars}
            onChange={(v) => update({ shoppingDollars: v })}
          />
          <NumberInput
            label="Miles per dollar"
            value={spend.shoppingMilesPerDollar}
            onChange={(v) => update({ shoppingMilesPerDollar: Math.max(v, 0) })}
            placeholder={String(SHOPPING_DEFAULT_MILES_PER_DOLLAR)}
            suffix="miles/$"
          />
        </CategoryRow>

        {/* Hotels */}
        <CategoryRow
          label="Hotels"
          description="Choice Hotels, Marriott, Best Western, IHG — 1 mile/$1 · 1 SP/$1"
          icon="🏨"
          miles={earnings.hotels.miles}
          statusPoints={earnings.hotels.statusPoints}
        >
          <DollarInput
            label="Total hotel spend"
            value={spend.hotelDollars}
            onChange={(v) => update({ hotelDollars: v })}
          />
        </CategoryRow>

        {/* Car Rentals */}
        <CategoryRow
          label="Car Rentals"
          description={`Avis / Budget — ${carRentalMilesPerRental.toLocaleString()} miles per rental · 1 SP/$1`}
          icon="🚗"
          miles={earnings.carRentals.miles}
          statusPoints={earnings.carRentals.statusPoints}
        >
          <NumberInput
            label="Number of rentals"
            value={spend.carRentals}
            onChange={(v) => update({ carRentals: v })}
            suffix="rentals"
            hint={`Earns ${carRentalMilesPerRental.toLocaleString()} miles per rental`}
          />
          <DollarInput
            label="Total rental spend"
            value={spend.carRentalDollars}
            onChange={(v) => update({ carRentalDollars: v })}
            hint="Earns 1 status pt per $1"
          />
        </CategoryRow>

        {/* Cruises */}
        <CategoryRow
          label="Cruises"
          description="Via Alaska Vacations portal — 1 mile/$1 · 1 SP/$1"
          icon="🚢"
          miles={earnings.cruises.miles}
          statusPoints={earnings.cruises.statusPoints}
        >
          <DollarInput
            label="Cruise spend"
            value={spend.cruiseDollars}
            onChange={(v) => update({ cruiseDollars: v })}
          />
        </CategoryRow>

        {/* Lyft */}
        <CategoryRow
          label="Lyft"
          description="2 miles/$1 on regular rides · 1 SP/$1"
          icon="🚘"
          miles={earnings.lyft.miles}
          statusPoints={earnings.lyft.statusPoints}
        >
          <DollarInput
            label="Lyft spend"
            value={spend.lyftDollars}
            onChange={(v) => update({ lyftDollars: v })}
          />
        </CategoryRow>

        {/* SAF */}
        <CategoryRow
          label="Sustainable Aviation Fuel"
          description="Status points only — no Atmos Miles earned · 1 SP/$1"
          icon="🌱"
          miles={earnings.saf.miles}
          statusPoints={earnings.saf.statusPoints}
        >
          <DollarInput
            label="SAF contribution"
            value={spend.safDollars}
            onChange={(v) => update({ safDollars: v })}
          />
        </CategoryRow>

        {/* GCI */}
        <CategoryRow
          label="GCI Internet / Cellular"
          description="Alaska-based telecom partner · 1 SP/$1"
          icon="📡"
          miles={earnings.gci.miles}
          statusPoints={earnings.gci.statusPoints}
        >
          <DollarInput
            label="GCI spend"
            value={spend.gciDollars}
            onChange={(v) => update({ gciDollars: v })}
          />
        </CategoryRow>
      </div>
    </div>
  );
}
