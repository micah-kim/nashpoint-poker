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
  summarizeSession,
  summarizeStreets,
  summarizeTendency,
  type CoverageCell,
  type CoverageSummary,
  type Grade,
  type OpponentBreakdown,
  type ReviewRow,
  type SessionKind,
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
  /** Every spot/read pairing the trainer offers, played or not. */
  coverage: CoverageCell[]
  /** How much of that grid has been seen and proven. */
  coverageStats: CoverageSummary
  /** The same grid split by street, preflop through river. */
  streetProgress: StreetProgress[]
  /**
   * Which way every wrong answer ever given missed, over all grades rather
   * than the latest attempt at each pairing: a habit is a history, so closing
   * a leak does not erase the fact that folding is how you got there.
   */
  tendency: TendencySummary
  /** Accuracy of the most recent session, or null when nothing is stored. */
  latestAccuracy: number | null
  /** Accuracy before the most recent session, or null when it was the first. */
  priorAccuracy: number | null
}

export const emptyHistory: TrainingHistory = { sessions: [] }

const sessionKinds: SessionKind[] = ['explore', 'drill', 'retry', 'confirm']
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
 */
export function summarizeCareer(history: TrainingHistory): CareerSummary {
  const { sessions } = history
  const grades = sessions.flatMap((session) => session.grades)
  const rows = reviewSession(grades)
  const summary = summarizeSession(grades)
  const leaks = summarizeLeakProgress(rows)
  const coverage = buildCoverage(rows)
  const latest = sessions[sessions.length - 1]
  const prior = sessions.slice(0, -1).flatMap((session) => session.grades)

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
    tendency: summarizeTendency(rows),
    latestAccuracy: latest ? summarizeSession(latest.grades).accuracy : null,
    priorAccuracy: prior.length > 0 ? summarizeSession(prior).accuracy : null,
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
