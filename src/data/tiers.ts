import type { EliteTier } from '../types';

export interface TierInfo {
  tier: EliteTier;
  label: string;
  threshold: number;
  dotColor: string;   // Tailwind bg class for the dot on the bar
  textColor: string;
  borderColor: string;
}

export const TIERS: TierInfo[] = [
  { tier: 'none',     label: 'Member',   threshold: 0,       dotColor: 'bg-gray-300',   textColor: 'text-gray-500',   borderColor: 'border-gray-300' },
  { tier: 'silver',   label: 'Silver',   threshold: 20_000,  dotColor: 'bg-gray-400',   textColor: 'text-gray-600',   borderColor: 'border-gray-400' },
  { tier: 'gold',     label: 'Gold',     threshold: 40_000,  dotColor: 'bg-yellow-500', textColor: 'text-yellow-700', borderColor: 'border-yellow-400' },
  { tier: 'platinum', label: 'Platinum', threshold: 80_000,  dotColor: 'bg-sky-500',    textColor: 'text-sky-700',    borderColor: 'border-sky-400' },
  { tier: 'titanium', label: 'Titanium', threshold: 135_000, dotColor: 'bg-purple-600', textColor: 'text-purple-700', borderColor: 'border-purple-500' },
];

export interface MilestoneInfo {
  points: number;
  choices: number;
  rewards: string[];
}

export const MILESTONE_DATA: MilestoneInfo[] = [
  {
    points: 10_000,
    choices: 1,
    rewards: [
      '750 bonus points',
      'Complimentary pre-order food item',
      'One complimentary Wi-Fi pass',
      'Try Silver status for a trip',
      'Double points with non-air partners',
      'Avis/Budget rental car upgrade',
      '$10 SAF contribution',
    ],
  },
  {
    points: 30_000,
    choices: 1,
    rewards: [
      '2,500 bonus points',
      '$25 off a future Alaska flight',
      'Four Wi-Fi passes',
      'Try Gold status for a trip',
      '$100 off Alaska Lounge membership',
      '$25 SAF contribution',
    ],
  },
  {
    points: 55_000,
    choices: 2,
    rewards: [
      '5,000 bonus points',
      '10,000 pts off an Atmos Unlocked experience',
      'Gift Atmos Silver status for a trip',
      'One complimentary lounge day pass',
      'Two upgrade certificates',
      '$50 SAF contribution',
    ],
  },
  {
    points: 95_000,
    choices: 2,
    rewards: [
      '15,000 bonus points',
      '25,000 pts off an Atmos Unlocked experience',
      'Two complimentary lounge day passes',
      'Two upgrade certificates',
      'Gift Atmos Gold status for a trip',
      'Nominate someone for Atmos Silver',
      '10,000 status points rolled over',
      '$150 SAF contribution',
    ],
  },
  {
    points: 125_000,
    choices: 1,
    rewards: [
      '50,000 bonus points',
      '75,000 pts off an Atmos Unlocked experience',
      'Alaska Lounge+ membership',
      'Complimentary Wi-Fi on every flight',
      'Four upgrade certificates',
      'Nominate someone for Atmos Gold',
    ],
  },
  {
    points: 150_000,
    choices: 2,
    rewards: [
      '15,000 bonus points',
      '25,000 pts off an Atmos Unlocked experience',
      'Two complimentary lounge day passes',
      'Two upgrade certificates',
      '10,000 status points rolled over',
      '$150 SAF contribution',
    ],
  },
  {
    points: 200_000,
    choices: 2,
    rewards: [
      '15,000 bonus points',
      '25,000 pts off an Atmos Unlocked experience',
      'Two complimentary lounge day passes',
      'Two upgrade certificates',
      '10,000 status points rolled over',
      '$150 SAF contribution',
    ],
  },
  {
    points: 250_000,
    choices: 2,
    rewards: [
      '15,000 bonus points',
      '25,000 pts off an Atmos Unlocked experience',
      'Two complimentary lounge day passes',
      'Two upgrade certificates',
      '10,000 status points rolled over',
      '$150 SAF contribution',
    ],
  },
];

// The display max for the bar (covers all tiers + first post-Titanium milestone)
export const BAR_MAX = 150_000;

export function getCurrentTier(statusPoints: number): TierInfo {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (statusPoints >= tier.threshold) current = tier;
  }
  return current;
}

export function getNextTier(statusPoints: number): TierInfo | null {
  return TIERS.find(t => t.threshold > statusPoints) ?? null;
}

export function getNextMilestone(statusPoints: number): MilestoneInfo | null {
  return MILESTONE_DATA.find(m => m.points > statusPoints) ?? null;
}
