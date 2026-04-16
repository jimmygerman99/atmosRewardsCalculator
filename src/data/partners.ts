import type { EliteTier } from '../types';

// ── Miles earning rates ───────────────────────────────────────────────────────

export const HOTEL_MILES_PER_DOLLAR = 1;
export const CRUISE_MILES_PER_DOLLAR = 1;          // confirm with program — using 1 as default
export const LYFT_MILES_PER_DOLLAR = 2;            // 2 miles/$1 regular; 3/$1 airport (using 2 as default)

// Avis / Budget car rentals — miles per rental vary by status and card ownership
export const CAR_RENTAL_MILES_PER_TIER: Record<EliteTier, number> = {
  none:     500,   // regular member (no card)
  silver:   1000,
  gold:     1000,
  platinum: 1250,
  titanium: 1250,
};
export const CAR_RENTAL_MILES_CARD_HOLDER = 750; // Atmos™ Visa / Hawaiian World Elite Mastercard, no status

// Shopping portal default (varies by retailer — user adjusts)
export const SHOPPING_DEFAULT_MILES_PER_DOLLAR = 1;

// ── Status point earning rates ────────────────────────────────────────────────

// Hotels, car rentals, cruises, Lyft: 1 status point per $1 spent
export const PARTNER_STATUS_POINTS_PER_DOLLAR = 1;

// Shopping portal: 1 status point per 3 base Atmos Miles earned
export const SHOPPING_STATUS_POINTS_RATIO = 1 / 3;
