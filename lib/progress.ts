/**
 * Persistent training history for the interactive demo.
 *
 * `lib/trainer.ts` grades one session and forgets it. This keeps a log of
 * finished sessions in the browser so a returning visitor still has their
 * leaks: which read keeps beating them, which pairings they have closed, and
 * which ones they still owe.
 *
 * Storage is `localStorage` only -- no account, no network, nothing leaves the
 * device. The parsing here is deliberately defensive: the authored spots in
 * `lib/spots.ts` change between deploys, and a stored grade pointing at a spot
 * or action that no longer exists would make `reviewSession` throw.
 */

import { opponentProfiles, type OpponentId } from './spots'
import {
  buildCoverage,
  getSpot,
  reviewSession,
  summarizeByOpponent,
  summarizeCoverage,
  summarizeLeakProgress,
  summarizeReads,
  summarizeSession,
  summarizeSpots,
  summarizeStreets,
  summarizeTendency,
  type CoverageCell,
  type CoverageSummary,
  type Grade,
  type OpponentBreakdown,
  type ReadProgress,
  type ReviewRow,
  type SessionKind,
  type SpotProgress,
  type StreetProgress,
  type TendencySummary,
  type Verdict,
} from './trainer'

export const HISTORY_STORAGE_KEY = 'nashpoint.trainer.history.v1'

/** Sessions kept before the oldest is dropped. Caps the stored payload size. */
export const MAX_STORED_SESSIONS = 25

/** One finished session, as written to storage. */
export interface PersistedSession {
  kind: SessionKind
  /** Epoch milliseconds, stamped when the last spot was graded. */
  completedAt: number
  grades: Grade[]
}

export interface TrainingHistory {
  sessions: PersistedSession[]
}

/**
 * Sessions on each side of the rolling form comparison.
 *
 * The trend this feeds has to answer "am I getting better" over a run of
 * five-hand sessions, where a single session is mostly noise: three spots out
 * of five is 60% and four is 80%, and nothing about the player changed in
 * between. Three sessions a side is the smallest window that averages that
 * out while still being reachable in one sitting.
 */
export const FORM_WINDOW_SESSIONS = 3

/** Milliseconds in a day, for turning two timestamps into whole days. */
const DAY_MS = 24 * 60 * 60 * 1000

/** One finished session, summarized for the log rather than for the grid. */
export interface SessionLogEntry {
  /** 1-based position in the stored history, counting from the oldest kept. */
  number: number
  /** Which drill dealt it. The log is the only place this is ever shown. */
  kind: SessionKind
  completedAt: number
  answered: number
  optimal: number
  /** Percentage of this session answered with the highest-EV line, 0-100. */
  accuracy: number
  /** Big blinds given up in this session. */
  evLost: number
  /**
   * Whole days between this session and `now`, or null when the caller passed
   * no clock. Clamped at zero the same way coverage ageing is, so a session
   * stamped ahead of the clock reads as today rather than as a future date.
   */
  daysAgo: number | null
}

/** How a visitor's recent sessions have gone, and which way they are going. */
export interface TrainingForm {
  /** Every stored session, newest first -- the order a log is read in. */
  sessions: SessionLogEntry[]
  /**
   * Accuracy pooled over the most recent `FORM_WINDOW_SESSIONS` sessions, or
   * null with nothing stored. Pooled over answers rather than averaged over
   * sessions, so a short session cannot weigh as much as a full one.
   */
  recentAccuracy: number | null
  /** The same over the window before it, or null when there is not one yet. */
  previousAccuracy: number | null
  /** Points of accuracy gained on that window, or null with nothing to compare. */
  trend: number | null
  /** Sessions each side of the comparison actually drew on. */
  recentSessions: number
  previousSessions: number
  /** Whole days since the newest session, or null when there is no clock. */
  daysSinceLastSession: number | null
}

/**
 * Rolls a history up into a session-by-session log and a rolling trend.
 *
 * `summarizeCareer` collapses every session into one lifetime accuracy, which
 * is the one number that cannot move once a visitor has played a while: the
 * history it is averaged over keeps growing. So a player who has genuinely
 * stopped leaking sees a lifetime figure that barely budges, and the trainer
 * has no way to tell them they are improving.
 *
 * This keeps the sessions apart. Each entry is one finished session graded on
 * its own, and the trend compares the most recent `FORM_WINDOW_SESSIONS`
 * against the window immediately before them -- a like-for-like comparison of
 * recent play against slightly older play, rather than one session against a
 * career.
 *
 * The windows are pooled by answer, not averaged by session, so the trend
 * cannot be moved by a street drill that only had two hands in it. A window
 * with no sessions before it has nothing to compare against and reports a
 * null trend rather than a flattering zero.
 *
 * Pass `now` to date the entries. Without it they are undated, which is what
 * server rendering needs -- a clock read during render would not match the
 * client on hydration, the same reason `buildCoverage` only ages when asked.
 */
