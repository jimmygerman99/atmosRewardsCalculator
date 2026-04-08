import type { AlaskaFareClass, PartnerFareClass, EliteTier } from '../types';

// ── Alaska / Hawaiian fare class multipliers ──────────────────────────────────

export const ALASKA_FARE_MULTIPLIER: Record<AlaskaFareClass, number> = {
  saver: 0.30,          // X fare — Saver / Basic Economy
  main: 1.00,           // most economy fares
  main_flexible: 1.25,  // H, K fares
  main_full: 1.50,      // Y, B fares (full-fare economy)
  first_discount: 1.50, // D, I fares (upgrade/discount first)
  first_flexible: 1.75, // C fare
  first_full: 2.00,     // J fare (full-fare first)
};

export const ALASKA_FARE_LABELS: Record<AlaskaFareClass, string> = {
  saver: 'Saver / Basic Economy (X)',
  main: 'Main Cabin (100%)',
  main_flexible: 'Main Cabin Flexible — H, K (125%)',
  main_full: 'Main Cabin Full Fare — Y, B (150%)',
  first_discount: 'First Class Upgrade/Discount — D, I (150%)',
  first_flexible: 'First Class Flexible — C (175%)',
  first_full: 'First Class Full Fare — J (200%)',
};

// ── Partner airline fare class multipliers ────────────────────────────────────

/** Booked directly on the partner airline's website */
export const PARTNER_DIRECT_MULTIPLIER: Record<PartnerFareClass, number> = {
  economy_discount: 0.25,
  economy: 0.50,
  premium_economy: 1.00,
  business: 1.25,
  first: 1.50,
};

/** Booked through alaskaair.com / Atmos */
export const PARTNER_ATMOS_MULTIPLIER: Record<PartnerFareClass, number> = {
  economy_discount: 0.50,  // better than direct
  economy: 1.00,
  premium_economy: 1.50,
  business: 2.50,          // 250% — major advantage
  first: 2.50,
};

export const PARTNER_FARE_LABELS: Record<PartnerFareClass, string> = {
  economy_discount: 'Discount Economy',
  economy: 'Economy',
  premium_economy: 'Premium Economy',
  business: 'Business Class',
  first: 'First Class',
};

// ── Elite tier bonuses ────────────────────────────────────────────────────────

export const ELITE_BONUS: Record<EliteTier, number> = {
  none: 0,
  silver: 0.25,
  gold: 0.50,
  platinum: 1.00,
  titanium: 1.50,
};

export const ELITE_LABELS: Record<EliteTier, string> = {
  none: 'No Status',
  silver: 'Silver (+25%)',
  gold: 'Gold (+50%)',
  platinum: 'Platinum (+100%)',
  titanium: 'Titanium (+150%)',
};

export const MIN_FLIGHT_POINTS = 500;

// ── 2026 earning method rates ─────────────────────────────────────────────────

/** Distance method: 1 pt per mile, no fare-class bonus, no minimum */
export const EARNING_2026_DISTANCE_RATE = 1;

/** Spend method: 5 pts per $1 of ticket price */
export const EARNING_2026_SPEND_RATE = 5;

/** Segment method: flat 500 pts per flight segment */
export const EARNING_2026_SEGMENT_RATE = 500;
