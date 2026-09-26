/**
 * Hand-authored training spots for the interactive demo.
 *
 * Each spot carries a GTO baseline (frequencies for the strategy chart, EV in
 * big blinds for grading) plus a per-opponent EV adjustment table. The
 * adjustments are what turn the baseline into an exploitative recommendation --
 * see `lib/trainer.ts` for the derivation.
 *
 * These numbers are authored teaching approximations for the marketing demo,
 * not solver output. Keep them directionally honest.
 */

export type OpponentId = 'gto' | 'tag' | 'lag' | 'fish' | 'reg'

export interface OpponentProfile {
  id: OpponentId
  label: string
  shortLabel: string
  summary: string
}

export interface SpotAction {
  id: string
  label: string
  /** GTO baseline frequency, in percent. Frequencies in a spot sum to 100. */
  frequency: number
  /** GTO baseline EV for taking this action, in big blinds. */
  ev: number
}

export interface OpponentRead {
  /** EV adjustment per action id, in big blinds, relative to the GTO baseline. */
  evAdjustments: Record<string, number>
  /** Why the adjustment exists, shown in the exploit panel. */
  notes: string[]
}

export interface Spot {
  id: string
  title: string
  street: string
  position: string
  potType: string
  hand: string[]
  board: string[]
  setup: string
  question: string
  actions: SpotAction[]
  /** Explanation of the baseline solution, independent of opponent type. */
  baselineNote: string
  reads: Record<OpponentId, OpponentRead>
}

export const opponentProfiles: OpponentProfile[] = [
  {
    id: 'gto',
    label: 'Balanced GTO',
    shortLabel: 'GTO',
    summary: 'Plays a balanced, unexploitable range. No deviation is profitable.',
  },
  {
    id: 'tag',
    label: 'TAG (Tight-Aggressive)',
    shortLabel: 'TAG',
    summary: 'Tight ranges, honest lines. Under-bluffs rivers, over-folds to pressure.',
  },
  {
    id: 'lag',
    label: 'LAG (Loose-Aggressive)',
    shortLabel: 'LAG',
    summary: 'Wide ranges and relentless aggression. Over-bluffs when you show weakness.',
  },
  {
    id: 'fish',
    label: 'Passive Fish',
    shortLabel: 'Fish',
    summary: 'Calls far too wide, almost never bluffs, rarely raises without the goods.',
  },
  {
    id: 'reg',
    label: 'Micro Reg',
    shortLabel: 'Micro reg',
    summary: 'Solid preflop, sticky postflop. Calls one street too many, then gives up.',
  },
]