export function summarizeForm(history: TrainingHistory, now?: number): TrainingForm {
  const { sessions } = history
  const accuracyOver = (window: PersistedSession[]): number | null =>
    window.length === 0
      ? null
      : summarizeSession(window.flatMap((entry) => entry.grades)).accuracy

  const entries: SessionLogEntry[] = sessions.map((entry, index) => {
    const summary = summarizeSession(entry.grades)

    return {
      number: index + 1,
      kind: entry.kind,
      completedAt: entry.completedAt,
      answered: summary.answered,
      optimal: summary.optimal,
      accuracy: summary.accuracy,
      evLost: summary.evLost,
      daysAgo:
        now === undefined ? null : Math.max(0, Math.floor((now - entry.completedAt) / DAY_MS)),
    }
  })

  const recent = sessions.slice(-FORM_WINDOW_SESSIONS)
  // The window before the recent one, which is empty until there are sessions
  // on both sides -- with four stored sessions the comparison is the last
  // three against the first one.
  const previous = sessions.slice(
    Math.max(0, sessions.length - FORM_WINDOW_SESSIONS * 2),
    sessions.length - recent.length,
  )
  const recentAccuracy = accuracyOver(recent)
  const previousAccuracy = accuracyOver(previous)

  return {
    sessions: [...entries].reverse(),
    recentAccuracy,
    previousAccuracy,
    trend:
      recentAccuracy === null || previousAccuracy === null
        ? null
        : recentAccuracy - previousAccuracy,
    recentSessions: recent.length,
    previousSessions: previous.length,
    daysSinceLastSession: entries[entries.length - 1]?.daysAgo ?? null,
  }
}

/** Lifetime view of a history, derived the same way the recap derives a session. */
export interface CareerSummary {
  sessions: number
  answered: number
  optimal: number
  /** Percentage of all spots ever answered with the highest-EV line, 0-100. */
  accuracy: number
  /** Total big blinds given up across every session. */
  evLost: number
  /** The read that has cost the most, or null when nothing has been played. */
  toughestRead: OpponentBreakdown | null
  /** Pairings whose latest attempt still gave up EV, costliest first. */
  openLeaks: ReviewRow[]
  /** Pairings missed once and since played perfectly. */
  closedLeaks: number
  /**
   * Every spot/read pairing the trainer offers, played or not, aged against
   * the `now` this summary was built with: a pairing proven long enough ago
   * comes back as due for review rather than staying proven forever.
   */
  coverage: CoverageCell[]
  /** How much of that grid has been seen, proven, and is still fresh. */
  coverageStats: CoverageSummary
  /** The same grid split by street, preflop through river. */
  streetProgress: StreetProgress[]
  /**
   * The same grid split by opponent read instead, in authored profile order.
   *
   * The other half of the "where am I weak" answer, and the half `toughestRead`
   * cannot give: that names the read which has cost the most of the answers
   * already given, which says nothing about a read never faced. A read sitting
   * at nothing proven is invisible in every other panel on the page.
   */
  readProgress: ReadProgress[]
  /**
   * The same grid split one row at a time, in authored street order.
   *
   * The slice a street split and a read split both average away: a spot's five
   * pairings differ by nothing but the opponent, so a row that is red against
   * three reads and green against two is not a street problem or a read
   * problem, it is that one spot's exploit being misread.
   */
  spotProgress: SpotProgress[]
  /**
   * Which way every wrong answer ever given missed, over all grades rather
   * than the latest attempt at each pairing: a habit is a history, so closing
   * a leak does not erase the fact that folding is how you got there.
   */
  tendency: TendencySummary
  /**
   * The stored sessions kept apart rather than pooled: one entry each, newest
   * first, plus the rolling trend across the most recent window. This is the
   * only part of a career that can say which way a visitor is going, because
   * `accuracy` above averages over a history that only ever grows.
   */
  form: TrainingForm
}

export const emptyHistory: TrainingHistory = { sessions: [] }

const sessionKinds: SessionKind[] = ['explore', 'drill', 'retry', 'confirm', 'refresh']
const verdicts: Verdict[] = ['optimal', 'close', 'mistake']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Rebuilds a grade from stored JSON, or returns null if it no longer describes
 * a spot the current trainer can grade.
 */
