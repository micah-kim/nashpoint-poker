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
