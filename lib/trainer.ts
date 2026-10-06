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
  streets,
  type OpponentId,
  type OpponentProfile,
  type Spot,
  type SpotAction,
  type Street,
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

/** Where a visitor stands on one spot/read pairing. */
export type CoverageStatus = 'untested' | 'open' | 'mastered'

/** One cell of the spot-by-read grid, whether or not it has been played. */
export interface CoverageCell {
  spot: Spot
  opponent: OpponentProfile
  status: CoverageStatus
  /** How many times this pairing has been graded. */
  attempts: number
  /** EV given up on the most recent attempt, in big blinds. 0 when untested. */
  evLost: number
  /** True when the read moves the answer off the GTO baseline. */
  isDeviation: boolean
}

export interface CoverageSummary {
  /** Pairings the authored spots offer in total. */
  total: number
  played: number
  mastered: number
  open: number
  untested: number
  /** Percentage of the whole grid whose latest attempt was optimal, 0-100. */
  percentMastered: number
}

/**
 * Projects a history onto the full spot-by-read grid.
 *
 * `summarizeLeakProgress` only knows about pairings that have been played, so
 * it can never say what a visitor has not seen yet. This walks every pairing
 * the authored spots offer, in authored order, so the gaps are first-class:
 * an untested pairing is a different thing to one that was played and nailed.
 */
export function buildCoverage(rows: ReviewRow[]): CoverageCell[] {
  const attempts = new Map<string, { count: number; latest: ReviewRow }>()

  for (const row of rows) {
    const key = `${row.spot.id}/${row.grade.opponentId}`
    const existing = attempts.get(key)

    attempts.set(key, { count: (existing?.count ?? 0) + 1, latest: row })
  }

  return spots.flatMap((spot) =>
    opponentProfiles.map((opponent) => {
      const played = attempts.get(`${spot.id}/${opponent.id}`)
      const evLost = played ? played.latest.grade.evLoss : 0

      let status: CoverageStatus = 'untested'
      if (played) {
        status = evLost > 0 ? 'open' : 'mastered'
      }

      return {
        spot,
        opponent,
        status,
        attempts: played?.count ?? 0,
        evLost,
        isDeviation: getRecommendation(spot, opponent.id).isDeviation,
      }
    }),
  )
}

export function summarizeCoverage(coverage: CoverageCell[]): CoverageSummary {
  const count = (status: CoverageStatus) =>
    coverage.filter((cell) => cell.status === status).length

  const mastered = count('mastered')

  return {
    total: coverage.length,
    played: coverage.filter((cell) => cell.status !== 'untested').length,
    mastered,
    open: count('open'),
    untested: count('untested'),
    percentMastered: coverage.length === 0 ? 0 : Math.round((mastered / coverage.length) * 100),
  }
}

/**
 * Which street a drill is aimed at, or 'all' for the whole grid.
 *
 * Lives here rather than in the page because it is the only thing that changes
 * which pairings a drill can deal.
 */
export type DrillFocus = Street | 'all'

/** Every focus a visitor can pick, whole grid first then street by street. */
export const drillFocuses: DrillFocus[] = ['all', ...streets]

/** How much of one street's pairings a visitor has seen and proven. */
export interface StreetProgress {
  street: Street
  /** Pairings this street offers: its spots times the opponent profiles. */
  total: number
  mastered: number
  open: number
  untested: number
  /** Percentage of this street's pairings whose latest attempt was optimal, 0-100. */
  percentMastered: number
}

/**
 * Splits a coverage grid by street, in the order a hand is played.
 *
 * `summarizeCoverage` collapses the whole grid to one number, which hides the
 * thing a player actually wants to know: that their river play is solid and
 * their turn play has never been tested. Streets with no authored spots are
 * dropped, so this only ever names a street a drill can be focused on.
 */
export function summarizeStreets(coverage: CoverageCell[]): StreetProgress[] {
  return streets
    .map((street) => {
      const cells = coverage.filter((cell) => cell.spot.street === street)
      const stats = summarizeCoverage(cells)

      return {
        street,
        total: stats.total,
        mastered: stats.mastered,
        open: stats.open,
        untested: stats.untested,
        percentMastered: stats.percentMastered,
      }
    })
    .filter((progress) => progress.total > 0)
}

/** Deal order for a coverage drill: unseen first, then unsolved, then proven. */
const coveragePriority: Record<CoverageStatus, number> = {
  untested: 0,
  open: 1,
  mastered: 2,
}

/**
 * Deals a drill of `DRILL_LENGTH` pairings from the gaps in a visitor's
 * coverage.
 *
 * Dealing uniformly from the grid means a returning visitor keeps being handed
 * pairings they have already proven while pairings they have never seen stay
 * unseen. This sorts the grid by what the history does not yet know --
 * untested, then still open, then mastered -- and deals the front of that list.
 * The shuffle happens first and the sort is stable, so the order inside a tier
 * is random but still reproducible from the seed.
 *
 * Cells are unique by construction, so a drill never repeats a pairing, but the
 * same spot can come back against a different read -- which is the point, since
 * that is where the answer moves. With no history every cell is untested, so
 * this degrades to a plain shuffle of the whole grid.
 *
 * A `focus` narrows the deal to one street first. A street with fewer than
 * `DRILL_LENGTH` pairings simply deals a shorter drill rather than padding
 * itself out with pairings from elsewhere -- a turn drill that quietly hands
 * you a preflop spot is not a turn drill.
 */
export function buildCoverageDrill(
  coverage: CoverageCell[],
  seed: number,
  focus: DrillFocus = 'all',
): DealtHand[] {
  const pool = focus === 'all' ? coverage : coverage.filter((cell) => cell.spot.street === focus)

  return shuffle(pool, mulberry32(seed))
    .sort((a, b) => coveragePriority[a.status] - coveragePriority[b.status])
    .slice(0, DRILL_LENGTH)
    .map((cell) => ({ spot: cell.spot, opponentId: cell.opponent.id }))
}

