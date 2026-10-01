/**
 * Pure strategy logic behind the interactive demo.
 *
 * The GTO baseline in `lib/spots.ts` is fixed; an opponent read layers EV
 * adjustments on top of it. Everything a user sees -- the recommended line, the
 * EV gained by deviating, the grade on their answer -- is derived here so it can
 * be unit tested without rendering the page.
 */

import {
  opponentProfiles,
  spots,
  type OpponentId,
  type OpponentProfile,
  type Spot,
  type SpotAction,
} from './spots'

/** EV loss (in big blinds) a user can give up and still be graded 'close'. */
export const CLOSE_ENOUGH_BB = 0.2

export type Verdict = 'optimal' | 'close' | 'mistake'

export interface StrategyRow {
  action: SpotAction
  /** GTO baseline frequency, in percent. */
  frequency: number
  baselineEv: number
  /** Baseline EV plus this opponent's read, in big blinds. */
  adjustedEv: number
  /** Highest-EV action against a balanced opponent. */
  isBaselineBest: boolean
  /** Highest-EV action against this opponent. */
  isExploitBest: boolean
}

export interface Recommendation {
  opponent: OpponentProfile
  rows: StrategyRow[]
  baselineBestActionId: string
  exploitBestActionId: string
  /** Big blinds gained by playing the exploit line instead of the baseline. */
  evGain: number
  /** True when the read moves you off the baseline action entirely. */
  isDeviation: boolean
  notes: string[]
}

export interface Grade {
  verdict: Verdict
  /** Big blinds given up versus the best line against this opponent. */
  evLoss: number
  spotId: string
  opponentId: OpponentId
  chosenActionId: string
  bestActionId: string
}

/** One graded spot, resolved back to the labels needed to review it. */
export interface ReviewRow {
  grade: Grade
  spot: Spot
  opponent: OpponentProfile
  chosenLabel: string
  bestLabel: string
  /** True when the read moved the answer off the GTO baseline. */
  wasDeviation: boolean
}

export interface SessionSummary {
  answered: number
  optimal: number
  /** Percentage of spots answered with the highest-EV line, 0-100. */
  accuracy: number
  /** Total big blinds given up across the session. */
  evLost: number
}

/** Rounds to 2dp so authored tenths of a big blind do not surface float noise. */
function roundBb(value: number): number {
  return Math.round(value * 100) / 100
}

/** First action with the highest EV; ties resolve to the earlier action. */
function bestBy(actions: SpotAction[], ev: (action: SpotAction) => number): string {
  return actions.reduce((best, action) => (ev(action) > ev(best) ? action : best)).id
}

export function getSpot(spotId: string): Spot | undefined {
  return spots.find((spot) => spot.id === spotId)
}

export function getOpponentProfile(opponentId: OpponentId): OpponentProfile {
  const profile = opponentProfiles.find((candidate) => candidate.id === opponentId)

  if (!profile) {
    throw new Error(`Unknown opponent profile: ${opponentId}`)
  }

  return profile
}

export function getRecommendation(spot: Spot, opponentId: OpponentId): Recommendation {
  const read = spot.reads[opponentId]
  const adjustedEv = (action: SpotAction) => action.ev + (read.evAdjustments[action.id] ?? 0)

  const baselineBestActionId = bestBy(spot.actions, (action) => action.ev)
  const exploitBestActionId = bestBy(spot.actions, adjustedEv)

  const rows: StrategyRow[] = spot.actions.map((action) => ({
    action,
    frequency: action.frequency,
    baselineEv: roundBb(action.ev),
    adjustedEv: roundBb(adjustedEv(action)),
    isBaselineBest: action.id === baselineBestActionId,
    isExploitBest: action.id === exploitBestActionId,
  }))

  const exploitBest = rows.find((row) => row.action.id === exploitBestActionId)!
  const baselineBest = rows.find((row) => row.action.id === baselineBestActionId)!

  return {
    opponent: getOpponentProfile(opponentId),
    rows,
    baselineBestActionId,
    exploitBestActionId,
    evGain: roundBb(exploitBest.adjustedEv - baselineBest.adjustedEv),
    isDeviation: exploitBestActionId !== baselineBestActionId,
    notes: read.notes,
  }
}

