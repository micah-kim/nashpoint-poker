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
  /**
   * Epoch milliseconds the answer was recorded, when the caller knows it.
   *
   * A live session does not: it is being graded now, and nothing downstream of
   * a recap cares when. The persisted history does, because it stamps each
   * finished session, and that timestamp is what lets `buildCoverage` tell a
   * line proven this morning from one proven two months ago.
   */
  answeredAt?: number
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
 *
 * `answeredAt` stamps every row with when the grades were recorded. A live
 * session leaves it out; `summarizeCareer` passes each stored session's
 * `completedAt`, which is what makes a career's coverage age.
 */
export function reviewSession(grades: Grade[], answeredAt?: number): ReviewRow[] {
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
      answeredAt,
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
export type SessionKind = 'explore' | 'drill' | 'retry' | 'confirm' | 'refresh'

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

/**
 * Consecutive optimal attempts a pairing needs before it counts as proven.
 *
 * A spot offers two to four lines, so a single clean answer is inside guessing
 * range. Requiring the visitor to find the same line twice in a row is what
 * separates knowing a pairing from having been lucky in it once.
 */
export const MASTERY_REPS = 2

/** Milliseconds in a day, for turning two timestamps into whole days. */
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * How long a freshly proven pairing stays proven before it is due again.
 *
 * Proving a line twice says you knew it that day; it does not say you will
 * know it next month. Without an expiry the grid can only ever fill up, so a
 * visitor who proved everything in one sitting is told they have mastered the
 * trainer forever -- which is the one claim a training product should not make.
 */
export const MASTERY_FRESH_DAYS = 14

/** Longest a pairing can stay proven, however many reps back it up. */
export const MASTERY_FRESH_CAP_DAYS = 56

/**
 * How long a pairing stays proven, given the run of clean reps behind it.
 *
 * This is the 'spaced' half of spaced repetition: each clean rep past
 * `MASTERY_REPS` doubles the window, so a line you keep re-proving comes back
 * less and less often, up to `MASTERY_FRESH_CAP_DAYS`. A streak short of
 * `MASTERY_REPS` has no window because it was never proven in the first place.
 */
export function masteryFreshDays(streak: number): number {
  if (streak < MASTERY_REPS) return 0

  return Math.min(MASTERY_FRESH_CAP_DAYS, MASTERY_FRESH_DAYS * 2 ** (streak - MASTERY_REPS))
}

/**
 * Where a visitor stands on one spot/read pairing.
 *
 * 'learning' is the middle ground `MASTERY_REPS` creates: the latest attempt
 * was optimal, so nothing is owed in EV, but the pairing has not been proven
 * often enough to retire it from the drill queue.
 *
 * 'stale' is the other middle ground, the one time creates: the pairing was
 * proven, and long enough ago that the proof has expired. Nothing is owed in
 * EV there either -- it is a pairing due for review, not a leak.
 */
export type CoverageStatus = 'untested' | 'open' | 'learning' | 'mastered' | 'stale'

/** One cell of the spot-by-read grid, whether or not it has been played. */
export interface CoverageCell {
  spot: Spot
  opponent: OpponentProfile
  status: CoverageStatus
  /** How many times this pairing has been graded. */
  attempts: number
  /** EV given up on the most recent attempt, in big blinds. 0 when untested. */
  evLost: number
  /** Consecutive optimal attempts ending at the most recent one. */
  streak: number
  /** Clean reps still owed before this pairing is proven. 0 once mastered. */
  repsToMastery: number
  /** True when the read moves the answer off the GTO baseline. */
  isDeviation: boolean
  /** Epoch ms of the most recent attempt, or null when untested or untimed. */
  lastPlayedAt: number | null
  /** Whole days since that attempt, or null when it cannot be dated. */
  daysSinceLastPlayed: number | null
  /**
   * Whole days until this pairing is due for review. Null unless it has been
   * proven; 0 or negative once the proof has expired and the cell is 'stale'.
   */
  reviewDueInDays: number | null
}

/**
 * How much of a set of pairings has been seen and proven.
 *
 * Counts whatever grid it is handed, so it summarizes the whole spot-by-read
 * grid and any slice of it -- one street, one read -- with the same shape.
 * `StreetProgress` and `ReadProgress` are this plus the slice they describe.
 */
export interface CoverageSummary {
  /** Pairings in this grid or slice, in total. */
  total: number
  played: number
  mastered: number
  /** Pairings clean on the latest attempt but short of `MASTERY_REPS`. */
  learning: number
  open: number
  untested: number
  /** Pairings proven once but long enough ago to be due for review. */
  stale: number
  /** Percentage of them proven and still fresh, 0-100. */
  percentMastered: number
}

/**
 * Projects a history onto the full spot-by-read grid.
 *
 * `summarizeLeakProgress` only knows about pairings that have been played, so
 * it can never say what a visitor has not seen yet. This walks every pairing
 * the authored spots offer, in authored order, so the gaps are first-class:
 * an untested pairing is a different thing to one that was played and nailed.
 *
 * Status comes from the run of clean attempts ending at the latest one, not
 * from the latest attempt alone. A pairing whose last answer cost EV is open
 * however well it went before; a pairing answered right once is 'learning'
 * until it is answered right `MASTERY_REPS` times in a row, because one clean
 * answer out of two to four lines is inside guessing range. Missing a proven
 * pairing resets the run, so mastery has to be re-earned rather than dented.
 *
 * Pass `now` and a proof also expires: a pairing proven longer ago than its
 * streak earned it (see `masteryFreshDays`) comes back as 'stale'. Without a
 * `now` nothing ages, which is what a live session wants -- it is being graded
 * this second, so every row in it is as fresh as rows get. Rows with no
 * `answeredAt` never go stale either, so a history written before sessions
 * were dated keeps its mastery rather than expiring all at once.
 */
export function buildCoverage(rows: ReviewRow[], now?: number): CoverageCell[] {
  const attempts = new Map<string, { count: number; latest: ReviewRow; streak: number }>()

  for (const row of rows) {
    const key = `${row.spot.id}/${row.grade.opponentId}`
    const existing = attempts.get(key)
    const isClean = row.grade.evLoss <= 0

    attempts.set(key, {
      count: (existing?.count ?? 0) + 1,
      latest: row,
      streak: isClean ? (existing?.streak ?? 0) + 1 : 0,
    })
  }

  return spots.flatMap((spot) =>
    opponentProfiles.map((opponent) => {
      const played = attempts.get(`${spot.id}/${opponent.id}`)
      const streak = played?.streak ?? 0

      let status: CoverageStatus = 'untested'
      if (played) {
        status = streak === 0 ? 'open' : streak >= MASTERY_REPS ? 'mastered' : 'learning'
      }

      const lastPlayedAt = played?.latest.answeredAt ?? null
      const canAge = now !== undefined && lastPlayedAt !== null
      // Floor, so a pairing is only "1 day old" once a full day has passed.
      // Clamped at zero: a stored session stamped ahead of `now` -- a clock that
      // moved backwards, or a session finished after `now` was read -- would
      // otherwise report negative days and buy itself extra freshness.
      const daysSinceLastPlayed = canAge
        ? Math.max(0, Math.floor((now - lastPlayedAt) / DAY_MS))
        : null
      const reviewDueInDays =
        status === 'mastered' && daysSinceLastPlayed !== null
          ? masteryFreshDays(streak) - daysSinceLastPlayed
          : null

      if (reviewDueInDays !== null && reviewDueInDays <= 0) {
        status = 'stale'
      }

      return {
        spot,
        opponent,
        status,
        attempts: played?.count ?? 0,
        evLost: played ? played.latest.grade.evLoss : 0,
        streak,
        repsToMastery: Math.max(0, MASTERY_REPS - streak),
        isDeviation: getRecommendation(spot, opponent.id).isDeviation,
        lastPlayedAt,
        daysSinceLastPlayed,
        reviewDueInDays,
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
    learning: count('learning'),
    open: count('open'),
    untested: count('untested'),
    stale: count('stale'),
    percentMastered: coverage.length === 0 ? 0 : Math.round((mastered / coverage.length) * 100),
  }
}

/**
 * Which slice of the grid a drill is aimed at: one street, one opponent read,
 * or 'all' for the whole grid.
 *
 * Lives here rather than in the page because it is the only thing that changes
 * which pairings a drill can deal.
 *
 * The grid has two axes and a drill can be aimed down either one, but never
 * both at once. A street and a read intersect in only as many pairings as that
 * street has spots -- fewer than `DRILL_LENGTH` -- so an intersection drill
 * would deal the same two or three hands back every time. One axis at a time
 * keeps a focused drill a full drill.
 *
 * Street names and opponent ids cannot collide, so both axes share one flat
 * type and a focus stays one click deep.
 */
export type DrillFocus = Street | OpponentId | 'all'

/** Street focuses a visitor can pick, whole grid first then street by street. */
export const drillFocuses: DrillFocus[] = ['all', ...streets]

/** Read focuses a visitor can pick, in the order the profiles are authored. */
export const readFocuses: DrillFocus[] = opponentProfiles.map((profile) => profile.id)

/** Street names, for telling the two axes of a flat focus apart. */
const streetNames = new Set<string>(streets)

/** True when a focus names an opponent read rather than a street or the grid. */
export function isReadFocus(focus: DrillFocus): focus is OpponentId {
  return focus !== 'all' && !streetNames.has(focus)
}

/**
 * Whether one pairing is inside a focus. 'all' admits the whole grid.
 *
 * The single place the focus type is resolved back to a filter, so all four
 * drills narrow identically and a new focus axis only has to be taught to one
 * function.
 */
function matchesFocus(cell: CoverageCell, focus: DrillFocus): boolean {
  if (focus === 'all') return true
  if (isReadFocus(focus)) return cell.opponent.id === focus

  return cell.spot.street === focus
}

/** How much of one street's pairings a visitor has seen and proven. */
export interface StreetProgress extends CoverageSummary {
  street: Street
}

/** How much of one read's pairings a visitor has seen and proven. */
export interface ReadProgress extends CoverageSummary {
  opponent: OpponentProfile
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
    .map((street) => ({
      street,
      ...summarizeCoverage(coverage.filter((cell) => cell.spot.street === street)),
    }))
    .filter((progress) => progress.total > 0)
}

/**
 * Splits the same coverage grid by opponent read, in authored profile order.
 *
 * The other axis of the grid, and the one this product is actually about: a
 * street tells a visitor where in a hand they are weak, a read tells them who
 * they are weak against. `summarizeStreets` cannot answer the second, and
 * `summarizeByOpponent` only pools the answers a visitor has already given --
 * neither can say that the fish read has never been tested at all.
 *
 * Reads with no pairings are dropped, the same way streets are, so this only
 * ever names a read a drill can be focused on.
 */
export function summarizeReads(coverage: CoverageCell[]): ReadProgress[] {
  return opponentProfiles
    .map((opponent) => ({
      opponent,
      ...summarizeCoverage(coverage.filter((cell) => cell.opponent.id === opponent.id)),
    }))
    .filter((progress) => progress.total > 0)
}

/**
 * Deal order for a coverage drill: unseen first, then unsolved, then the ones
 * whose proof has expired, then the ones sitting on a single clean rep, then
 * the ones still proven.
 *
 * 'stale' sits ahead of 'learning' because it is the one that is actually due.
 * A pairing answered right yesterday is still fresh in memory, so re-dealing
 * it today tests recall at its easiest; a pairing proven two months ago is
 * exactly where recall has had time to fail.
 */
const coveragePriority: Record<CoverageStatus, number> = {
  untested: 0,
  open: 1,
  stale: 2,
  learning: 3,
  mastered: 4,
}

/**
 * Deals a drill of `DRILL_LENGTH` pairings from the gaps in a visitor's
 * coverage.
 *
 * Dealing uniformly from the grid means a returning visitor keeps being handed
 * pairings they have already proven while pairings they have never seen stay
 * unseen. This sorts the grid by what the history does not yet know --
 * untested, then still open, then one clean rep in, then proven -- and deals
 * the front of that list.
 * The shuffle happens first and the sort is stable, so the order inside a tier
 * is random but still reproducible from the seed.
 *
 * Cells are unique by construction, so a drill never repeats a pairing, but the
 * same spot can come back against a different read -- which is the point, since
 * that is where the answer moves. With no history every cell is untested, so
 * this degrades to a plain shuffle of the whole grid.
 *
 * A `focus` narrows the deal to one street or one read first. A focus with
 * fewer than `DRILL_LENGTH` pairings simply deals a shorter drill rather than
 * padding itself out with pairings from elsewhere -- a turn drill that quietly
 * hands you a preflop spot is not a turn drill, and a fish drill that hands you
 * a LAG spot is not a fish drill.
 */
export function buildCoverageDrill(
  coverage: CoverageCell[],
  seed: number,
  focus: DrillFocus = 'all',
): DealtHand[] {
  const pool = coverage.filter((cell) => matchesFocus(cell, focus))

  return shuffle(pool, mulberry32(seed))
    .sort((a, b) => coveragePriority[a.status] - coveragePriority[b.status])
    .slice(0, DRILL_LENGTH)
    .map((cell) => ({ spot: cell.spot, opponentId: cell.opponent.id }))
}

/**
 * Deals back the pairings sitting on a single clean rep.
 *
 * The third drill the coverage grid can hand out, and the one `MASTERY_REPS`
 * makes possible. `buildCoverageDrill` deals the gaps and `buildRetryDrill`
 * deals the leaks; neither can deal the pairings that look solved but are
 * still one answer away from being guesswork. Those are exactly the pairings
 * where a second rep is worth the most, because it either proves the line or
 * exposes the guess.
 *
 * Deals in authored grid order, so a confirm run reads preflop through river,
 * and takes no seed: there is nothing to randomise when the whole shortlist
 * gets dealt. A `focus` narrows it to one street or one read, the same way a
 * drill does.
 */
export function buildConfirmDrill(
  coverage: CoverageCell[],
  focus: DrillFocus = 'all',
): DealtHand[] {
  return coverage
    .filter((cell) => cell.status === 'learning')
    .filter((cell) => matchesFocus(cell, focus))
    .map((cell) => ({ spot: cell.spot, opponentId: cell.opponent.id }))
}

/**
 * Deals back the pairings whose proof has expired, most faded first.
 *
 * The fourth drill the coverage grid can hand out, and the only one that
 * exists because time passed rather than because the visitor got something
 * wrong. `buildCoverageDrill` deals the gaps, `buildRetryDrill` the leaks and
 * `buildConfirmDrill` the guesses; none of them can deal a line the visitor
 * genuinely knew in January, because on the evidence of the history it is
 * still known.
 *
 * Ordered by how overdue a pairing is rather than by authored order, so the
 * line proven longest ago is the first one handed back. Ties fall back to the
 * authored grid order, so a run dealt from one session's worth of stale
 * pairings still reads preflop through river. Takes no seed -- there is
 * nothing to randomise when the queue has its own priority -- and a `focus`
 * narrows it to one street or one read, the same way a drill does.
 */
export function buildRefreshDrill(
  coverage: CoverageCell[],
  focus: DrillFocus = 'all',
): DealtHand[] {
  return coverage
    .filter((cell) => cell.status === 'stale')
    .filter((cell) => matchesFocus(cell, focus))
    .map((cell, index) => ({ cell, index }))
    .sort(
      (a, b) =>
        (a.cell.reviewDueInDays ?? 0) - (b.cell.reviewDueInDays ?? 0) || a.index - b.index,
    )
    .map(({ cell }) => ({ spot: cell.spot, opponentId: cell.opponent.id }))
}

/**
 * The queue a training plan points at, or 'sharpen' when none of them has
 * anything waiting.
 *
 * The four real queues are the coverage statuses a drill can be built from.
 * 'mastered' is not one of them: a pairing that is proven and still fresh is
 * the one state the trainer has nothing to ask about, which is exactly what
 * 'sharpen' means -- the grid is clear, so train for the sake of it.
 */
export type PlanQueue = Exclude<CoverageStatus, 'mastered'> | 'sharpen'

/** Which queue to train next, and the drill that empties it. */
export interface TrainingPlan {
  queue: PlanQueue
  /** The session kind that drills this queue. */
  kind: SessionKind
  /** Pairings waiting in that queue. Zero only for 'sharpen'. */
  waiting: number
  /**
   * Whole days until the soonest still-proven pairing comes up for review, or
   * null when nothing is proven and dated. This is what makes the 'sharpen'
   * state readable: the grid is clear *for now*, and this says for how long.
   */
  nextReviewInDays: number | null
}

/** The drill each queue is emptied by. Mirrors the mode picker's five options. */
const queueKinds: Record<Exclude<PlanQueue, 'sharpen'>, SessionKind> = {
  untested: 'drill',
  open: 'retry',
  stale: 'refresh',
  learning: 'confirm',
}

/**
 * Names the one queue a visitor should train next.
 *
 * The trainer can now deal four different drills off the same grid, and the
 * mode picker offers whichever of them have hands in them -- which leaves a
 * returning visitor reading five buttons to work out what they owe. This
 * answers that in one line: the front of the queue, how much is in it, and
 * which drill empties it.
 *
 * Priority is `coveragePriority`, the same order `buildCoverageDrill` deals
 * in, so the recommendation and the deal cannot disagree about what matters
 * most. Deliberately blind to the drill focus, street or read: the plan is a
 * read on the whole grid, so it recommends a drill over the whole grid.
 *
 * Returns 'sharpen' rather than null when every pairing is proven and fresh,
 * because "nothing is due" is still worth saying -- and a mixed drill is still
 * worth playing.
 */
export function planNextSession(coverage: CoverageCell[]): TrainingPlan {
  const nextReviewInDays = coverage.reduce<number | null>((soonest, cell) => {
    if (cell.status !== 'mastered' || cell.reviewDueInDays === null) return soonest

    return soonest === null || cell.reviewDueInDays < soonest ? cell.reviewDueInDays : soonest
  }, null)

  const queues = (Object.keys(queueKinds) as Array<Exclude<PlanQueue, 'sharpen'>>).sort(
    (a, b) => coveragePriority[a] - coveragePriority[b],
  )

  for (const queue of queues) {
    const waiting = coverage.filter((cell) => cell.status === queue).length

    if (waiting > 0) {
      return { queue, kind: queueKinds[queue], waiting, nextReviewInDays }
    }
  }

  return { queue: 'sharpen', kind: 'drill', waiting: 0, nextReviewInDays }
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