/**
 * Which side of the max-EV line a wrong answer fell on.
 *
 * Reads the authored action order in `lib/spots.ts`, which runs from the most
 * passive line to the most aggressive one, so an action's index is its
 * aggression rank.
 */
export type TendencyDirection = 'passive' | 'aggressive'

/**
 * Which way one answer missed, or null when it did not miss.
 *
 * `evLoss > 0` guarantees the chosen action was not the best one -- a tie in
 * adjusted EV resolves to the earlier action and grades as optimal -- so a
 * miss always has a direction. Returns null for a grade whose actions no
 * longer resolve, the same way the rest of this module degrades instead of
 * throwing on data an older deploy wrote.
 */
export function missDirection(row: ReviewRow): TendencyDirection | null {
  if (row.grade.evLoss <= 0) return null

  const rank = (actionId: string) => row.spot.actions.findIndex((action) => action.id === actionId)
  const chosen = rank(row.grade.chosenActionId)
  const best = rank(row.grade.bestActionId)

  if (chosen < 0 || best < 0) return null

  return chosen < best ? 'passive' : 'aggressive'
}

/** What missing in one direction has cost. */
export interface TendencySide {
  direction: TendencyDirection
  /** Answers that missed this way. */
  mistakes: number
  /** Big blinds given up missing this way. */
  evLost: number
}

/** How one street's misses split, because a bias is often local to a street. */
export interface StreetTendency {
  street: Street
  /** Answers on this street that gave up EV. */
  missed: number
  passive: TendencySide
  aggressive: TendencySide
  /** Total big blinds given up on this street. */
  evLost: number
  /** The costlier direction here, or null when the two cost the same. */
  bias: TendencySide | null
}

export interface TendencySummary {
  /** Answers graded, including the ones that were right. */
  answered: number
  /** Answers that gave up EV. A tendency is only measured over these. */
  missed: number
  passive: TendencySide
  aggressive: TendencySide
  /** The costlier direction overall, or null with no misses or an exact tie. */
  bias: TendencySide | null
  /** Streets with at least one miss, in the order a hand is played. */
  byStreet: StreetTendency[]
}

function emptySide(direction: TendencyDirection): TendencySide {
  return { direction, mistakes: 0, evLost: 0 }
}

/**
 * The costlier of the two directions, or null when there is nothing to name.
 *
 * Big blinds decide it rather than miss counts, because one expensive river
 * fold is a worse habit than two cheap preflop over-folds. Count is only the
 * tie-break; a dead heat on both has no bias to report.
 */
function pickBias(passive: TendencySide, aggressive: TendencySide): TendencySide | null {
  if (passive.mistakes === 0 && aggressive.mistakes === 0) return null
  if (passive.evLost !== aggressive.evLost) {
    return passive.evLost > aggressive.evLost ? passive : aggressive
  }
  if (passive.mistakes !== aggressive.mistakes) {
    return passive.mistakes > aggressive.mistakes ? passive : aggressive
  }

  return null
}

/**
 * Diagnoses the shape of a player's mistakes rather than their location.
 *
 * `summarizeLeakProgress` and `buildCoverage` say which pairings cost money;
 * this says what the wrong answers had in common. Two players can own the same
 * open leaks for opposite reasons -- one folds every river, the other barrels
 * every river -- and the fix is the opposite advice, which no pairing list can
 * express. Correct answers are counted in `answered` but have no direction, so
 * they never pull the bias either way.
 */
export function summarizeTendency(rows: ReviewRow[]): TendencySummary {
  const sides: Record<TendencyDirection, TendencySide> = {
    passive: emptySide('passive'),
    aggressive: emptySide('aggressive'),
  }
  const byStreet = new Map<Street, StreetTendency>()

  for (const row of rows) {
    const direction = missDirection(row)

    if (!direction) continue

    const side = sides[direction]
    side.mistakes += 1
    side.evLost = roundBb(side.evLost + row.grade.evLoss)

    const street =
      byStreet.get(row.spot.street) ??
      ({
        street: row.spot.street,
        missed: 0,
        passive: emptySide('passive'),
        aggressive: emptySide('aggressive'),
        evLost: 0,
        bias: null,
      } satisfies StreetTendency)

    street.missed += 1
    street.evLost = roundBb(street.evLost + row.grade.evLoss)
    street[direction].mistakes += 1
    street[direction].evLost = roundBb(street[direction].evLost + row.grade.evLoss)
    byStreet.set(row.spot.street, street)
  }

  return {
    answered: rows.length,
    missed: sides.passive.mistakes + sides.aggressive.mistakes,
    passive: sides.passive,
    aggressive: sides.aggressive,
    bias: pickBias(sides.passive, sides.aggressive),
    byStreet: streets
      .filter((street) => byStreet.has(street))
      .map((street) => {
        const tendency = byStreet.get(street)!

        return { ...tendency, bias: pickBias(tendency.passive, tendency.aggressive) }
      }),
  }
}

/**
 * Deals back the pairings that missed in one direction.
 *
 * Turns the diagnosis into a drill: `summarizeTendency` says you keep calling
 * where a raise prints, this hands you the hands you called. Reuses
 * `buildRetryDrill`, so dedup and ordering are the same -- pass a session's
 * rows for the order they were faced, or a career's open leaks for costliest
 * first.
 */
export function buildTendencyDrill(
  rows: ReviewRow[],
  direction: TendencyDirection,
): DealtHand[] {
  return buildRetryDrill(rows.filter((row) => missDirection(row) === direction))
}