export function gradeAnswer(spot: Spot, opponentId: OpponentId, chosenActionId: string): Grade {
  const recommendation = getRecommendation(spot, opponentId)
  const chosen = recommendation.rows.find((row) => row.action.id === chosenActionId)

  if (!chosen) {
    throw new Error(`Unknown action "${chosenActionId}" for spot "${spot.id}"`)
  }

  const best = recommendation.rows.find((row) => row.action.id === recommendation.exploitBestActionId)!
  const evLoss = roundBb(best.adjustedEv - chosen.adjustedEv)

  let verdict: Verdict = 'mistake'
  if (evLoss <= 0) {
    verdict = 'optimal'
  } else if (evLoss <= CLOSE_ENOUGH_BB) {
    verdict = 'close'
  }

  return {
    verdict,
    evLoss,
    spotId: spot.id,
    opponentId,
    chosenActionId,
    bestActionId: recommendation.exploitBestActionId,
  }
}

export function summarizeSession(grades: Grade[]): SessionSummary {
  const optimal = grades.filter((grade) => grade.verdict === 'optimal').length

  return {
    answered: grades.length,
    optimal,
    accuracy: grades.length === 0 ? 0 : Math.round((optimal / grades.length) * 100),
    evLost: roundBb(grades.reduce((total, grade) => total + grade.evLoss, 0)),
  }
}

/**
 * Resolves a session's grades back into reviewable rows.
 *
 * `Grade` only stores ids so it stays cheap to keep in state; this is where
 * those ids turn into the spot, opponent, and action labels the recap renders.
 */
export function reviewSession(grades: Grade[]): ReviewRow[] {
  return grades.map((grade) => {
    const spot = getSpot(grade.spotId)

    if (!spot) {
      throw new Error(`Unknown spot: ${grade.spotId}`)
    }

    const label = (actionId: string) =>
      spot.actions.find((action) => action.id === actionId)?.label ?? actionId

    return {
      grade,
      spot,
      opponent: getOpponentProfile(grade.opponentId),
      chosenLabel: label(grade.chosenActionId),
      bestLabel: label(grade.bestActionId),
      wasDeviation: getRecommendation(spot, grade.opponentId).isDeviation,
    }
  })
}

/**
 * The single spot that cost the most big blinds, or null for a clean session.
 * Ties resolve to the earliest spot so the callout stays stable on replay.
 */
export function findBiggestLeak(rows: ReviewRow[]): ReviewRow | null {
  return rows.reduce<ReviewRow | null>(
    (worst, row) =>
      row.grade.evLoss > 0 && (!worst || row.grade.evLoss > worst.grade.evLoss) ? row : worst,
    null,
  )
}

/** Hands dealt in one drill. Short enough to finish, long enough to repeat reads. */
export const DRILL_LENGTH = 5

/** One spot paired with the opponent you have to solve it against. */
export interface DealtHand {
  spot: Spot
  opponentId: OpponentId
}

/**
 * How a session picked its hands. Lives here rather than in the page because
 * the persisted history in `lib/progress.ts` records it alongside the grades.
 */
export type SessionKind = 'explore' | 'drill' | 'retry'

/** How a session went against one opponent profile. */
export interface OpponentBreakdown {
  opponent: OpponentProfile
  answered: number
  optimal: number
  /** Percentage of spots vs this read answered with the highest-EV line, 0-100. */
  accuracy: number
  /** Total big blinds given up against this read. */
  evLost: number
  /** True when at least one spot vs this read moved the answer off the baseline. */
  testedDeviation: boolean
}

/**
 * Small seeded PRNG (mulberry32) so a drill is reproducible from its seed.
 * The demo seeds it from the clock; tests seed it with a constant.
 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher-Yates over a copy, so the source array is left alone. */
function shuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items]

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

/**
 * Deals a drill: `DRILL_LENGTH` distinct spot/opponent pairings drawn from the
 * full grid, in random order. Pairings are distinct rather than spots, so the
 * same spot can come back against a different read -- which is the point, since
 * that is where the answer moves.
 */
