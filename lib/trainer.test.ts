import { describe, expect, it } from 'vitest'
import { opponentProfiles, spots, streets } from './spots'
import {
  buildConfirmDrill,
  buildCoverage,
  buildCoverageDrill,
  buildRefreshDrill,
  buildRetryDrill,
  buildTendencyDrill,
  CLOSE_ENOUGH_BB,
  DRILL_LENGTH,
  drillFocuses,
  findBiggestLeak,
  getOpponentProfile,
  getRecommendation,
  getSpot,
  gradeAnswer,
  MASTERY_FRESH_CAP_DAYS,
  MASTERY_FRESH_DAYS,
  masteryFreshDays,
  MASTERY_REPS,
  missDirection,
  reviewSession,
  summarizeByOpponent,
  summarizeCoverage,
  summarizeLeakProgress,
  summarizeSession,
  summarizeStreets,
  summarizeTendency,
} from './trainer'

const cbetSpot = getSpot('btn-cbet-tptk')!
const riverSpot = getSpot('bb-river-bluffcatch')!

/** Every pairing the authored spots offer, which is what the grid covers. */
const allPairings = spots.flatMap((spot) =>
  opponentProfiles.map((profile) => ({ spot, opponentId: profile.id })),
)

const pairingKey = (hand: { spot: { id: string }; opponentId: string }) =>
  `${hand.spot.id}/${hand.opponentId}`

/** Grades a pairing with the highest-EV line, so it comes back proven. */
function gradeOptimally(pairing: (typeof allPairings)[number]) {
  const { exploitBestActionId } = getRecommendation(pairing.spot, pairing.opponentId)

  return gradeAnswer(pairing.spot, pairing.opponentId, exploitBestActionId)
}

/**
 * Grades a pairing optimally `MASTERY_REPS` times, so it comes back proven
 * rather than merely clean on its latest attempt.
 */
function proveFully(pairing: (typeof allPairings)[number]) {
  return Array.from({ length: MASTERY_REPS }, () => gradeOptimally(pairing))
}

const DAY_MS = 24 * 60 * 60 * 1000

/** A fixed "now" so a dated test never depends on the wall clock. */
const NOW = 1_700_000_000_000

/** Reviews grades as if they had been answered `daysAgo` days before `NOW`. */
function rowsAnsweredDaysAgo(grades: ReturnType<typeof gradeOptimally>[], daysAgo: number) {
  return reviewSession(grades, NOW - daysAgo * DAY_MS)
}

