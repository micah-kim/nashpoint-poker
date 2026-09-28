import { describe, expect, it } from 'vitest'
import { opponentProfiles, spots } from './spots'
import {
  CLOSE_ENOUGH_BB,
  findBiggestLeak,
  getOpponentProfile,
  getRecommendation,
  getSpot,
  gradeAnswer,
  reviewSession,
  summarizeSession,
} from './trainer'

const cbetSpot = getSpot('btn-cbet-tptk')!
const riverSpot = getSpot('bb-river-bluffcatch')!

describe('spot data', () => {
  it('exposes at least one spot', () => {
    expect(spots.length).toBeGreaterThan(0)
  })

  it.each(spots)('$id has baseline frequencies summing to 100', (spot) => {
    const total = spot.actions.reduce((sum, action) => sum + action.frequency, 0)
    expect(total).toBe(100)
  })

  it.each(spots)('$id has a read and adjustments for every opponent and action', (spot) => {
    for (const profile of opponentProfiles) {
      const read = spot.reads[profile.id]
      expect(read, `${spot.id} is missing a read for ${profile.id}`).toBeDefined()
      expect(read.notes.length).toBeGreaterThan(0)

      for (const action of spot.actions) {
        expect(
          read.evAdjustments[action.id],
          `${spot.id}/${profile.id} is missing an adjustment for ${action.id}`,
        ).toBeTypeOf('number')
      }
    }
  })

  it.each(spots)('$id uses unique action ids', (spot) => {
    const ids = spot.actions.map((action) => action.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getRecommendation', () => {
  it('leaves the baseline untouched against a balanced opponent', () => {
    const recommendation = getRecommendation(cbetSpot, 'gto')

    expect(recommendation.exploitBestActionId).toBe(recommendation.baselineBestActionId)
    expect(recommendation.isDeviation).toBe(false)
    expect(recommendation.evGain).toBe(0)
    expect(recommendation.rows.every((row) => row.adjustedEv === row.baselineEv)).toBe(true)
  })

  it('sizes up against a calling station', () => {
    const recommendation = getRecommendation(cbetSpot, 'fish')

    expect(recommendation.baselineBestActionId).toBe('bet66')
    expect(recommendation.exploitBestActionId).toBe('overbet')
    expect(recommendation.isDeviation).toBe(true)
    expect(recommendation.evGain).toBeGreaterThan(0)
  })

  it('checks to trap a LAG instead of betting', () => {
    expect(getRecommendation(cbetSpot, 'lag').exploitBestActionId).toBe('check')
  })

  it('folds the river bluff-catcher against an under-bluffing opponent', () => {
    expect(getRecommendation(riverSpot, 'gto').exploitBestActionId).toBe('call')
    expect(getRecommendation(riverSpot, 'tag').exploitBestActionId).toBe('fold')
    expect(getRecommendation(riverSpot, 'fish').exploitBestActionId).toBe('fold')
  })

  it('never reports a negative gain for deviating', () => {
    for (const spot of spots) {
      for (const profile of opponentProfiles) {
        expect(getRecommendation(spot, profile.id).evGain).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('marks exactly one baseline-best and one exploit-best action', () => {
    for (const spot of spots) {
      for (const profile of opponentProfiles) {
        const { rows } = getRecommendation(spot, profile.id)
        expect(rows.filter((row) => row.isBaselineBest)).toHaveLength(1)
        expect(rows.filter((row) => row.isExploitBest)).toHaveLength(1)
      }
    }
  })

  it('carries the opponent profile through for display', () => {
    expect(getRecommendation(cbetSpot, 'tag').opponent.label).toBe('TAG (Tight-Aggressive)')
  })
})

describe('gradeAnswer', () => {
  it('grades the exploit line as optimal with no EV loss', () => {
    const grade = gradeAnswer(cbetSpot, 'fish', 'overbet')

    expect(grade.verdict).toBe('optimal')
    expect(grade.evLoss).toBe(0)
    expect(grade.bestActionId).toBe('overbet')
  })

  it('grades the GTO line as a mistake when the read says otherwise', () => {
    expect(gradeAnswer(riverSpot, 'tag', 'call').verdict).toBe('mistake')
  })

  it('grades a near-miss as close rather than a mistake', () => {
    const grade = gradeAnswer(cbetSpot, 'reg', 'bet66')

    expect(grade.evLoss).toBeGreaterThan(0)
    expect(grade.evLoss).toBeLessThanOrEqual(CLOSE_ENOUGH_BB)
    expect(grade.verdict).toBe('close')
  })

  it('grades a clearly losing line as a mistake', () => {
    const grade = gradeAnswer(riverSpot, 'gto', 'raise')

    expect(grade.verdict).toBe('mistake')
    expect(grade.evLoss).toBeGreaterThan(CLOSE_ENOUGH_BB)
  })

  it('reports EV loss in whole cents rather than float noise', () => {
    expect(gradeAnswer(cbetSpot, 'tag', 'check')).toMatchObject({ evLoss: 0.72 })
  })

  it('throws on an action that does not belong to the spot', () => {
    expect(() => gradeAnswer(cbetSpot, 'tag', 'fold')).toThrow(/Unknown action/)
  })
})

describe('getOpponentProfile', () => {
  it('throws on an unknown opponent', () => {
    // @ts-expect-error -- exercising the runtime guard with an invalid id
    expect(() => getOpponentProfile('whale')).toThrow(/Unknown opponent profile/)
  })
})

describe('summarizeSession', () => {
  it('reports zeroes for an empty session', () => {
    expect(summarizeSession([])).toEqual({ answered: 0, optimal: 0, accuracy: 0, evLost: 0 })
  })

  it('counts optimal answers and totals the EV given up', () => {
    const summary = summarizeSession([
      gradeAnswer(cbetSpot, 'fish', 'overbet'),
      gradeAnswer(riverSpot, 'tag', 'call'),
    ])

    expect(summary).toMatchObject({ answered: 2, optimal: 1, accuracy: 50 })
    expect(summary.evLost).toBeGreaterThan(0)
  })
})

describe('reviewSession', () => {
  it('returns nothing for an empty session', () => {
    expect(reviewSession([])).toEqual([])
  })

  it('resolves ids back into the spot, opponent, and action labels', () => {
    const [row] = reviewSession([gradeAnswer(riverSpot, 'tag', 'call')])

    expect(row.spot.id).toBe('bb-river-bluffcatch')
    expect(row.opponent.shortLabel).toBe('TAG')
    expect(row.chosenLabel).toBe('Call 10bb')
    expect(row.bestLabel).toBe('Fold')
  })

  it('preserves the order the spots were played in', () => {
    const rows = reviewSession([
      gradeAnswer(riverSpot, 'lag', 'call'),
      gradeAnswer(cbetSpot, 'fish', 'overbet'),
    ])

    expect(rows.map((row) => row.spot.id)).toEqual(['bb-river-bluffcatch', 'btn-cbet-tptk'])
  })

  it('flags the spots where the read overrides the GTO baseline', () => {
    const [deviation, noDeviation] = reviewSession([
      gradeAnswer(cbetSpot, 'fish', 'overbet'),
      gradeAnswer(cbetSpot, 'gto', 'bet66'),
    ])

    expect(deviation.wasDeviation).toBe(true)
    expect(noDeviation.wasDeviation).toBe(false)
  })

  it('throws on a grade referencing a spot that no longer exists', () => {
    const stale = { ...gradeAnswer(cbetSpot, 'tag', 'check'), spotId: 'retired-spot' }

    expect(() => reviewSession([stale])).toThrow(/Unknown spot/)
  })
})

describe('findBiggestLeak', () => {
  it('returns null when every answer was optimal', () => {
    const rows = reviewSession([
      gradeAnswer(cbetSpot, 'fish', 'overbet'),
      gradeAnswer(riverSpot, 'tag', 'fold'),
    ])

    expect(findBiggestLeak(rows)).toBeNull()
  })

  it('picks the spot that gave up the most big blinds', () => {
    const rows = reviewSession([
      gradeAnswer(cbetSpot, 'reg', 'bet66'),
      gradeAnswer(riverSpot, 'tag', 'call'),
    ])

    expect(findBiggestLeak(rows)?.spot.id).toBe('bb-river-bluffcatch')
  })

  it('keeps the earlier spot when two leaks cost the same', () => {
    const rows = reviewSession([
      gradeAnswer(riverSpot, 'tag', 'call'),
      gradeAnswer(riverSpot, 'tag', 'call'),
      gradeAnswer(cbetSpot, 'reg', 'bet66'),
    ])
    const leak = findBiggestLeak(rows)

    expect(leak).toBe(rows[0])
  })
})
