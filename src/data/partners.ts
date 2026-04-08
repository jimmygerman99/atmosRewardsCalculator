// ── Miles earning rates ───────────────────────────────────────────────────────

export const HOTEL_MILES_PER_DOLLAR = 1;
export const CRUISE_MILES_PER_DOLLAR = 1;          // confirm with program — using 1 as default
export const CAR_RENTAL_MILES_PER_RENTAL = 1250;   // Avis / Budget
export const LYFT_MILES_PER_DOLLAR = 2;            // 2 miles/$1 regular; 3/$1 airport (using 2 as default)

// Shopping portal default (varies by retailer — user adjusts)
export const SHOPPING_DEFAULT_MILES_PER_DOLLAR = 1;

// ── Status point earning rates ────────────────────────────────────────────────

// Hotels, car rentals, cruises, Lyft: 1 status point per $1 spent
export const PARTNER_STATUS_POINTS_PER_DOLLAR = 1;

// Shopping portal: 1 status point per 3 base Atmos Miles earned
export const SHOPPING_STATUS_POINTS_RATIO = 1 / 3;
