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

/** The streets a spot can sit on. Also the order a drill can be focused in. */
export type Street = 'Preflop' | 'Flop' | 'Turn' | 'River'

/** Canonical street order -- the order a hand is actually played. */
export const streets: Street[] = ['Preflop', 'Flop', 'Turn', 'River']

export interface OpponentProfile {
  id: OpponentId
  label: string
  shortLabel: string
  summary: string
}

/**
 * One line a spot offers.
 *
 * A spot's actions are authored from the most passive line to the most
 * aggressive one -- fold or check, then call, then bet and raise sizes
 * ascending. The index is therefore an aggression rank, which is what
 * `missDirection` in `lib/trainer.ts` reads to say whether a wrong answer was
 * too passive or too aggressive. Re-ordering a spot's actions changes that
 * diagnosis, so keep new spots in the same order.
 */
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
  street: Street
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

/**
 * Authored in street order, preflop through river, so the grid and the
 * pick-the-read walkthrough both read the way a hand is played.
 */
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
    id: 'bb-defend-k9s',
    title: 'K9 suited in the big blind vs a button steal',
    street: 'Preflop',
    position: 'BB',
    potType: 'Open-raised pot',
    hand: ['Kh', '9h'],
    board: [],
    setup:
      'It folds to the button, who opens to 2.5bb. You are in the big blind with 100bb effective, getting the best price in poker.',
    question: 'How do you defend?',
    baselineNote:
      'Closing the action at better than 3-to-1 means a suited king is never folding to one raise, and K9s flops well enough to continue out of position. Theory calls most of the time and 3-bets a slice to stop the button stealing for free.',
    actions: [
      { id: 'fold', label: 'Fold', frequency: 6, ev: 0 },
      { id: 'call', label: 'Call 1.5bb more', frequency: 72, ev: 0.12 },
      { id: 'threebet', label: '3-bet to 10bb', frequency: 22, ev: 0.05 },
    ],
    reads: {
      gto: {
        evAdjustments: { fold: 0, call: 0, threebet: 0 },
        notes: [
          'A balanced button steals the right amount and plays back at your 3-bet correctly -- there is nothing to attack.',
        ],
      },
      tag: {
        evAdjustments: { fold: 0, call: -0.04, threebet: -0.2 },
        notes: [
          'A TAG opens the button tighter than theory, so your price is worse than the raw pot odds suggest.',
          'Keep calling, but drop the balance 3-bets: against an honest range they fold out the hands you dominate and get 4-bet by the rest.',
        ],
      },
      lag: {
        evAdjustments: { fold: 0, call: 0.2, threebet: 0.5 },
        notes: [
          'A LAG opens the button with almost any two cards, which puts K9s comfortably ahead of their range.',
          '3-bet. Either you take it down preflop or you play a bigger pot with the better hand -- punishing a wide steal is where blind defence makes its money.',
        ],
      },
      fish: {
        evAdjustments: { fold: 0, call: 0.35, threebet: -0.1 },
        notes: [
          'A passive player opens wide and calls your 3-bet with all of it, so the fold equity you are paying for is not there.',
          'Just call. A small pot out of position lets you fold cheaply when you miss and still get paid in full when you flop a king.',
        ],
      },
      reg: {
        evAdjustments: { fold: 0, call: 0.05, threebet: 0.15 },
        notes: [
          'Micro regs open the button a little wider than theory and fold to blind 3-bets a little too often.',
          'A marginal 3-bet, not a big one. The edge is real but thin -- which is what you should expect against a competent player.',
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
    id: 'bb-flop-raise-draw',
    title: 'Open-ender facing a small c-bet',
    street: 'Flop',
    position: 'BB',
    potType: 'Single-raised pot',
    hand: ['8s', '7s'],
    board: ['9s', '6d', '2h'],
    setup:
      'You defended the big blind against a cutoff open. They bet 2bb into a 6.5bb pot on 9-6-2, and you have an open-ender with a backdoor flush draw.',
    question: 'How do you play the draw?',
    baselineNote:
      'Thirteen clean outs is far too much equity to fold against a small range bet, and raising charges the entire air portion of a one-third-pot betting range. Theory raises a healthy chunk of its best draws here and calls with the rest.',
    actions: [
      { id: 'fold', label: 'Fold', frequency: 4, ev: 0 },
      { id: 'call', label: 'Call 2bb', frequency: 54, ev: 1.1 },
      { id: 'raise', label: 'Raise to 7bb', frequency: 42, ev: 1.35 },
    ],
    reads: {
      gto: {
        evAdjustments: { fold: 0, call: 0, raise: 0 },
        notes: [
          'Against a balanced c-bettor the baseline mix is already max-EV -- raise your best draws, call the rest.',
        ],
      },
      tag: {
        evAdjustments: { fold: 0, call: -0.1, raise: 0.4 },
        notes: [
          'TAG players range-bet this flop small and then over-fold to a raise with the exact hands they were betting for protection.',
          'Raise, and raise more often than theory. The fold equity comes on top of thirteen outs.',
        ],
      },
      lag: {
        evAdjustments: { fold: 0, call: 0.3, raise: -0.45 },
        notes: [
          'A LAG bets this flop with everything and then refuses to fold to a raise -- plenty of them jam straight over it.',
          'Call. A draw this good does not need fold equity, and they will pay you off every time you get there.',
        ],
      },
      fish: {
        evAdjustments: { fold: 0, call: 0.25, raise: -0.55 },
        notes: [
          'A passive player does not fire this flop without a piece of it, so a raise is folding out almost nothing.',
          'Call, hit, and collect. They will never fold the pair they bet when you make your straight.',
        ],
      },
      reg: {
        evAdjustments: { fold: 0, call: 0.1, raise: 0.1 },
        notes: [
          'A micro reg c-bets this texture close to correctly and defends a flop raise about as often as they should.',
          'Take the baseline line. The money against them comes one street later, on the turn they fold too often.',
        ],
      },
    },
  },
  {
    id: 'btn-turn-barrel-draw',
    title: 'Flush draw on the turn after a called c-bet',
    street: 'Turn',
    position: 'BTN',
    potType: 'Single-raised pot',
    hand: ['Jh', 'Th'],
    board: ['9s', '6h', '2c', 'Ah'],
    setup:
      'You raised the button and c-bet a 9-6-2 flop; the big blind called. The ace of hearts on the turn gives you a flush draw to go with two overcards, in a 15bb pot.',
    question: 'Do you barrel the turn?',
    baselineNote:
      'Nine outs to a flush plus two overcards is a textbook semi-bluff: you fold out better hands now and still improve when you get called. Two-thirds pot is the standard barrel, and the checks keep enough equity in a range that has to defend the river.',
    actions: [
      { id: 'check', label: 'Check', frequency: 30, ev: 2.2 },
      { id: 'bet33', label: 'Bet 1/3 pot', frequency: 12, ev: 2.3 },
      { id: 'bet66', label: 'Bet 2/3 pot', frequency: 58, ev: 2.5 },
    ],
    reads: {
      gto: {
        evAdjustments: { check: 0, bet33: 0, bet66: 0 },
        notes: [
          'A balanced defender folds exactly the right amount of this turn, so the baseline barrel is already max-EV.',
        ],
      },
      tag: {
        evAdjustments: { check: -0.15, bet33: 0.05, bet66: 0.45 },
        notes: [
          'TAG players read a turn barrel as real strength and fold every pair they cannot call twice with.',
          'Barrel, and pick the bigger size -- their fold frequency is the entire reason this hand prints.',
        ],
      },
      lag: {
        evAdjustments: { check: 0.6, bet33: -0.2, bet66: -0.35 },
        notes: [
          'A LAG floats your flop c-bet with everything and then raises turns specifically to blow you off this hand.',
          'Check. You realise nine outs for free and keep the pot small with a holding that cannot stand a raise.',
        ],
      },
      fish: {
        evAdjustments: { check: 0.75, bet33: -0.3, bet66: -0.8 },
        notes: [
          'A passive fish calls a turn barrel with any pair and any draw, so there is no fold equity to buy.',
          'Check and take the free card. Bluffing a station is the most expensive habit in low-stakes poker -- you beat them by value betting instead.',
        ],
      },
      reg: {
        evAdjustments: { check: -0.05, bet33: 0.1, bet66: 0.2 },
        notes: [
          'Micro regs call flops too wide and then fold the turn more often than they should.',
          'Keep barrelling. The turn is the street where their loose flop call gives up.',
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
  {
    id: 'btn-river-bluff-ace-high',
    title: 'Busted flush draw on the river',
    street: 'River',
    position: 'BTN',
    potType: 'Single-raised pot',
    hand: ['Ad', '5d'],
    board: ['Kc', '9d', '4h', '7d', '2s'],
    setup:
      'You raised the button and barrelled the flop and turn. The deuce of spades bricks your flush draw, leaving you ace-high in a 34bb pot.',
    question: 'Do you fire the third barrel?',
    baselineNote:
      'A busted draw holding the ace of diamonds is the ideal river bluff: you block their nut flush and ace-high essentially never wins a showdown against a range that called twice. Theory bluffs big here, because checking concedes a pot you can still take away.',
    actions: [
      { id: 'check', label: 'Check', frequency: 35, ev: 0 },
      { id: 'bet50', label: 'Bet 1/2 pot', frequency: 15, ev: 1.4 },
      { id: 'bet100', label: 'Bet pot', frequency: 50, ev: 1.9 },
    ],
    reads: {
      gto: {
        evAdjustments: { check: 0, bet50: 0, bet100: 0 },
        notes: [
          'A balanced river caller defends exactly enough to keep your bluff honest -- the baseline size is still the best of the three.',
        ],
      },
      tag: {
        evAdjustments: { check: 0, bet50: 0.3, bet100: 0.9 },
        notes: [
          'TAG players fold rivers far too often, and the hands they are folding are the one-pair holdings that called the turn for showdown value.',
          'Fire the big one. A hand with no showdown value against a range that will not call is the cheapest money in poker.',
        ],
      },
      lag: {
        evAdjustments: { check: 0, bet50: -1.6, bet100: -2.2 },
        notes: [
          'A LAG calls rivers wide, because they assume you are doing exactly this.',
          'Give up. Ace-high will not win a showdown, but losing nothing still beats losing another 34bb.',
        ],
      },
      fish: {
        evAdjustments: { check: 0, bet50: -1.6, bet100: -2.3 },
        notes: [
          'A passive fish calls the river with any pair, and most of their range already beats ace-high.',
          'Check it back. Against a player who never folds, a bluff is a donation -- save it for a spot where you have the goods.',
        ],
      },
      reg: {
        evAdjustments: { check: 0, bet50: -0.5, bet100: -1.1 },
        notes: [
          'Micro regs over-call rivers with the pairs they floated the turn with, so the big bluff gets through much less than theory assumes.',
          'If you are bluffing, bluff small. Half pot still folds out their worst hands and costs you far less when it does not work.',
        ],
      },
    },
  },
]
