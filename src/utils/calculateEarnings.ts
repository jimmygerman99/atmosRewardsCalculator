import type {
  CreditCard,
  CardSpend,
  CardEarnings,
  FlightLeg,
  FlightLegEarnings,
  PartnerFareClass,
  EliteTier,
  EarningMethod2026,
  PartnerSpend,
  PartnerEarningsResult,
  TotalEarnings,
} from '../types';
import {
  PARTNER_ATMOS_MULTIPLIER,
  PARTNER_DIRECT_MULTIPLIER,
  ELITE_BONUS,
  MIN_FLIGHT_POINTS,
  EARNING_2026_SPEND_RATE,
  EARNING_2026_SEGMENT_RATE,
} from '../data/flights';
import { haversineDistance } from './haversine';
import {
  HOTEL_MILES_PER_DOLLAR,
  CRUISE_MILES_PER_DOLLAR,
  CAR_RENTAL_MILES_PER_RENTAL,
  LYFT_MILES_PER_DOLLAR,
  PARTNER_STATUS_POINTS_PER_DOLLAR,
  SHOPPING_STATUS_POINTS_RATIO,
} from '../data/partners';

// ── Credit Card ───────────────────────────────────────────────────────────────

export function calculateCardEarnings(card: CreditCard, spend: CardSpend): CardEarnings {
  const miles =
    spend.alaskaHawaiianFlights * card.earningRates.alaskaHawaiianFlights +
    spend.other * card.earningRates.other;

  const totalSpend = spend.alaskaHawaiianFlights + spend.other;
  const statusPoints = Math.floor(totalSpend * card.statusPointsPerDollar);

  return { cardId: card.id, miles, statusPoints, totalSpend };
}

// ── Flights ───────────────────────────────────────────────────────────────────

// Only called for partner airlines
function getFareMultiplier(leg: FlightLeg): number {
  const map = leg.bookingChannel === 'atmos' ? PARTNER_ATMOS_MULTIPLIER : PARTNER_DIRECT_MULTIPLIER;
  return map[leg.fareClass as PartnerFareClass] ?? 0.5;
}

export function calculateFlightEarnings(
  leg: FlightLeg,
  elite: EliteTier,
  method: EarningMethod2026 = 'distance'
): FlightLegEarnings {
  const empty: FlightLegEarnings = { legId: leg.id, baseMiles: 0, miles: 0, statusPoints: 0 };
  const eliteBonus = ELITE_BONUS[elite] ?? 0;

  // ── Spend method ──
  if (method === 'spend') {
    // Partner booked directly on partner's site → doesn't qualify for 5 pts/$1;
    // falls back to partner direct fare-class multiplier × distance (same for all methods)
    if (leg.airline === 'partner' && leg.bookingChannel === 'partner') {
      if (!leg.origin || !leg.destination) return empty;
      const distanceMiles = haversineDistance(leg.origin, leg.destination);
      if (!distanceMiles) return empty;
      const baseMiles = (distanceMiles * getFareMultiplier(leg)) || 0;
      const miles = leg.bookedWithPoints ? 0 : Math.round(baseMiles * (1 + eliteBonus)) || 0;
      return { legId: leg.id, baseMiles, miles, statusPoints: Math.round(baseMiles) || 0 };
    }
    // Alaska/Hawaiian, or partner booked via Atmos → 5 pts/$1 (cash) or 1 SP/20 pts redeemed (award)
    if (leg.bookedWithPoints) {
      // Award flight: 0 miles, 1 status point per 20 points redeemed
      const statusPoints = Math.floor((leg.pointsRedeemed || 0) / 20);
      return { legId: leg.id, baseMiles: 0, miles: 0, statusPoints };
    }
    if (!leg.ticketPrice) return empty;
    const baseMiles = (leg.ticketPrice * EARNING_2026_SPEND_RATE) || 0;
    const miles = Math.round(baseMiles * (1 + eliteBonus)) || 0;
    return { legId: leg.id, baseMiles, miles, statusPoints: Math.round(baseMiles) || 0 };
  }

  // ── Segment method ──
  // Partner direct overrides the selected method — always falls back to distance calc
  if (method === 'segment' && !(leg.airline === 'partner' && leg.bookingChannel === 'partner')) {
    const baseMiles = EARNING_2026_SEGMENT_RATE;
    const miles = leg.bookedWithPoints ? 0 : Math.round(baseMiles * (1 + eliteBonus)) || 0;
    return { legId: leg.id, baseMiles, miles, statusPoints: Math.round(baseMiles) || 0 };
  }

  // ── Distance method (and partner-direct fallback from spend/segment) ──
  if (!leg.origin || !leg.destination) return empty;
  const distanceMiles = haversineDistance(leg.origin, leg.destination);
  if (!distanceMiles) return empty;

  // Alaska/Hawaiian: flat 1 pt/mile (no cabin bonus); partner: fare class multiplier × distance
  const rawBase = leg.airline === 'partner'
    ? (distanceMiles * getFareMultiplier(leg)) || 0
    : distanceMiles;

  const baseMiles = Math.max(rawBase, MIN_FLIGHT_POINTS);
  const miles = leg.bookedWithPoints ? 0 : Math.round(baseMiles * (1 + eliteBonus)) || 0;
  return { legId: leg.id, baseMiles, miles, statusPoints: Math.round(baseMiles) || 0 };
}