function parseGrade(value: unknown): Grade | null {
  if (!isRecord(value)) return null

  const { verdict, evLoss, spotId, opponentId, chosenActionId, bestActionId } = value

  if (typeof spotId !== 'string') return null
  if (typeof chosenActionId !== 'string' || typeof bestActionId !== 'string') return null
  if (typeof evLoss !== 'number' || !Number.isFinite(evLoss) || evLoss < 0) return null
  if (!verdicts.includes(verdict as Verdict)) return null
  if (!opponentProfiles.some((profile) => profile.id === opponentId)) return null

  const spot = getSpot(spotId)

  if (!spot) return null
  if (!spot.actions.some((action) => action.id === chosenActionId)) return null
  if (!spot.actions.some((action) => action.id === bestActionId)) return null

  return {
    verdict: verdict as Verdict,
    evLoss,
    spotId,
    opponentId: opponentId as OpponentId,
    chosenActionId,
    bestActionId,
  }
}

/** Drops the grades that no longer resolve; null when none survive. */
function parseSession(value: unknown): PersistedSession | null {
  if (!isRecord(value)) return null
  if (!Array.isArray(value.grades)) return null
  if (!sessionKinds.includes(value.kind as SessionKind)) return null
  if (typeof value.completedAt !== 'number' || !Number.isFinite(value.completedAt)) return null

  const grades = value.grades.map(parseGrade).filter((grade): grade is Grade => grade !== null)

  if (grades.length === 0) return null

  return { kind: value.kind as SessionKind, completedAt: value.completedAt, grades }
}

/**
 * Parses stored JSON into a history, discarding anything unrecognised.
 *
 * Never throws: a corrupt or outdated payload degrades to an empty history
 * rather than breaking the page the visitor came to play.
 */
export function parseHistory(raw: string | null): TrainingHistory {
  if (!raw) return emptyHistory

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return emptyHistory
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.sessions)) return emptyHistory

  const sessions = parsed.sessions
    .map(parseSession)
    .filter((session): session is PersistedSession => session !== null)
    .slice(-MAX_STORED_SESSIONS)

  return { sessions }
}

export function serializeHistory(history: TrainingHistory): string {
  return JSON.stringify(history)
}

/**
 * Appends a finished session, keeping only the most recent
 * `MAX_STORED_SESSIONS`. Returns a new history; the input is left alone.
 * An empty session is ignored, so nothing records a run with no answers.
 */
export function appendSession(
  history: TrainingHistory,
  session: PersistedSession,
): TrainingHistory {
  if (session.grades.length === 0) return history

  return { sessions: [...history.sessions, session].slice(-MAX_STORED_SESSIONS) }
}

/**
 * Rolls a history up into lifetime numbers.
 *
 * Reuses the session-level aggregations so the career card and the recap card
 * cannot disagree: the only difference is how many grades go in.
 *
 * Rows are reviewed per session rather than over one flat list of grades, so
 * each one carries the `completedAt` of the session it came from. That is the
 * only reason a career can age: pass `now` and pairings proven long enough ago
 * fall back to due-for-review. Leave `now` out and nothing expires, which is
 * what server rendering needs -- a clock read during render would not match
 * the client on hydration.
 */
export function summarizeCareer(history: TrainingHistory, now?: number): CareerSummary {
  const { sessions } = history
  const grades = sessions.flatMap((session) => session.grades)
  const rows = sessions.flatMap((session) => reviewSession(session.grades, session.completedAt))
  const summary = summarizeSession(grades)
  const leaks = summarizeLeakProgress(rows)
  const coverage = buildCoverage(rows, now)

  return {
    sessions: sessions.length,
    answered: summary.answered,
    optimal: summary.optimal,
    accuracy: summary.accuracy,
    evLost: summary.evLost,
    toughestRead: summarizeByOpponent(rows)[0] ?? null,
    openLeaks: leaks.open,
    closedLeaks: leaks.closed,
    coverage,
    coverageStats: summarizeCoverage(coverage),
    streetProgress: summarizeStreets(coverage),
    readProgress: summarizeReads(coverage),
    spotProgress: summarizeSpots(coverage),
    tendency: summarizeTendency(rows),
    form: summarizeForm(history, now),
  }
}

/**
 * Reads the history for this browser. Returns an empty history during server
 * rendering, or when storage is unavailable (private mode, blocked cookies).
 */
export function loadHistory(): TrainingHistory {
  if (typeof window === 'undefined') return emptyHistory

  try {
    return parseHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY))
  } catch {
    return emptyHistory
  }
}

/** Best-effort write. A full or blocked quota silently loses the session. */
export function saveHistory(history: TrainingHistory): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, serializeHistory(history))
  } catch {
    // Nothing useful to tell the visitor: the trainer still works unrecorded.
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY)
  } catch {
    // Same as above -- the in-memory reset is what the visitor actually sees.
  }
}