export function buildDrill(seed: number): DealtHand[] {
  const pairings = spots.flatMap((spot) =>
    opponentProfiles.map((profile) => ({ spot, opponentId: profile.id })),
  )

  return shuffle(pairings, mulberry32(seed)).slice(0, DRILL_LENGTH)
}

/**
 * Groups a session by the opponent faced, worst read first.
 *
 * Complements `findBiggestLeak`: that names the single costliest spot, this
 * names the read you keep losing money to across spots. Ties resolve to the
 * read faced earlier so the list stays stable across re-renders.
 */
export function summarizeByOpponent(rows: ReviewRow[]): OpponentBreakdown[] {
  const byOpponent = new Map<OpponentId, OpponentBreakdown>()

  for (const row of rows) {
    const existing = byOpponent.get(row.grade.opponentId) ?? {
      opponent: row.opponent,
      answered: 0,
      optimal: 0,
      accuracy: 0,
      evLost: 0,
      testedDeviation: false,
    }

    byOpponent.set(row.grade.opponentId, {
      ...existing,
      answered: existing.answered + 1,
      optimal: existing.optimal + (row.grade.verdict === 'optimal' ? 1 : 0),
      evLost: roundBb(existing.evLost + row.grade.evLoss),
      testedDeviation: existing.testedDeviation || row.wasDeviation,
    })
  }

  return [...byOpponent.values()]
    .map((breakdown) => ({
      ...breakdown,
      accuracy: Math.round((breakdown.optimal / breakdown.answered) * 100),
    }))
    .sort((a, b) => b.evLost - a.evLost)
}

/**
 * Deals the pairings a session did not solve: every spot/read the player gave
 * up big blinds on, in the order they faced them.
 *
 * This is the other half of `findBiggestLeak` and `summarizeByOpponent` -- those
 * name the leaks, this hands them straight back. Pairings are deduplicated
 * defensively; a single session never repeats one, but `reviewSession` accepts
 * any grade list. 'Close' answers are included, because giving up EV at all is
 * what a retry is for.
 */
export function buildRetryDrill(rows: ReviewRow[]): DealtHand[] {
  const hands: DealtHand[] = []
  const seen = new Set<string>()

  for (const row of rows) {
    const key = `${row.spot.id}/${row.grade.opponentId}`

    if (row.grade.evLoss > 0 && !seen.has(key)) {
      seen.add(key)
      hands.push({ spot: row.spot, opponentId: row.grade.opponentId })
    }
  }

  return hands
}

/** Which spot/read pairings a player still owes, and which they have closed. */
export interface LeakProgress {
  /**
   * Pairings whose most recent attempt still gave up EV, costliest first.
   * Ordered by cost rather than by when they were faced, because across a
   * career this is a priority list rather than a replay of one session.
   */
  open: ReviewRow[]
  /** Pairings that cost EV once and whose most recent attempt was optimal. */
  closed: number
}

/**
 * Collapses a history down to the state of each spot/read pairing.
 *
 * `buildRetryDrill` asks "what did this session miss"; this asks "what is still
 * missed", which is only answerable once a pairing can be played more than
 * once. Only the latest attempt at a pairing counts, so replaying a leak
 * correctly closes it and botching a pairing you once had reopens it.
 */
export function summarizeLeakProgress(rows: ReviewRow[]): LeakProgress {
  const latest = new Map<string, ReviewRow>()
  const everLeaked = new Set<string>()

  for (const row of rows) {
    const key = `${row.spot.id}/${row.grade.opponentId}`

    latest.set(key, row)

    if (row.grade.evLoss > 0) {
      everLeaked.add(key)
    }
  }

  const open: ReviewRow[] = []
  let closed = 0

  for (const [key, row] of latest) {
    if (row.grade.evLoss > 0) {
      open.push(row)
    } else if (everLeaked.has(key)) {
      closed += 1
    }
  }

  // Map iteration is insertion-ordered and sort is stable, so pairings that
  // cost the same stay in the order they were first faced.
  return { open: open.sort((a, b) => b.grade.evLoss - a.grade.evLoss), closed }
}