// ── Partner / Portal ──────────────────────────────────────────────────────────

function dollarCategory(miles: number, dollars: number): { miles: number; statusPoints: number } {
  return {
    miles: Math.round(miles),
    statusPoints: Math.floor(dollars * PARTNER_STATUS_POINTS_PER_DOLLAR), // 1 SP per $1
  };
}

export function calculatePartnerEarnings(spend: PartnerSpend): PartnerEarningsResult {
  const shoppingMiles = spend.shoppingDollars * spend.shoppingMilesPerDollar;
  const shopping = {
    miles: Math.round(shoppingMiles),
    statusPoints: Math.floor(shoppingMiles * SHOPPING_STATUS_POINTS_RATIO), // 1 SP per 3 miles
  };

  const hotels     = dollarCategory(spend.hotelDollars * HOTEL_MILES_PER_DOLLAR, spend.hotelDollars);
  const carRentals = dollarCategory(spend.carRentals * CAR_RENTAL_MILES_PER_RENTAL, spend.carRentalDollars);
  const cruises    = dollarCategory(spend.cruiseDollars * CRUISE_MILES_PER_DOLLAR, spend.cruiseDollars);
  const lyft       = dollarCategory(spend.lyftDollars * LYFT_MILES_PER_DOLLAR, spend.lyftDollars);
  // SAF and GCI earn status points only — no redeemable miles
  const saf  = { miles: 0, statusPoints: Math.floor(spend.safDollars * PARTNER_STATUS_POINTS_PER_DOLLAR) };
  const gci  = { miles: 0, statusPoints: Math.floor(spend.gciDollars * PARTNER_STATUS_POINTS_PER_DOLLAR) };

  return {
    shopping,
    hotels,
    carRentals,
    cruises,
    lyft,
    saf,
    gci,
    total: {
      miles: shopping.miles + hotels.miles + carRentals.miles + cruises.miles + lyft.miles,
      statusPoints: shopping.statusPoints + hotels.statusPoints + carRentals.statusPoints + cruises.statusPoints + lyft.statusPoints + saf.statusPoints + gci.statusPoints,
    },
  };
}

// ── Grand Totals ──────────────────────────────────────────────────────────────

export function sumTotals(
  cardEarnings: CardEarnings[],
  flightEarnings: FlightLegEarnings[],
  partnerEarnings: PartnerEarningsResult
): TotalEarnings {
  const cardMiles    = cardEarnings.reduce((s, e) => s + e.miles, 0);
  const cardStatus   = cardEarnings.reduce((s, e) => s + e.statusPoints, 0);
  const flightMiles  = flightEarnings.reduce((s, e) => s + e.miles, 0);
  const flightStatus = flightEarnings.reduce((s, e) => s + e.statusPoints, 0);

  return {
    miles: cardMiles + flightMiles + partnerEarnings.total.miles,
    statusPoints: cardStatus + flightStatus + partnerEarnings.total.statusPoints,
  };
}
