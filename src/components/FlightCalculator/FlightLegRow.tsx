import type { FlightLeg, Airline, AlaskaFareClass, PartnerFareClass, FlightLegEarnings, EliteTier, EarningMethod2026 } from '../../types';
import { ALASKA_FARE_LABELS, HAWAIIAN_FARE_LABELS, PARTNER_FARE_LABELS, ELITE_LABELS } from '../../data/flights';
import { haversineDistance } from '../../utils/haversine';
import AirportInput from './AirportInput';

interface Props {
  leg: FlightLeg;
  earnings: FlightLegEarnings;
  index: number;
  globalElite: EliteTier;
  earningMethod: EarningMethod2026;
  highlightChip: boolean;
  onChange: (leg: FlightLeg) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const ALASKA_FARE_CLASSES = Object.keys(ALASKA_FARE_LABELS) as AlaskaFareClass[];
const HAWAIIAN_FARE_CLASSES = Object.keys(HAWAIIAN_FARE_LABELS) as AlaskaFareClass[];
const PARTNER_FARE_CLASSES = Object.keys(PARTNER_FARE_LABELS) as PartnerFareClass[];
const PARTNER_DIRECT_FARE_CLASSES = PARTNER_FARE_CLASSES.filter((fc) => fc !== 'domestic_first');
const ALL_TIERS = Object.keys(ELITE_LABELS) as EliteTier[];

// Soft chip style when inheriting global status
const TIER_CHIP: Record<EliteTier, string> = {
  none:     'bg-gray-100 text-gray-500 border-gray-300',
  silver:   'bg-gray-200 text-gray-700 border-gray-400',
  gold:     'bg-yellow-100 text-yellow-800 border-yellow-400',
  platinum: 'bg-sky-100 text-sky-800 border-sky-400',
  titanium: 'bg-purple-100 text-purple-800 border-purple-400',
};

// Solid chip style when overridden for this leg
const TIER_CHIP_OVERRIDE: Record<EliteTier, string> = {
  none:     'bg-gray-500 text-white border-gray-500',
  silver:   'bg-gray-500 text-white border-gray-500',
  gold:     'bg-yellow-500 text-white border-yellow-500',
  platinum: 'bg-sky-600 text-white border-sky-600',
  titanium: 'bg-purple-600 text-white border-purple-600',
};

function defaultFareClass(airline: Airline): FlightLeg['fareClass'] {
  return airline === 'partner' ? 'economy' : 'main';
}

// Special sentinel value meaning "no override — use global"
const GLOBAL_SENTINEL = '__global__';

export default function FlightLegRow({ leg, earnings, index, globalElite, earningMethod, highlightChip, onChange, onRemove, canRemove }: Props) {
  const isPartner = leg.airline === 'partner';
  const partnerDirect = isPartner && leg.bookingChannel === 'partner';
  // Fare class: all airlines in distance mode; partner-direct overrides other methods
  const showFareClass = earningMethod === 'distance' || (isPartner && partnerDirect);
  // Booking channel: always show for partner (direct overrides even segment/spend methods)
  const showBookingChannel = isPartner;
  // Airports: distance (all airlines) OR any partner-direct (method is overridden to distance)
  const showAirports = earningMethod === 'distance' || partnerDirect;
  // Ticket price: spend method, cash ticket, not partner-direct
  const showTicketPrice = earningMethod === 'spend' && !partnerDirect && !leg.bookedWithPoints;
  // Points redeemed: spend method, award ticket, not partner-direct (1 SP per 20 pts redeemed)
  const showPointsRedeemed = earningMethod === 'spend' && !partnerDirect && leg.bookedWithPoints;
  const hasOverride = leg.eliteOverride !== undefined;
  const effectiveElite = leg.eliteOverride ?? globalElite;

  // Computed distance for display badge
  const computedDistance = showAirports && leg.origin && leg.destination
    ? haversineDistance(leg.origin, leg.destination)
    : 0;

  function handleAirlineChange(airline: Airline) {
    onChange({ ...leg, airline, fareClass: defaultFareClass(airline) });
  }

  function handleStatusChange(value: string) {
    if (value === GLOBAL_SENTINEL) {
      // Remove override — revert to global
      const { eliteOverride: _, ...rest } = leg;
      onChange(rest as FlightLeg);
    } else {
      onChange({ ...leg, eliteOverride: value as EliteTier });
    }
  }

  const chipClass = hasOverride ? TIER_CHIP_OVERRIDE[effectiveElite] : TIER_CHIP[effectiveElite];
  const highlightClass = highlightChip && !hasOverride ? 'ring-2 ring-offset-1 ring-blue-400 scale-105 shadow-md' : '';

  const hasEarnings = earnings.miles > 0 || earnings.statusPoints > 0;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-lg">
      {/* Row header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">Leg {index + 1}</span>
          {/* Distance badge — shown when both airports resolve */}
          {computedDistance > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {computedDistance.toLocaleString()} mi
            </span>
          )}
          {/* Cash / Points toggle */}
          <div className="flex rounded-full border border-gray-300 overflow-hidden text-xs font-medium">
            <button
              onClick={() => onChange({ ...leg, bookedWithPoints: false })}
              className={`px-2.5 py-0.5 cursor-pointer transition-colors ${!leg.bookedWithPoints ? 'bg-blue-950 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Cash
            </button>
            <button
              onClick={() => onChange({ ...leg, bookedWithPoints: true })}
              className={`px-2.5 py-0.5 cursor-pointer transition-colors ${leg.bookedWithPoints ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Points
            </button>
          </div>
          {/* Round trip toggle */}
          <button
            onClick={() => onChange({ ...leg, roundTrip: !leg.roundTrip })}
            className={`text-xs px-2.5 py-0.5 rounded-full border font-medium cursor-pointer transition-colors ${leg.roundTrip ? 'bg-blue-950 text-white border-blue-950' : 'text-gray-500 border-gray-300 hover:bg-gray-100'}`}
          >
            Round trip
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* Status chip — IS the dropdown */}
          <div className={`relative flex items-center rounded-full border text-xs font-medium transition-all ${chipClass} ${highlightClass}`}>
            <select
              value={hasOverride ? leg.eliteOverride : GLOBAL_SENTINEL}
              onChange={(e) => handleStatusChange(e.target.value)}
              title="Set status for this flight leg"
              className="appearance-none bg-transparent pl-2.5 pr-6 py-1 cursor-pointer focus:outline-none"
            >
              <option value={GLOBAL_SENTINEL}>
                {ELITE_LABELS[globalElite]} (global)
              </option>
              <optgroup label="Override for this leg">
                {ALL_TIERS.map((tier) => (
                  <option key={tier} value={tier}>{ELITE_LABELS[tier]}</option>
                ))}
              </optgroup>
            </select>
            {/* Dropdown chevron */}
            <span className="pointer-events-none absolute right-2 opacity-60">▾</span>
          </div>

          {canRemove && (
            <button
              onClick={onRemove}
              className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Airline — always shown */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Airline</label>
          <select
            value={leg.airline}
            onChange={(e) => handleAirlineChange(e.target.value as Airline)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="alaska">Alaska Airlines</option>
            <option value="hawaiian">Hawaiian Airlines</option>
            <option value="partner">Partner Airline</option>
          </select>
        </div>

        {/* Fare Class — distance method (all airlines) or spend+partner-direct */}
        {showFareClass && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fare Class</label>
            <select
              value={leg.fareClass}
              onChange={(e) => onChange({ ...leg, fareClass: e.target.value as FlightLeg['fareClass'] })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {isPartner
                ? (partnerDirect ? PARTNER_DIRECT_FARE_CLASSES : PARTNER_FARE_CLASSES).map((fc) => (
                    <option key={fc} value={fc}>{PARTNER_FARE_LABELS[fc]}</option>
                  ))
                : leg.airline === 'hawaiian'
                  ? HAWAIIAN_FARE_CLASSES.map((fc) => (
                      <option key={fc} value={fc}>{HAWAIIAN_FARE_LABELS[fc]}</option>
                    ))
                  : ALASKA_FARE_CLASSES.map((fc) => (
                      <option key={fc} value={fc}>{ALASKA_FARE_LABELS[fc]}</option>
                    ))}
            </select>
          </div>
        )}

        {/* Booking channel — partner airlines, non-segment methods */}
        {showBookingChannel && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Booked through</label>
            <select
              value={leg.bookingChannel}
              onChange={(e) => {
                const channel = e.target.value as FlightLeg['bookingChannel'];
                const fareClass = channel === 'partner' && leg.fareClass === 'domestic_first' ? 'first' : leg.fareClass;
                onChange({ ...leg, bookingChannel: channel, fareClass });
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="atmos">Atmos / AlaskaAir.com</option>
              <option value="partner">Partner Airline's Site</option>
            </select>
          </div>
        )}

        {/* Airport inputs — classic + distance methods only, always same row */}
        {showAirports && (
          <div className="col-span-full flex gap-3">
            <AirportInput
              label="Origin"
              value={leg.origin}
              onChange={(iata) => onChange({ ...leg, origin: iata })}
            />
            <AirportInput
              label="Destination"
              value={leg.destination}
              onChange={(iata) => onChange({ ...leg, destination: iata })}
            />
          </div>
        )}

        {/* Ticket price — spend method only */}
        {showTicketPrice && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ticket price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number" min="0" step="1"
                value={leg.ticketPrice || ''}
                placeholder="0"
                onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => onChange({ ...leg, ticketPrice: parseFloat(e.target.value) || 0 })}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        )}

        {/* Points redeemed — spend method, award ticket */}
        {showPointsRedeemed && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Points redeemed</label>
            <input
              type="number" min="0" step="1000"
              value={leg.pointsRedeemed || ''}
              placeholder="0"
              onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => onChange({ ...leg, pointsRedeemed: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}

        {/* Segment method note — hidden for partner-direct (method is overridden) */}
        {earningMethod === 'segment' && !partnerDirect && (
          <div className="flex items-end pb-2">
            <p className="text-xs text-gray-400">500 pts earned for this segment automatically.</p>
          </div>
        )}
      </div>

      {/* Partner via Atmos distance callout — cabin bonuses only apply under distance method */}
      {isPartner && leg.bookingChannel === 'atmos' && earningMethod === 'distance' && (
        <p className="mt-2 text-xs text-blue-500">
          Booking via Atmos earns significantly more on premium cabins (Business/First = 250%).
        </p>
      )}
      {/* Partner direct warning — method is always overridden to distance */}
      {partnerDirect && earningMethod !== 'distance' && (
        <p className="mt-2 text-xs text-amber-600">
          Partner direct bookings always earn based on fare class × distance — your selected method is overridden.
        </p>
      )}

      {/* Inline earnings */}
      {hasEarnings && (
        <div className="mt-3 flex gap-4 text-xs text-gray-500">
          <span>
            <span className="font-semibold text-blue-600">{earnings.miles.toLocaleString()}</span> miles
          </span>
          <span>
            <span className="font-semibold text-emerald-600">{earnings.statusPoints.toLocaleString()}</span> status pts
          </span>
        </div>
      )}
    </div>
  );
}
