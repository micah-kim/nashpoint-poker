import { describe, expect, it } from 'vitest'
import { opponentProfiles, spots } from './spots'
import {
  buildDrill,
  buildRetryDrill,
  CLOSE_ENOUGH_BB,
  DRILL_LENGTH,
  findBiggestLeak,
  getOpponentProfile,
  getRecommendation,
  getSpot,
  gradeAnswer,
  reviewSession,
  summarizeByOpponent,
  summarizeLeakProgress,
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

describe('buildDrill', () => {
  it('deals the advertised number of hands', () => {
    expect(buildDrill(1)).toHaveLength(DRILL_LENGTH)
  })

  it('is reproducible from its seed', () => {
    const key = (hand: { spot: { id: string }; opponentId: string }) =>
      `${hand.spot.id}/${hand.opponentId}`

    expect(buildDrill(42).map(key)).toEqual(buildDrill(42).map(key))
  })

  it('deals a different order for a different seed', () => {
    const key = (hand: { spot: { id: string }; opponentId: string }) =>
      `${hand.spot.id}/${hand.opponentId}`
    const seeds = [1, 2, 3, 4, 5, 6, 7, 8].map((seed) => buildDrill(seed).map(key).join(','))

    expect(new Set(seeds).size).toBeGreaterThan(1)
  })

  it('never deals the same spot/opponent pairing twice in one drill', () => {
    for (const seed of [0, 7, 99, 1234, 987654321]) {
      const pairings = buildDrill(seed).map((hand) => `${hand.spot.id}/${hand.opponentId}`)

      expect(new Set(pairings).size, `seed ${seed} repeated a pairing`).toBe(pairings.length)
    }
  })

  it('only deals pairings the trainer can grade', () => {
    for (const hand of buildDrill(2026)) {
      expect(spots).toContain(hand.spot)
      expect(() => gradeAnswer(hand.spot, hand.opponentId, hand.spot.actions[0].id)).not.toThrow()
    }
  })
})

describe('summarizeByOpponent', () => {
  it('returns nothing for an empty session', () => {
    expect(summarizeByOpponent([])).toEqual([])
  })

  it('aggregates every spot played against the same read', () => {
    const rows = reviewSession([
      gradeAnswer(cbetSpot, 'tag', 'bet66'),
      gradeAnswer(riverSpot, 'tag', 'call'),
    ])
    const [tag] = summarizeByOpponent(rows)

    expect(tag.opponent.id).toBe('tag')
    expect(tag).toMatchObject({ answered: 2, optimal: 1, accuracy: 50 })
    expect(tag.evLost).toBeGreaterThan(0)
  })

  it('keeps one row per read faced', () => {
    const rows = reviewSession([
      gradeAnswer(cbetSpot, 'fish', 'overbet'),
      gradeAnswer(riverSpot, 'lag', 'call'),
      gradeAnswer(cbetSpot, 'fish', 'check'),
    ])

    expect(summarizeByOpponent(rows).map((row) => row.opponent.id)).toEqual(['fish', 'lag'])
  })

  it('puts the read that cost the most first', () => {
    const rows = reviewSession([
      gradeAnswer(cbetSpot, 'reg', 'bet66'),
      gradeAnswer(riverSpot, 'tag', 'call'),
    ])

    expect(summarizeByOpponent(rows)[0].opponent.id).toBe('tag')
  })

  it('keeps the read faced earlier when two cost the same', () => {
    const rows = reviewSession([
      gradeAnswer(riverSpot, 'lag', 'call'),
      gradeAnswer(cbetSpot, 'gto', 'bet66'),
    ])

    expect(summarizeByOpponent(rows).map((row) => row.opponent.id)).toEqual(['lag', 'gto'])
  })

  it('flags the reads that demanded a deviation from the baseline', () => {
    const rows = reviewSession([
      gradeAnswer(cbetSpot, 'fish', 'overbet'),
      gradeAnswer(cbetSpot, 'gto', 'bet66'),
    ])
    const byOpponent = summarizeByOpponent(rows)

    expect(byOpponent.find((row) => row.opponent.id === 'fish')?.testedDeviation).toBe(true)
    expect(byOpponent.find((row) => row.opponent.id === 'gto')?.testedDeviation).toBe(false)
  })

  it('reports a clean run against a read as no EV lost', () => {
    const rows = reviewSession([gradeAnswer(cbetSpot, 'fish', 'overbet')])

    expect(summarizeByOpponent(rows)[0]).toMatchObject({ accuracy: 100, evLost: 0 })
  })
})

describe('buildRetryDrill', () => {
  const key = (hand: { spot: { id: string }; opponentId: string }) =>
    `${hand.spot.id}/${hand.opponentId}`

  it('returns nothing for an empty session', () => {
    expect(buildRetryDrill([])).toEqual([])
  })

  it('returns nothing when every answer was optimal', () => {
    const rows = reviewSession([
      gradeAnswer(cbetSpot, 'fish', 'overbet'),
      gradeAnswer(riverSpot, 'tag', 'fold'),
    ])

    expect(buildRetryDrill(rows)).toEqual([])
  })

  it('deals only the pairings that gave up EV, in the order they were faced', () => {
    const rows = reviewSession([
      gradeAnswer(riverSpot, 'tag', 'call'),
      gradeAnswer(cbetSpot, 'fish', 'overbet'),
      gradeAnswer(cbetSpot, 'lag', 'bet66'),
    ])

    expect(buildRetryDrill(rows).map(key)).toEqual([
      'bb-river-bluffcatch/tag',
      'btn-cbet-tptk/lag',
    ])
  })

  it("includes 'close' answers, not just outright mistakes", () => {
    const rows = reviewSession([gradeAnswer(cbetSpot, 'reg', 'bet66')])

    expect(rows[0].grade.verdict).toBe('close')
    expect(buildRetryDrill(rows).map(key)).toEqual(['btn-cbet-tptk/reg'])
  })

  it('deals a repeated pairing once', () => {
    const rows = reviewSession([
      gradeAnswer(riverSpot, 'tag', 'call'),
      gradeAnswer(riverSpot, 'tag', 'raise'),
    ])

    expect(buildRetryDrill(rows).map(key)).toEqual(['bb-river-bluffcatch/tag'])
  })

  it('only deals pairings the trainer can grade', () => {
    const rows = reviewSession([
      gradeAnswer(riverSpot, 'tag', 'call'),
      gradeAnswer(cbetSpot, 'lag', 'bet66'),
    ])

    for (const hand of buildRetryDrill(rows)) {
      expect(spots).toContain(hand.spot)
      expect(() => gradeAnswer(hand.spot, hand.opponentId, hand.spot.actions[0].id)).not.toThrow()
    }
  })

  it('carries the read that beat you, so the retry poses the same question', () => {
    const [hand] = buildRetryDrill(reviewSession([gradeAnswer(riverSpot, 'tag', 'call')]))

    expect(hand.opponentId).toBe('tag')
    expect(getRecommendation(hand.spot, hand.opponentId).exploitBestActionId).toBe('fold')
  })

  it('empties out once the retried hands are played correctly', () => {
    const retry = buildRetryDrill(reviewSession([gradeAnswer(riverSpot, 'tag', 'call')]))
    const replayed = reviewSession(
      retry.map((hand) =>
        gradeAnswer(
          hand.spot,
          hand.opponentId,
          getRecommendation(hand.spot, hand.opponentId).exploitBestActionId,
        ),
      ),
    )

    expect(buildRetryDrill(replayed)).toEqual([])
  })

  it('can also be dealt from a drill that was played badly', () => {
    const drill = buildDrill(2026)
    const rows = reviewSession(
      drill.map((hand) => gradeAnswer(hand.spot, hand.opponentId, hand.spot.actions[0].id)),
    )
    const retry = buildRetryDrill(rows)

    expect(retry.length).toBeGreaterThan(0)
    expect(retry.length).toBeLessThanOrEqual(DRILL_LENGTH)
    expect(new Set(retry.map(key)).size).toBe(retry.length)
  })
})

describe('summarizeLeakProgress', () => {
  const key = (row: { spot: { id: string }; grade: { opponentId: string } }) =>
    `${row.spot.id}/${row.grade.opponentId}`

  it('reports nothing for an empty history', () => {
    expect(summarizeLeakProgress([])).toEqual({ open: [], closed: 0 })
  })

  it('counts a pairing that gave up EV as open', () => {
    const progress = summarizeLeakProgress(reviewSession([gradeAnswer(riverSpot, 'tag', 'call')]))

    expect(progress.open.map(key)).toEqual(['bb-river-bluffcatch/tag'])
    expect(progress.closed).toBe(0)
  })

  it('closes a pairing once the latest attempt is optimal', () => {
    const progress = summarizeLeakProgress(
      reviewSession([gradeAnswer(riverSpot, 'tag', 'call'), gradeAnswer(riverSpot, 'tag', 'fold')]),
    )

    expect(progress.open).toEqual([])
    expect(progress.closed).toBe(1)
  })

  it('reopens a pairing that was once right and is now wrong', () => {
    const progress = summarizeLeakProgress(
      reviewSession([gradeAnswer(riverSpot, 'tag', 'fold'), gradeAnswer(riverSpot, 'tag', 'call')]),
    )

    expect(progress.open.map(key)).toEqual(['bb-river-bluffcatch/tag'])
    expect(progress.closed).toBe(0)
  })

  it('does not count a pairing played right from the start as closed', () => {
    const progress = summarizeLeakProgress(reviewSession([gradeAnswer(riverSpot, 'tag', 'fold')]))

    expect(progress).toEqual({ open: [], closed: 0 })
  })

  it('tracks the same spot against different reads separately', () => {
    const progress = summarizeLeakProgress(
      reviewSession([gradeAnswer(riverSpot, 'tag', 'call'), gradeAnswer(riverSpot, 'lag', 'call')]),
    )

    expect(progress.open.map(key)).toEqual(['bb-river-bluffcatch/tag'])
    expect(progress.closed).toBe(0)
  })

  it('puts the costliest open leak first', () => {
    const progress = summarizeLeakProgress(
      reviewSession([gradeAnswer(cbetSpot, 'reg', 'bet66'), gradeAnswer(riverSpot, 'tag', 'call')]),
    )

    expect(progress.open.map(key)).toEqual([
      'bb-river-bluffcatch/tag',
      'btn-cbet-tptk/reg',
    ])
  })

  it('keeps the pairing faced earlier when two cost the same', () => {
    const progress = summarizeLeakProgress(
      reviewSession([gradeAnswer(cbetSpot, 'reg', 'bet66'), gradeAnswer(riverSpot, 'gto', 'fold')]),
    )

    expect(progress.open[0].grade.evLoss).toBe(progress.open[1].grade.evLoss)
    expect(progress.open.map(key)).toEqual([
      'btn-cbet-tptk/reg',
      'bb-river-bluffcatch/gto',
    ])
  })

  it('counts a close answer as an open leak, matching the retry drill', () => {
    const rows = reviewSession([gradeAnswer(cbetSpot, 'reg', 'bet66')])

    expect(rows[0].grade.verdict).toBe('close')
    expect(summarizeLeakProgress(rows).open.map(key)).toEqual(['btn-cbet-tptk/reg'])
  })

  it('hands its open leaks to buildRetryDrill unchanged', () => {
    const rows = reviewSession([
      gradeAnswer(riverSpot, 'tag', 'call'),
      gradeAnswer(cbetSpot, 'reg', 'bet66'),
      gradeAnswer(cbetSpot, 'fish', 'overbet'),
    ])
    const hands = buildRetryDrill(summarizeLeakProgress(rows).open)

    expect(hands.map((hand) => `${hand.spot.id}/${hand.opponentId}`)).toEqual([
      'bb-river-bluffcatch/tag',
      'btn-cbet-tptk/reg',
    ])
  })
})