export const spots: Spot[] = [
  {
    id: 'btn-3bet-aqo',
    title: 'AQo on the button vs a UTG open',
    street: 'Preflop',
    position: 'BTN',
    potType: 'Open-raised pot',
    hand: ['As', 'Qd'],
    board: [],
    setup: 'UTG opens to 3bb and folds through to you on the button with 100bb effective.',
    question: "What's your play?",
    baselineNote:
      'AQo is comfortably strong enough to 3-bet for value in position against a first-in UTG range, and the extra fold equity is free. Flatting keeps dominated offsuit broadways in the pot behind you.',
    actions: [
      { id: 'fold', label: 'Fold', frequency: 8, ev: 0 },
      { id: 'call', label: 'Call 3bb', frequency: 30, ev: 0.55 },
      { id: 'threebet', label: '3-bet to 9bb', frequency: 62, ev: 0.8 },
      { id: 'jam', label: '3-bet all-in', frequency: 0, ev: -1.4 },
    ],
    reads: {
      gto: {
        evAdjustments: { fold: 0, call: 0, threebet: 0, jam: 0 },
        notes: ['A balanced opponent gives you nothing to attack -- take the baseline line.'],
      },
      tag: {
        evAdjustments: { fold: 0, call: 0.2, threebet: -0.3, jam: -0.2 },
        notes: [
          'A tight UTG range is already ahead of AQo, so 3-betting mostly folds out the hands you beat.',
          'Flatting realises your equity in position against a range that plays honestly postflop.',
        ],
      },
      lag: {
        evAdjustments: { fold: 0, call: 0.1, threebet: 0.45, jam: -0.5 },
        notes: [
          'A LAG opens far wider than UTG theory, so AQo is now a clear favourite against their range.',
          '3-bet bigger and more often -- they defend too light and then over-bluff postflop.',
        ],
      },
      fish: {
        evAdjustments: { fold: 0, call: 0.4, threebet: 0.05, jam: -0.7 },
        notes: [
          'A fish calls 3-bets with dominated hands but also folds too little postflop to your c-bets.',
          'Flatting keeps them in with the whole range you dominate and keeps you in position on every street.',
        ],
      },
      reg: {
        evAdjustments: { fold: 0, call: -0.05, threebet: 0.1, jam: -0.6 },
        notes: [
          'A micro reg opens a touch wider than theory from UTG and 4-bets far too rarely.',
          'Keep 3-betting -- the deviation is small, which is exactly what you should expect against a competent player.',
        ],
      },
    },
  },
  {
    id: 'btn-cbet-tptk',
    title: 'Top pair, top kicker on a king-high board',
    street: 'Flop',
    position: 'BTN',
    potType: 'Single-raised pot',
    hand: ['Ah', 'Kd'],
    board: ['Ks', 'Qh', '7d'],
    setup: 'You raised the button, the big blind called. They check to you on the flop in a 6.5bb pot.',
    question: 'How much do you bet?',
    baselineNote:
      'Top pair with the best kicker wants to bet for value and charge the heavy draw density on a king-queen board. Two-thirds pot is the workhorse size; a small slice of checks protects your checking range.',
    actions: [
      { id: 'check', label: 'Check', frequency: 22, ev: 3.1 },
      { id: 'bet33', label: 'Bet 1/3 pot', frequency: 10, ev: 3.35 },
      { id: 'bet66', label: 'Bet 2/3 pot', frequency: 68, ev: 3.6 },
      { id: 'overbet', label: 'Overbet 125% pot', frequency: 0, ev: 3.05 },
    ],
    reads: {
      gto: {
        evAdjustments: { check: 0, bet33: 0, bet66: 0, overbet: 0 },
        notes: ['Against a balanced defender the baseline sizing is already the max-EV line.'],
      },
      tag: {
        evAdjustments: { check: -0.1, bet33: 0.04, bet66: 0.12, overbet: 0.02 },
        notes: [
          'TAG players under-defend against flop c-bets with marginal holdings.',
          'Same sizing, higher frequency -- push the bet toward 75% of your range.',
        ],
      },
      lag: {
        evAdjustments: { check: 0.85, bet33: -0.1, bet66: -0.05, overbet: -0.2 },
        notes: [
          'A LAG stabs at almost every checked flop, so checking traps their bluffs instead of folding them out.',
          'Your hand is strong enough to call down comfortably once they take the betting lead.',
        ],
      },
      fish: {
        evAdjustments: { check: -0.25, bet33: 0.05, bet66: 0.3, overbet: 0.95 },
        notes: [
          'A passive fish calls any pair or draw and almost never raises without a monster.',
          'Size up hard -- against an inelastic calling range, more money in equals more EV.',
        ],
      },
      reg: {
        evAdjustments: { check: -0.05, bet33: 0.45, bet66: 0.05, overbet: -0.3 },
        notes: [
          'A micro reg calls the flop far too wide, then folds to the turn barrel.',
          'The small size keeps their whole floating range in cheaply and sets up two more streets of pressure.',
        ],
      },
    },
  },
  {
    id: 'bb-river-bluffcatch',
    title: 'Second pair facing a river bet',
    street: 'River',
    position: 'BB',
    potType: 'Single-raised pot',
    hand: ['9d', '8d'],
    board: ['Qs', '9h', '4d', '3c', '2s'],
    setup: 'You defended the big blind and check-called the flop. They fire again on a blank river, betting 10bb into a 14bb pot.',
    question: 'What do you do with second pair?',
    baselineNote:
      'This is a textbook bluff-catcher: against a balanced river range you are close to indifferent, which is exactly what the solver wants. Raising turns a hand with showdown value into a bluff and loses money outright.',
    actions: [
      { id: 'fold', label: 'Fold', frequency: 45, ev: 0 },
      { id: 'call', label: 'Call 10bb', frequency: 55, ev: 0.15 },
      { id: 'raise', label: 'Raise to 30bb', frequency: 0, ev: -2.2 },
    ],
    reads: {
      gto: {
        evAdjustments: { fold: 0, call: 0, raise: 0 },
        notes: ['A balanced river range leaves you genuinely indifferent -- either call or fold is fine.'],
      },
      tag: {
        evAdjustments: { fold: 0, call: -1.3, raise: 1.2 },
        notes: [
          'TAG players badly under-bluff rivers: three barrels almost always means value.',
          'Indifference collapses the moment the range is value-heavy. Fold and save the 10bb.',
        ],
      },
      lag: {
        evAdjustments: { fold: 0, call: 1.8, raise: 0.4 },
        notes: [
          'A LAG triple-barrels every missed draw and every busted backdoor.',
          'Second pair is a comfortable call against a range this bluff-heavy -- this is where your win rate comes from.',
        ],
      },
      fish: {
        evAdjustments: { fold: 0, call: -1.6, raise: 1.1 },
        notes: [
          'Passive players do not fire three streets without a real hand.',
          'A river bet from a fish is the single most reliable fold signal in low-stakes poker.',
        ],
      },
      reg: {
        evAdjustments: { fold: 0, call: -0.4, raise: 0.9 },
        notes: [
          'Micro regs know they should bluff rivers but still do it too rarely.',
          'A small fold-leaning deviation, not a big one -- they are not nearly as unbalanced as the recreational players.',
        ],
      },
    },
  },
]