/** Grades a pairing with its worst line, so it comes back as an open leak. */
function gradeBadly(pairing: (typeof allPairings)[number]) {
  const worst = getRecommendation(pairing.spot, pairing.opponentId).rows.reduce((low, row) =>
    row.adjustedEv < low.adjustedEv ? row : low,
  )

  return gradeAnswer(pairing.spot, pairing.opponentId, worst.action.id)
}

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

  it('uses a unique id per spot', () => {
    const ids = spots.map((spot) => spot.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers every street a drill can be focused on', () => {
    for (const street of streets) {
      expect(
        spots.some((spot) => spot.street === street),
        `no authored spot on the ${street}`,
      ).toBe(true)
    }
  })

  it('is authored in street order, so the grid reads like a hand', () => {
    const played = spots.map((spot) => streets.indexOf(spot.street))

    expect(played).toEqual([...played].sort((a, b) => a - b))
  })

  it.each(spots)('$id has at least one read that overrides the baseline', (spot) => {
    const deviations = opponentProfiles.filter(
      (profile) => getRecommendation(spot, profile.id).isDeviation,
    )

    // A spot where every read agrees with the baseline teaches nothing about
    // exploitative play, which is the whole point of the trainer.
    expect(deviations.length).toBeGreaterThan(0)
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

describe('buildCoverageDrill', () => {
  const blankGrid = buildCoverage([])
  const deal = (seed: number) => buildCoverageDrill(blankGrid, seed)

  it('deals the advertised number of hands', () => {
    expect(deal(1)).toHaveLength(DRILL_LENGTH)
  })

  it('is reproducible from its seed', () => {
    expect(deal(42).map(pairingKey)).toEqual(deal(42).map(pairingKey))
  })

  it('deals a different order for a different seed', () => {
    const seeds = [1, 2, 3, 4, 5, 6, 7, 8].map((seed) => deal(seed).map(pairingKey).join(','))

    expect(new Set(seeds).size).toBeGreaterThan(1)
  })

  it('never deals the same spot/opponent pairing twice in one drill', () => {
    for (const seed of [0, 7, 99, 1234, 987654321]) {
      const pairings = deal(seed).map(pairingKey)

      expect(new Set(pairings).size, `seed ${seed} repeated a pairing`).toBe(pairings.length)
    }
  })

  it('only deals pairings the trainer can grade', () => {
    for (const hand of deal(2026)) {
      expect(spots).toContain(hand.spot)
      expect(() => gradeAnswer(hand.spot, hand.opponentId, hand.spot.actions[0].id)).not.toThrow()
    }
  })

  it('deals the pairings a visitor has never seen before any they have proven', () => {
    const unseen = allPairings.slice(0, 2)
    const played = allPairings.slice(2)
    const coverage = buildCoverage(reviewSession(played.flatMap(proveFully)))

    for (const seed of [3, 17, 2026]) {
      const dealt = buildCoverageDrill(coverage, seed).map(pairingKey)

      expect(dealt.slice(0, unseen.length).sort(), `seed ${seed} skipped an unseen pairing`).toEqual(
        unseen.map(pairingKey).sort(),
      )
    }
  })

  it('deals a still-open leak before a pairing already proven', () => {
    const [leaked, ...proven] = allPairings
    const grades = [gradeBadly(leaked), ...proven.flatMap(proveFully)]
    const coverage = buildCoverage(reviewSession(grades))

    expect(summarizeCoverage(coverage).untested).toBe(0)

    for (const seed of [5, 23, 404]) {
      expect(buildCoverageDrill(coverage, seed).map(pairingKey)[0]).toBe(pairingKey(leaked))
    }
  })

  it('falls back to the whole grid once every pairing is proven', () => {
    const coverage = buildCoverage(reviewSession(allPairings.flatMap(proveFully)))
    const dealt = buildCoverageDrill(coverage, 11)

    expect(summarizeCoverage(coverage).mastered).toBe(allPairings.length)
    expect(dealt).toHaveLength(DRILL_LENGTH)
    expect(new Set(dealt.map(pairingKey)).size).toBe(dealt.length)
  })

  it('deals a pairing nailed once ahead of one already proven twice', () => {
    const [unconfirmed, ...proven] = allPairings
    const grades = [gradeOptimally(unconfirmed), ...proven.flatMap(proveFully)]
    const coverage = buildCoverage(reviewSession(grades))

    expect(summarizeCoverage(coverage)).toMatchObject({ untested: 0, open: 0, learning: 1 })

    for (const seed of [6, 31, 777]) {
      expect(
        buildCoverageDrill(coverage, seed).map(pairingKey)[0],
        `seed ${seed} skipped the unconfirmed pairing`,
      ).toBe(pairingKey(unconfirmed))
    }
  })
})

describe('buildCoverageDrill with a street focus', () => {
  const blankGrid = buildCoverage([])

  it('defaults to the whole grid, matching an explicit "all"', () => {
    expect(buildCoverageDrill(blankGrid, 42).map(pairingKey)).toEqual(
      buildCoverageDrill(blankGrid, 42, 'all').map(pairingKey),
    )
  })

  it.each(streets)('only deals %s spots when focused on %s', (street) => {
    for (const seed of [1, 88, 2026]) {
      const dealt = buildCoverageDrill(blankGrid, seed, street)

      expect(dealt.length, `${street} dealt nothing on seed ${seed}`).toBeGreaterThan(0)

      for (const hand of dealt) {
        expect(hand.spot.street).toBe(street)
      }
    }
  })

  it('deals a short drill rather than padding a street that cannot fill one', () => {
    for (const street of streets) {
      const available = blankGrid.filter((cell) => cell.spot.street === street).length
      const dealt = buildCoverageDrill(blankGrid, 7, street)

      expect(dealt).toHaveLength(Math.min(DRILL_LENGTH, available))
    }
  })

  it('still puts the unseen pairings of that street first', () => {
    const street = streets[0]
    const onStreet = allPairings.filter((pairing) => pairing.spot.street === street)
    const [unseen, ...played] = onStreet
    const coverage = buildCoverage(reviewSession(played.flatMap(proveFully)))

    for (const seed of [4, 61, 909]) {
      expect(buildCoverageDrill(coverage, seed, street).map(pairingKey)[0]).toBe(
        pairingKey(unseen),
      )
    }
  })

  it('still puts an open leak on that street ahead of a proven pairing', () => {
    const street = streets[streets.length - 1]
    const onStreet = allPairings.filter((pairing) => pairing.spot.street === street)
    const [leaked, ...rest] = onStreet
    const elsewhere = allPairings.filter((pairing) => pairing.spot.street !== street)
    const grades = [
      gradeBadly(leaked),
      ...rest.flatMap(proveFully),
      ...elsewhere.flatMap(proveFully),
    ]
    const coverage = buildCoverage(reviewSession(grades))

    expect(summarizeCoverage(coverage).untested).toBe(0)
    expect(buildCoverageDrill(coverage, 3, street).map(pairingKey)[0]).toBe(pairingKey(leaked))
  })

  it('is reproducible from its seed', () => {
    const street = streets[1]

    expect(buildCoverageDrill(blankGrid, 17, street).map(pairingKey)).toEqual(
      buildCoverageDrill(blankGrid, 17, street).map(pairingKey),
    )
  })

  it('deals nothing from an empty grid rather than throwing', () => {
    expect(buildCoverageDrill([], 1, 'Turn')).toEqual([])
  })
})

describe('summarizeStreets', () => {
  const blankGrid = buildCoverage([])

  it('reports nothing for an empty grid', () => {
    expect(summarizeStreets([])).toEqual([])
  })

  it('walks the streets in the order a hand is played', () => {
    expect(summarizeStreets(blankGrid).map((progress) => progress.street)).toEqual(
      streets.filter((street) => spots.some((spot) => spot.street === street)),
    )
  })

  it('splits the grid without losing or double-counting a pairing', () => {
    const totals = summarizeStreets(blankGrid).reduce(
      (sum, progress) => sum + progress.total,
      0,
    )

    expect(totals).toBe(blankGrid.length)
  })

  it('reports an unplayed street as entirely untested', () => {
    for (const progress of summarizeStreets(blankGrid)) {
      expect(progress).toMatchObject({
        untested: progress.total,
        mastered: 0,
        learning: 0,
        open: 0,
        percentMastered: 0,
      })
    }
  })

  it('counts a mastered pairing against its own street only', () => {
    const pairing = allPairings[0]
    const coverage = buildCoverage(reviewSession(proveFully(pairing)))
    const progress = summarizeStreets(coverage)
    const played = progress.find((entry) => entry.street === pairing.spot.street)!

    expect(played.mastered).toBe(1)
    expect(progress.filter((entry) => entry.mastered > 0)).toEqual([played])
  })

  it('counts a single clean rep on its street as learning, not proven', () => {
    const pairing = allPairings[0]
    const coverage = buildCoverage(reviewSession([gradeOptimally(pairing)]))
    const progress = summarizeStreets(coverage)
    const played = progress.find((entry) => entry.street === pairing.spot.street)!

    expect(played).toMatchObject({ learning: 1, mastered: 0, open: 0 })
    expect(progress.filter((entry) => entry.learning > 0)).toEqual([played])
  })

  it('counts a pairing that gave up EV as open on its street', () => {
    const pairing = allPairings[0]
    const coverage = buildCoverage(reviewSession([gradeBadly(pairing)]))
    const played = summarizeStreets(coverage).find(
      (entry) => entry.street === pairing.spot.street,
    )!

    expect(played).toMatchObject({
      open: 1,
      mastered: 0,
      learning: 0,
      untested: played.total - 1,
    })
  })

  it('reaches 100 percent once every pairing on a street is proven', () => {
    const street = streets[0]
    const onStreet = allPairings.filter((pairing) => pairing.spot.street === street)
    const coverage = buildCoverage(reviewSession(onStreet.flatMap(proveFully)))
    const played = summarizeStreets(coverage).find((entry) => entry.street === street)!

    expect(played).toMatchObject({
      mastered: played.total,
      learning: 0,
      untested: 0,
      percentMastered: 100,
    })
  })

  it('agrees with the whole-grid summary once every street is added up', () => {
    const coverage = buildCoverage(
      reviewSession([
        gradeBadly(allPairings[0]),
        gradeOptimally(allPairings[1]),
        ...proveFully(allPairings[2]),
      ]),
    )
    const progress = summarizeStreets(coverage)
    const stats = summarizeCoverage(coverage)
    const sum = (pick: (entry: (typeof progress)[number]) => number) =>
      progress.reduce((total, entry) => total + pick(entry), 0)

    expect(sum((entry) => entry.mastered)).toBe(stats.mastered)
    expect(sum((entry) => entry.learning)).toBe(stats.learning)
    expect(sum((entry) => entry.open)).toBe(stats.open)
    expect(sum((entry) => entry.untested)).toBe(stats.untested)
  })

  it('offers a focus for every street it reports, and nothing it does not', () => {
    const reported = summarizeStreets(blankGrid).map((progress) => progress.street)

    expect(drillFocuses).toEqual(['all', ...streets])

    for (const street of reported) {
      expect(drillFocuses).toContain(street)
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
    const drill = buildCoverageDrill(buildCoverage([]), 2026)
    const rows = reviewSession(
      drill.map((hand) => gradeAnswer(hand.spot, hand.opponentId, hand.spot.actions[0].id)),
    )
    const retry = buildRetryDrill(rows)

    expect(retry.length).toBeGreaterThan(0)
    expect(retry.length).toBeLessThanOrEqual(DRILL_LENGTH)
    expect(new Set(retry.map(key)).size).toBe(retry.length)
  })
})

describe('masteryFreshDays', () => {
  it('gives an unproven streak no window at all', () => {
    for (let streak = 0; streak < MASTERY_REPS; streak += 1) {
      expect(masteryFreshDays(streak)).toBe(0)
    }
  })

  it('gives a freshly proven pairing the base window', () => {
    expect(masteryFreshDays(MASTERY_REPS)).toBe(MASTERY_FRESH_DAYS)
  })

  it('doubles the window for every clean rep past the proof', () => {
    expect(masteryFreshDays(MASTERY_REPS + 1)).toBe(MASTERY_FRESH_DAYS * 2)
    expect(masteryFreshDays(MASTERY_REPS + 2)).toBe(MASTERY_FRESH_DAYS * 4)
  })

  it('stops doubling at the cap, however long the streak runs', () => {
    expect(masteryFreshDays(MASTERY_REPS + 50)).toBe(MASTERY_FRESH_CAP_DAYS)
  })

  it('never returns a window longer than the cap', () => {
    for (let streak = 0; streak <= 20; streak += 1) {
      expect(masteryFreshDays(streak)).toBeLessThanOrEqual(MASTERY_FRESH_CAP_DAYS)
    }
  })
})

describe('buildCoverage ageing', () => {
  const pairing = allPairings[0]
  /** The proven cell for `pairing`, aged `daysAgo` days against `NOW`. */
  const agedCell = (daysAgo: number, grades = proveFully(pairing)) =>
    buildCoverage(rowsAnsweredDaysAgo(grades, daysAgo), NOW).find(
      (cell) => cell.spot.id === pairing.spot.id && cell.opponent.id === pairing.opponentId,
    )!

  it('leaves a freshly proven pairing proven', () => {
    expect(agedCell(0).status).toBe('mastered')
  })

  it('keeps a pairing proven right up to the last day of its window', () => {
    expect(agedCell(MASTERY_FRESH_DAYS - 1).status).toBe('mastered')
  })

  it('turns a pairing stale the day its window runs out', () => {
    expect(agedCell(MASTERY_FRESH_DAYS).status).toBe('stale')
  })

  it('reports how overdue a stale pairing is', () => {
    const cell = agedCell(MASTERY_FRESH_DAYS + 5)

    expect(cell.daysSinceLastPlayed).toBe(MASTERY_FRESH_DAYS + 5)
    expect(cell.reviewDueInDays).toBe(-5)
  })

  it('reports how long a fresh proof has left', () => {
    expect(agedCell(4).reviewDueInDays).toBe(MASTERY_FRESH_DAYS - 4)
  })

  it('stamps the latest attempt, not the first', () => {
    const rows = [
      ...rowsAnsweredDaysAgo(proveFully(pairing), 90),
      ...rowsAnsweredDaysAgo(proveFully(pairing), 1),
    ]
    const cell = buildCoverage(rows, NOW).find(
      (c) => c.spot.id === pairing.spot.id && c.opponent.id === pairing.opponentId,
    )!

    expect(cell.lastPlayedAt).toBe(NOW - DAY_MS)
    expect(cell.daysSinceLastPlayed).toBe(1)
    expect(cell.status).toBe('mastered')
  })

  it('holds a long streak fresh for longer than a bare proof', () => {
    const longStreak = [...proveFully(pairing), gradeOptimally(pairing)]

    expect(agedCell(MASTERY_FRESH_DAYS + 1).status).toBe('stale')
    expect(agedCell(MASTERY_FRESH_DAYS + 1, longStreak).status).toBe('mastered')
  })

  it('ages nothing without a clock, so a live session never goes stale', () => {
    const rows = rowsAnsweredDaysAgo(proveFully(pairing), 10_000)
    const cell = buildCoverage(rows).find(
      (c) => c.spot.id === pairing.spot.id && c.opponent.id === pairing.opponentId,
    )!

    expect(cell.status).toBe('mastered')
    expect(cell.daysSinceLastPlayed).toBeNull()
    expect(cell.reviewDueInDays).toBeNull()
  })

  it('ages nothing for undated rows, so an old history keeps its mastery', () => {
    const cell = buildCoverage(reviewSession(proveFully(pairing)), NOW).find(
      (c) => c.spot.id === pairing.spot.id && c.opponent.id === pairing.opponentId,
    )!

    expect(cell.lastPlayedAt).toBeNull()
    expect(cell.status).toBe('mastered')
    expect(cell.reviewDueInDays).toBeNull()
  })

  it('leaves a pairing proven right once as learning rather than ageing it', () => {
    const cell = agedCell(10_000, [gradeOptimally(pairing)])

    expect(cell.status).toBe('learning')
    expect(cell.reviewDueInDays).toBeNull()
  })

  it('leaves an open leak open rather than ageing it into a review', () => {
    const cell = agedCell(10_000, [gradeBadly(pairing)])

    expect(cell.status).toBe('open')
    expect(cell.reviewDueInDays).toBeNull()
  })

  it('never reports negative days for a session stamped ahead of the clock', () => {
    const cell = agedCell(-3)

    expect(cell.daysSinceLastPlayed).toBe(0)
    expect(cell.reviewDueInDays).toBe(MASTERY_FRESH_DAYS)
    expect(cell.status).toBe('mastered')
  })

  it('dates an untested pairing as never played', () => {
    const cell = buildCoverage([], NOW)[0]

    expect(cell.status).toBe('untested')
    expect(cell.lastPlayedAt).toBeNull()
    expect(cell.daysSinceLastPlayed).toBeNull()
  })

  it('counts a stale pairing as played, because it was', () => {
    const rows = rowsAnsweredDaysAgo(proveFully(pairing), MASTERY_FRESH_DAYS + 1)
    const stats = summarizeCoverage(buildCoverage(rows, NOW))

    expect(stats.stale).toBe(1)
    expect(stats.played).toBe(1)
    expect(stats.mastered).toBe(0)
  })

  it('drops a stale pairing out of the proven percentage', () => {
    const grades = allPairings.flatMap(proveFully)
    const fresh = summarizeCoverage(buildCoverage(rowsAnsweredDaysAgo(grades, 0), NOW))
    const cold = summarizeCoverage(
      buildCoverage(rowsAnsweredDaysAgo(grades, MASTERY_FRESH_DAYS), NOW),
    )

    expect(fresh.percentMastered).toBe(100)
    expect(cold.percentMastered).toBe(0)
    expect(cold.stale).toBe(allPairings.length)
  })

  it('splits what is due by street', () => {
    const rows = rowsAnsweredDaysAgo(allPairings.flatMap(proveFully), MASTERY_FRESH_DAYS)

    for (const progress of summarizeStreets(buildCoverage(rows, NOW))) {
      expect(progress.stale).toBe(progress.total)
      expect(progress.mastered).toBe(0)
    }
  })
})

describe('buildRefreshDrill', () => {
  const pairing = allPairings[0]

  it('deals nothing from an unplayed grid', () => {
    expect(buildRefreshDrill(buildCoverage([], NOW))).toEqual([])
  })

  it('deals nothing from an empty grid rather than throwing', () => {
    expect(buildRefreshDrill([])).toEqual([])
  })

  it('deals nothing while every proof is still fresh', () => {
    const rows = rowsAnsweredDaysAgo(allPairings.flatMap(proveFully), 0)

    expect(buildRefreshDrill(buildCoverage(rows, NOW))).toEqual([])
  })

  it('deals a pairing once its proof has expired', () => {
    const rows = rowsAnsweredDaysAgo(proveFully(pairing), MASTERY_FRESH_DAYS)

    expect(buildRefreshDrill(buildCoverage(rows, NOW)).map(pairingKey)).toEqual([
      pairingKey(pairing),
    ])
  })

  it('deals the most faded pairing first', () => {
    const [recent, older, oldest] = allPairings
    const rows = [
      ...rowsAnsweredDaysAgo(proveFully(recent), MASTERY_FRESH_DAYS + 1),
      ...rowsAnsweredDaysAgo(proveFully(older), MASTERY_FRESH_DAYS + 10),
      ...rowsAnsweredDaysAgo(proveFully(oldest), MASTERY_FRESH_DAYS + 40),
    ]

    expect(buildRefreshDrill(buildCoverage(rows, NOW)).map(pairingKey)).toEqual([
      pairingKey(oldest),
      pairingKey(older),
      pairingKey(recent),
    ])
  })

  it('falls back to authored order for pairings equally overdue', () => {
    const rows = rowsAnsweredDaysAgo(allPairings.flatMap(proveFully), MASTERY_FRESH_DAYS)

    expect(buildRefreshDrill(buildCoverage(rows, NOW)).map(pairingKey)).toEqual(
      allPairings.map(pairingKey),
    )
  })

  it('leaves out an open leak, which is the retry drill\'s job', () => {
    const rows = rowsAnsweredDaysAgo([gradeBadly(pairing)], 10_000)

    expect(buildRefreshDrill(buildCoverage(rows, NOW))).toEqual([])
    expect(buildRetryDrill(rows).map(pairingKey)).toEqual([pairingKey(pairing)])
  })

  it('leaves out a pairing proven only once, which is the confirm run\'s job', () => {
    const rows = rowsAnsweredDaysAgo([gradeOptimally(pairing)], 10_000)
    const coverage = buildCoverage(rows, NOW)

    expect(buildRefreshDrill(coverage)).toEqual([])
    expect(buildConfirmDrill(coverage).map(pairingKey)).toEqual([pairingKey(pairing)])
  })

  it('narrows to one street when focused', () => {
    const rows = rowsAnsweredDaysAgo(allPairings.flatMap(proveFully), MASTERY_FRESH_DAYS)
    const onStreet = allPairings.filter((candidate) => candidate.spot.street === 'River')

    expect(buildRefreshDrill(buildCoverage(rows, NOW), 'River').map(pairingKey)).toEqual(
      onStreet.map(pairingKey),
    )
  })

  it('never deals the same pairing twice', () => {
    const rows = rowsAnsweredDaysAgo(allPairings.flatMap(proveFully), MASTERY_FRESH_DAYS)
    const keys = buildRefreshDrill(buildCoverage(rows, NOW)).map(pairingKey)

    expect(keys).toHaveLength(allPairings.length)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('only deals pairings the trainer can grade', () => {
    const rows = rowsAnsweredDaysAgo(allPairings.flatMap(proveFully), MASTERY_FRESH_DAYS)

    for (const hand of buildRefreshDrill(buildCoverage(rows, NOW))) {
      expect(spots).toContain(hand.spot)
      expect(() => gradeAnswer(hand.spot, hand.opponentId, hand.spot.actions[0].id)).not.toThrow()
    }
  })

  it('agrees with the coverage summary about how many are due', () => {
    const rows = [
      ...rowsAnsweredDaysAgo(proveFully(allPairings[0]), MASTERY_FRESH_DAYS + 3),
      ...rowsAnsweredDaysAgo(proveFully(allPairings[1]), 1),
      ...rowsAnsweredDaysAgo([gradeBadly(allPairings[2])], 60),
    ]
    const coverage = buildCoverage(rows, NOW)

    expect(buildRefreshDrill(coverage)).toHaveLength(summarizeCoverage(coverage).stale)
  })

  it('empties out once what it dealt is proven again', () => {
    const first = rowsAnsweredDaysAgo(proveFully(pairing), MASTERY_FRESH_DAYS + 1)
    const due = buildRefreshDrill(buildCoverage(first, NOW))

    expect(due).toHaveLength(1)

    const again = rowsAnsweredDaysAgo(
      due.map((hand) => gradeOptimally({ spot: hand.spot, opponentId: hand.opponentId })),
      0,
    )

    expect(buildRefreshDrill(buildCoverage([...first, ...again], NOW))).toEqual([])
  })
})

describe('buildCoverageDrill ageing', () => {
  it('deals what is due ahead of a pairing proven right once', () => {
    const [stale, learning] = allPairings
    const rows = [
      ...rowsAnsweredDaysAgo(proveFully(stale), MASTERY_FRESH_DAYS + 1),
      ...rowsAnsweredDaysAgo([gradeOptimally(learning)], 0),
      // Everything else proven today, so only these two are ahead of the pack.
      ...rowsAnsweredDaysAgo(allPairings.slice(2).flatMap(proveFully), 0),
    ]
    const dealt = buildCoverageDrill(buildCoverage(rows, NOW), 1).map(pairingKey)

    expect(dealt).toContain(pairingKey(stale))
    expect(dealt).toContain(pairingKey(learning))
    expect(dealt.indexOf(pairingKey(stale))).toBeLessThan(dealt.indexOf(pairingKey(learning)))
  })

  it('deals an open leak ahead of what is merely due', () => {
    const [stale, open] = allPairings
    const rows = [
      ...rowsAnsweredDaysAgo(proveFully(stale), MASTERY_FRESH_DAYS + 1),
      ...rowsAnsweredDaysAgo([gradeBadly(open)], 0),
      ...rowsAnsweredDaysAgo(allPairings.slice(2).flatMap(proveFully), 0),
    ]
    const dealt = buildCoverageDrill(buildCoverage(rows, NOW), 1).map(pairingKey)

    expect(dealt).toContain(pairingKey(open))
    expect(dealt).toContain(pairingKey(stale))
    expect(dealt.indexOf(pairingKey(open))).toBeLessThan(dealt.indexOf(pairingKey(stale)))
  })

  it('deals what is due ahead of what is still proven', () => {
    const grades = allPairings.flatMap(proveFully)
    const rows = [
      ...rowsAnsweredDaysAgo(grades.slice(0, 2), MASTERY_FRESH_DAYS + 1),
      ...rowsAnsweredDaysAgo(grades.slice(2), 0),
    ]
    const coverage = buildCoverage(rows, NOW)
    const stale = new Set(
      coverage.filter((cell) => cell.status === 'stale').map((cell) => pairingKey({ spot: cell.spot, opponentId: cell.opponent.id })),
    )
    const dealt = buildCoverageDrill(coverage, 7).map(pairingKey)

    expect(stale.size).toBeGreaterThan(0)
    for (const key of stale) {
      expect(dealt).toContain(key)
    }
  })
})

describe('buildConfirmDrill', () => {
  const dealt = (grades: ReturnType<typeof gradeOptimally>[], focus?: 'Preflop' | 'River') =>
    buildConfirmDrill(buildCoverage(reviewSession(grades)), focus).map(pairingKey)

  it('deals nothing from an unplayed grid', () => {
    expect(buildConfirmDrill(buildCoverage([]))).toEqual([])
  })

  it('deals nothing from an empty grid rather than throwing', () => {
    expect(buildConfirmDrill([])).toEqual([])
  })

  it('deals the pairings nailed exactly once', () => {
    const [once, ...rest] = allPairings

    expect(dealt([gradeOptimally(once), ...rest.flatMap(proveFully)])).toEqual([pairingKey(once)])
  })

  it('leaves out a pairing that has since been proven', () => {
    expect(dealt(proveFully(allPairings[0]))).toEqual([])
  })

  it('leaves out an open leak, which is the retry drill\'s job', () => {
    const rows = reviewSession([gradeBadly(allPairings[0])])

    expect(buildConfirmDrill(buildCoverage(rows))).toEqual([])
    expect(buildRetryDrill(rows).map(pairingKey)).toEqual([pairingKey(allPairings[0])])
  })

  it('deals a leak replayed right once, because one clean rep does not prove it', () => {
    const pairing = allPairings[0]

    expect(dealt([gradeBadly(pairing), gradeOptimally(pairing)])).toEqual([pairingKey(pairing)])
  })

  it('deals in authored grid order, so a confirm run reads like a hand', () => {
    const picked = [allPairings[allPairings.length - 1], allPairings[0]]

    expect(dealt(picked.map(gradeOptimally))).toEqual(
      allPairings.filter((pairing) => picked.includes(pairing)).map(pairingKey),
    )
  })

  it('never deals the same pairing twice', () => {
    const keys = dealt(allPairings.map(gradeOptimally))

    expect(keys).toHaveLength(allPairings.length)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('narrows to one street when focused', () => {
    const keys = dealt(allPairings.map(gradeOptimally), 'River')
    const onStreet = allPairings.filter((pairing) => pairing.spot.street === 'River')

    expect(keys).toEqual(onStreet.map(pairingKey))
  })

  it('only deals pairings the trainer can grade', () => {
    for (const hand of buildConfirmDrill(
      buildCoverage(reviewSession(allPairings.map(gradeOptimally))),
    )) {
      expect(spots).toContain(hand.spot)
      expect(() => gradeAnswer(hand.spot, hand.opponentId, hand.spot.actions[0].id)).not.toThrow()
    }
  })

  it('empties out once every pairing it dealt is answered right again', () => {
    const first = allPairings.map(gradeOptimally)
    const confirmed = buildConfirmDrill(buildCoverage(reviewSession(first)))

    expect(confirmed).toHaveLength(allPairings.length)

    const second = confirmed.map((hand) =>
      gradeOptimally({ spot: hand.spot, opponentId: hand.opponentId }),
    )

    expect(buildConfirmDrill(buildCoverage(reviewSession([...first, ...second])))).toEqual([])
  })

  it('agrees with the coverage summary about how many are unconfirmed', () => {
    const grades = [
      gradeOptimally(allPairings[0]),
      gradeBadly(allPairings[1]),
      ...proveFully(allPairings[2]),
    ]
    const coverage = buildCoverage(reviewSession(grades))

    expect(buildConfirmDrill(coverage)).toHaveLength(summarizeCoverage(coverage).learning)
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

describe('buildCoverage', () => {
  const cellKey = (cell: { spot: { id: string }; opponent: { id: string } }) =>
    `${cell.spot.id}/${cell.opponent.id}`
  const find = (coverage: ReturnType<typeof buildCoverage>, key: string) =>
    coverage.find((cell) => cellKey(cell) === key)!

  it('covers every spot/read pairing exactly once', () => {
    const coverage = buildCoverage([])

    expect(coverage).toHaveLength(spots.length * opponentProfiles.length)
    expect(new Set(coverage.map(cellKey)).size).toBe(coverage.length)
  })

  it('walks the grid in authored order, spot by spot', () => {
    expect(buildCoverage([]).map(cellKey)).toEqual(allPairings.map(pairingKey))
  })

  it('reports an unplayed history as entirely untested', () => {
    const coverage = buildCoverage([])

    expect(coverage.every((cell) => cell.status === 'untested')).toBe(true)
    expect(coverage.every((cell) => cell.attempts === 0 && cell.evLost === 0)).toBe(true)
    expect(coverage.every((cell) => cell.streak === 0)).toBe(true)
    expect(coverage.every((cell) => cell.repsToMastery === MASTERY_REPS)).toBe(true)
  })

  it('marks a pairing played optimally once as learning, not yet proven', () => {
    const rows = reviewSession([gradeAnswer(cbetSpot, 'fish', 'overbet')])
    const cell = find(buildCoverage(rows), 'btn-cbet-tptk/fish')

    expect(cell).toMatchObject({
      status: 'learning',
      attempts: 1,
      evLost: 0,
      streak: 1,
      repsToMastery: 1,
    })
  })

  it('masters a pairing once the same line is found MASTERY_REPS times running', () => {
    const rows = reviewSession(
      Array.from({ length: MASTERY_REPS }, () => gradeAnswer(cbetSpot, 'fish', 'overbet')),
    )
    const cell = find(buildCoverage(rows), 'btn-cbet-tptk/fish')

    expect(cell).toMatchObject({
      status: 'mastered',
      attempts: MASTERY_REPS,
      streak: MASTERY_REPS,
      repsToMastery: 0,
    })
  })

  it('keeps counting clean reps past mastery rather than capping the streak', () => {
    const rows = reviewSession(
      Array.from({ length: MASTERY_REPS + 2 }, () => gradeAnswer(cbetSpot, 'fish', 'overbet')),
    )
    const cell = find(buildCoverage(rows), 'btn-cbet-tptk/fish')

    expect(cell).toMatchObject({ status: 'mastered', streak: MASTERY_REPS + 2, repsToMastery: 0 })
  })

  it('marks a pairing that gave up EV as open, carrying what it cost', () => {
    const rows = reviewSession([gradeAnswer(riverSpot, 'tag', 'call')])
    const cell = find(buildCoverage(rows), 'bb-river-bluffcatch/tag')

    expect(cell.status).toBe('open')
    expect(cell.evLost).toBeCloseTo(rows[0].grade.evLoss)
  })

  it('counts a close answer as open, matching the leak progress', () => {
    const rows = reviewSession([gradeAnswer(cbetSpot, 'reg', 'bet66')])

    expect(rows[0].grade.verdict).toBe('close')
    expect(find(buildCoverage(rows), 'btn-cbet-tptk/reg').status).toBe('open')
  })

  it('closes a leak on the first clean replay, but does not yet prove it', () => {
    const rows = reviewSession([
      gradeAnswer(riverSpot, 'tag', 'call'),
      gradeAnswer(riverSpot, 'tag', 'fold'),
    ])
    const cell = find(buildCoverage(rows), 'bb-river-bluffcatch/tag')

    expect(cell).toMatchObject({ status: 'learning', attempts: 2, streak: 1, evLost: 0 })
    expect(summarizeLeakProgress(rows).open).toEqual([])
  })

  it('reopens a pairing that was proven and is now missed', () => {
    const rows = reviewSession([
      gradeAnswer(riverSpot, 'tag', 'fold'),
      gradeAnswer(riverSpot, 'tag', 'fold'),
      gradeAnswer(riverSpot, 'tag', 'call'),
    ])
    const cell = find(buildCoverage(rows), 'bb-river-bluffcatch/tag')

    expect(cell).toMatchObject({ status: 'open', streak: 0, repsToMastery: MASTERY_REPS })
  })

  it('makes a reopened pairing earn its reps again from scratch', () => {
    const rows = reviewSession([
      gradeAnswer(riverSpot, 'tag', 'fold'),
      gradeAnswer(riverSpot, 'tag', 'fold'),
      gradeAnswer(riverSpot, 'tag', 'call'),
      gradeAnswer(riverSpot, 'tag', 'fold'),
    ])

    expect(find(buildCoverage(rows), 'bb-river-bluffcatch/tag').status).toBe('learning')
  })

  it("resets the streak on a 'close' answer, not just an outright mistake", () => {
    const rows = reviewSession([
      gradeAnswer(cbetSpot, 'reg', 'bet33'),
      gradeAnswer(cbetSpot, 'reg', 'bet66'),
    ])

    expect(rows[0].grade.verdict).toBe('optimal')
    expect(rows[1].grade.verdict).toBe('close')
    expect(find(buildCoverage(rows), 'btn-cbet-tptk/reg')).toMatchObject({
      status: 'open',
      streak: 0,
    })
  })

  it('tracks the same spot against different reads separately', () => {
    const rows = reviewSession([
      gradeAnswer(riverSpot, 'tag', 'call'),
      gradeAnswer(riverSpot, 'lag', 'call'),
    ])
    const coverage = buildCoverage(rows)

    expect(find(coverage, 'bb-river-bluffcatch/tag').status).toBe('open')
    expect(find(coverage, 'bb-river-bluffcatch/lag').status).toBe('learning')
    expect(find(coverage, 'bb-river-bluffcatch/fish').status).toBe('untested')
  })

  it('flags the pairings where the read overrides the baseline', () => {
    for (const cell of buildCoverage([])) {
      expect(cell.isDeviation).toBe(getRecommendation(cell.spot, cell.opponent.id).isDeviation)
    }
  })

  it('agrees with summarizeLeakProgress about what is still open', () => {
    const rows = reviewSession([
      gradeAnswer(riverSpot, 'tag', 'call'),
      gradeAnswer(cbetSpot, 'reg', 'bet66'),
      gradeAnswer(cbetSpot, 'fish', 'overbet'),
    ])
    const open = buildCoverage(rows)
      .filter((cell) => cell.status === 'open')
      .map(cellKey)

    expect(open.sort()).toEqual(
      summarizeLeakProgress(rows)
        .open.map((row) => `${row.spot.id}/${row.grade.opponentId}`)
        .sort(),
    )
  })
})

describe('summarizeCoverage', () => {
  it('reports zeroes for an empty grid', () => {
    expect(summarizeCoverage([])).toEqual({
      total: 0,
      played: 0,
      mastered: 0,
      learning: 0,
      open: 0,
      untested: 0,
      stale: 0,
      percentMastered: 0,
    })
  })

  it('reports an unplayed grid as fully untested', () => {
    const summary = summarizeCoverage(buildCoverage([]))

    expect(summary).toMatchObject({
      total: allPairings.length,
      played: 0,
      mastered: 0,
      learning: 0,
      open: 0,
      untested: allPairings.length,
      percentMastered: 0,
    })
  })

  it('counts a played grid by status, with played excluding the gaps', () => {
    const rows = reviewSession([
      gradeAnswer(riverSpot, 'tag', 'call'),
      gradeAnswer(cbetSpot, 'fish', 'overbet'),
      gradeAnswer(cbetSpot, 'fish', 'overbet'),
    ])
    const summary = summarizeCoverage(buildCoverage(rows))

    expect(summary).toMatchObject({ played: 2, mastered: 1, learning: 0, open: 1 })
    expect(summary.mastered + summary.learning + summary.open + summary.untested).toBe(
      summary.total,
    )
  })

  it('counts a pairing nailed once as learning rather than proven or open', () => {
    const rows = reviewSession([gradeAnswer(cbetSpot, 'fish', 'overbet')])
    const summary = summarizeCoverage(buildCoverage(rows))

    expect(summary).toMatchObject({ played: 1, mastered: 0, learning: 1, open: 0 })
    expect(summary.percentMastered).toBe(0)
  })

  it('reaches 100 percent only when every pairing is proven', () => {
    const grades = allPairings.flatMap(proveFully)
    const summary = summarizeCoverage(buildCoverage(reviewSession(grades)))

    expect(summary).toMatchObject({
      played: allPairings.length,
      mastered: allPairings.length,
      learning: 0,
      open: 0,
      untested: 0,
      percentMastered: 100,
    })
  })

  it('stops short of 100 percent while a single pairing is still unconfirmed', () => {
    const grades = [
      gradeOptimally(allPairings[0]),
      ...allPairings.slice(1).flatMap(proveFully),
    ]
    const summary = summarizeCoverage(buildCoverage(reviewSession(grades)))

    expect(summary).toMatchObject({ played: allPairings.length, learning: 1, open: 0 })
    expect(summary.percentMastered).toBeLessThan(100)
  })

  it('does not count an open pairing toward the proven percentage', () => {
    const grades = [gradeBadly(allPairings[0]), ...allPairings.slice(1).flatMap(proveFully)]
    const summary = summarizeCoverage(buildCoverage(reviewSession(grades)))

    expect(summary.open).toBe(1)
    expect(summary.percentMastered).toBe(
      Math.round(((allPairings.length - 1) / allPairings.length) * 100),
    )
  })
})

/** The lines that risk no extra chips, which is the passive end of a spot. */
const passiveActionIds = ['fold', 'check', 'call']

describe('authored aggression order', () => {
  it.each(spots)('$id authors its passive lines before its aggressive ones', (spot) => {
    const isPassive = spot.actions.map((action) => passiveActionIds.includes(action.id))
    const lastPassive = isPassive.lastIndexOf(true)
    const firstAggressive = isPassive.indexOf(false)

    // Anything but a leading run of passive lines would make an action's index
    // a meaningless aggression rank, and `missDirection` reads that index.
    expect(firstAggressive).toBeGreaterThan(-1)
    expect(lastPassive).toBeLessThan(firstAggressive)
  })
})

describe('missDirection', () => {
  const direction = (spot: typeof cbetSpot, opponentId: 'gto' | 'tag' | 'lag' | 'fish' | 'reg', actionId: string) =>
    missDirection(reviewSession([gradeAnswer(spot, opponentId, actionId)])[0])

  it('returns null for an optimal answer', () => {
    expect(direction(cbetSpot, 'gto', 'bet66')).toBeNull()
  })

  it('calls an answer short of the best line passive', () => {
    // Checking when a 2/3 c-bet is the max-EV line.
    expect(direction(cbetSpot, 'gto', 'check')).toBe('passive')
    // Folding when calling is the max-EV line.
    expect(direction(riverSpot, 'gto', 'fold')).toBe('passive')
  })

  it('calls an answer past the best line aggressive', () => {
    expect(direction(cbetSpot, 'gto', 'overbet')).toBe('aggressive')
    expect(direction(riverSpot, 'gto', 'raise')).toBe('aggressive')
  })

  it('reads a wrong bet size, not just a wrong line', () => {
    // Both are bets; only the size is wrong, and it is wrong in both directions.
    expect(direction(cbetSpot, 'fish', 'bet66')).toBe('passive')
    expect(direction(cbetSpot, 'reg', 'bet66')).toBe('aggressive')
  })

  it("counts a 'close' answer as a miss", () => {
    const grade = gradeAnswer(cbetSpot, 'reg', 'bet66')

    expect(grade.verdict).toBe('close')
    expect(grade.evLoss).toBeGreaterThan(0)
    expect(missDirection(reviewSession([grade])[0])).toBe('aggressive')
  })

  it('returns null when the chosen action no longer resolves', () => {
    const [row] = reviewSession([
      { ...gradeAnswer(cbetSpot, 'gto', 'check'), chosenActionId: 'retired-action' },
    ])

    expect(missDirection(row)).toBeNull()
  })
})

describe('summarizeTendency', () => {
  it('reports nothing to diagnose for an empty history', () => {
    expect(summarizeTendency([])).toEqual({
      answered: 0,
      missed: 0,
      passive: { direction: 'passive', mistakes: 0, evLost: 0 },
      aggressive: { direction: 'aggressive', mistakes: 0, evLost: 0 },
      bias: null,
      byStreet: [],
    })
  })

  it('counts answered spots but only takes a direction from the misses', () => {
    const tendency = summarizeTendency(
      reviewSession([
        gradeAnswer(cbetSpot, 'gto', 'bet66'),
        gradeAnswer(cbetSpot, 'gto', 'check'),
        gradeAnswer(riverSpot, 'gto', 'raise'),
      ]),
    )

    expect(tendency.answered).toBe(3)
    expect(tendency.missed).toBe(2)
    expect(tendency.passive.mistakes).toBe(1)
    expect(tendency.aggressive.mistakes).toBe(1)
  })

  it('totals the big blinds given up in each direction', () => {
    const tendency = summarizeTendency(
      reviewSession([
        gradeAnswer(cbetSpot, 'gto', 'check'),
        gradeAnswer(riverSpot, 'gto', 'fold'),
        gradeAnswer(riverSpot, 'gto', 'raise'),
      ]),
    )

    expect(tendency.passive).toEqual({ direction: 'passive', mistakes: 2, evLost: 0.65 })
    expect(tendency.aggressive).toEqual({ direction: 'aggressive', mistakes: 1, evLost: 2.35 })
  })

  it('names the costlier direction even when it has fewer mistakes', () => {
    const tendency = summarizeTendency(
      reviewSession([
        gradeAnswer(cbetSpot, 'gto', 'check'),
        gradeAnswer(riverSpot, 'gto', 'fold'),
        gradeAnswer(riverSpot, 'gto', 'raise'),
      ]),
    )

    expect(tendency.bias).toEqual({ direction: 'aggressive', mistakes: 1, evLost: 2.35 })
  })

  it('breaks an equal cost on the number of mistakes', () => {
    // 0.50 BB passive in one spot against 0.25 + 0.25 BB aggressive in two.
    const tendency = summarizeTendency(
      reviewSession([
        gradeAnswer(cbetSpot, 'gto', 'check'),
        gradeAnswer(riverSpot, 'reg', 'call'),
        gradeAnswer(getSpot('btn-3bet-aqo')!, 'tag', 'threebet'),
      ]),
    )

    expect(tendency.passive.evLost).toBe(tendency.aggressive.evLost)
    expect(tendency.bias?.direction).toBe('aggressive')
  })

  it('reports no bias when both directions cost the same across the same count', () => {
    const tendency = summarizeTendency(
      reviewSession([
        gradeAnswer(riverSpot, 'gto', 'fold'),
        gradeAnswer(cbetSpot, 'reg', 'bet66'),
      ]),
    )

    expect(tendency.passive.evLost).toBe(0.15)
    expect(tendency.aggressive.evLost).toBe(0.15)
    expect(tendency.bias).toBeNull()
  })

  it('splits the misses by street, in the order a hand is played', () => {
    const tendency = summarizeTendency(
      reviewSession([
        gradeAnswer(riverSpot, 'gto', 'fold'),
        gradeAnswer(getSpot('btn-3bet-aqo')!, 'gto', 'jam'),
        gradeAnswer(cbetSpot, 'gto', 'check'),
      ]),
    )

    expect(tendency.byStreet.map((street) => street.street)).toEqual(['Preflop', 'Flop', 'River'])
    expect(tendency.byStreet.map((street) => street.bias?.direction)).toEqual([
      'aggressive',
      'passive',
      'passive',
    ])
  })

  it('keeps a street bias independent of the overall bias', () => {
    const tendency = summarizeTendency(
      reviewSession([
        // One expensive preflop jam outweighs two cheap passive river folds.
        gradeAnswer(getSpot('btn-3bet-aqo')!, 'gto', 'jam'),
        gradeAnswer(riverSpot, 'gto', 'fold'),
        gradeAnswer(getSpot('btn-river-bluff-ace-high')!, 'gto', 'bet50'),
      ]),
    )

    expect(tendency.bias?.direction).toBe('aggressive')
    const river = tendency.byStreet.find((street) => street.street === 'River')!
    expect(river).toMatchObject({ missed: 2, evLost: 0.65 })
    expect(river.bias?.direction).toBe('passive')
  })

  it("adds each street's misses up to the whole", () => {
    const rows = reviewSession(allPairings.map(gradeBadly))
    const tendency = summarizeTendency(rows)

    expect(tendency.byStreet.reduce((total, street) => total + street.missed, 0)).toBe(
      tendency.missed,
    )
    expect(tendency.passive.mistakes + tendency.aggressive.mistakes).toBe(tendency.missed)
  })

  it('leaves a clean history with no bias to fix', () => {
    const tendency = summarizeTendency(reviewSession(allPairings.map(gradeOptimally)))

    expect(tendency.answered).toBe(allPairings.length)
    expect(tendency.missed).toBe(0)
    expect(tendency.bias).toBeNull()
    expect(tendency.byStreet).toEqual([])
  })
})

describe('buildTendencyDrill', () => {
  const rows = () =>
    reviewSession([
      gradeAnswer(cbetSpot, 'gto', 'check'),
      gradeAnswer(riverSpot, 'gto', 'raise'),
      gradeAnswer(riverSpot, 'lag', 'fold'),
      gradeAnswer(cbetSpot, 'tag', 'bet66'),
    ])

  it('deals only the pairings missed in the asked direction', () => {
    expect(buildTendencyDrill(rows(), 'passive').map(pairingKey)).toEqual([
      'btn-cbet-tptk/gto',
      'bb-river-bluffcatch/lag',
    ])
    expect(buildTendencyDrill(rows(), 'aggressive').map(pairingKey)).toEqual([
      'bb-river-bluffcatch/gto',
    ])
  })

  it('deals nothing when no answer missed that way', () => {
    const clean = reviewSession([gradeAnswer(cbetSpot, 'gto', 'bet66')])

    expect(buildTendencyDrill(clean, 'passive')).toEqual([])
    expect(buildTendencyDrill(clean, 'aggressive')).toEqual([])
  })

  it('splits the full retry drill between the two directions', () => {
    const all = buildRetryDrill(rows()).map(pairingKey).sort()
    const split = [
      ...buildTendencyDrill(rows(), 'passive'),
      ...buildTendencyDrill(rows(), 'aggressive'),
    ]
      .map(pairingKey)
      .sort()

    expect(split).toEqual(all)
  })

  it('inherits the ordering of the rows it is given', () => {
    // `summarizeLeakProgress` hands back open pairings costliest first, so a
    // career-level tendency drill comes out in that order too.
    const career = summarizeLeakProgress(
      reviewSession([
        gradeAnswer(riverSpot, 'gto', 'fold'),
        gradeAnswer(cbetSpot, 'gto', 'check'),
      ]),
    )

    expect(buildTendencyDrill(career.open, 'passive').map(pairingKey)).toEqual([
      'btn-cbet-tptk/gto',
      'bb-river-bluffcatch/gto',
    ])
  })
})
