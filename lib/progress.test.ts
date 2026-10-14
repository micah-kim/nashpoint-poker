import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  appendSession,
  clearHistory,
  emptyHistory,
  HISTORY_STORAGE_KEY,
  loadHistory,
  MAX_STORED_SESSIONS,
  parseHistory,
  saveHistory,
  serializeHistory,
  summarizeCareer,
  summarizeForm,
  FORM_WINDOW_SESSIONS,
  type CareerSummary,
  type PersistedSession,
  type TrainingHistory,
} from './progress'
import {
  getRecommendation,
  getSpot,
  gradeAnswer,
  MASTERY_FRESH_DAYS,
  type Grade,
  type SessionKind,
} from './trainer'

const cbetSpot = getSpot('btn-cbet-tptk')!
const riverSpot = getSpot('bb-river-bluffcatch')!

/** The max-EV answer for a pairing, so a test can play a session perfectly. */
function bestAnswer(spot: typeof cbetSpot, opponentId: 'tag' | 'gto' | 'fish' | 'lag' | 'reg') {
  return gradeAnswer(spot, opponentId, getRecommendation(spot, opponentId).exploitBestActionId)
}

function session(grades: Grade[], kind: SessionKind = 'drill', completedAt = 1_700_000_000_000) {
  return { kind, completedAt, grades }
}

function historyOf(...sessions: PersistedSession[]): TrainingHistory {
  return { sessions }
}

const DAY_MS = 24 * 60 * 60 * 1000

/** A fixed "now" so a dated test never depends on the wall clock. */
const NOW = 1_700_000_000_000

/** `completedAt` for a session finished `daysAgo` days before `NOW`. */
function daysAgo(days: number): number {
  return NOW - days * DAY_MS
}

describe('appendSession', () => {
  it('adds a session without mutating the history it was given', () => {
    const before = historyOf()
    const after = appendSession(before, session([gradeAnswer(riverSpot, 'tag', 'call')]))

    expect(before.sessions).toEqual([])
    expect(after.sessions).toHaveLength(1)
  })

  it('ignores a session with no graded spots', () => {
    expect(appendSession(historyOf(), session([]))).toEqual(historyOf())
  })

  it('keeps the newest sessions once the cap is reached', () => {
    let history = historyOf()

    for (let index = 0; index < MAX_STORED_SESSIONS + 3; index += 1) {
      history = appendSession(history, session([gradeAnswer(riverSpot, 'tag', 'call')], 'drill', index))
    }

    expect(history.sessions).toHaveLength(MAX_STORED_SESSIONS)
    expect(history.sessions[history.sessions.length - 1].completedAt).toBe(MAX_STORED_SESSIONS + 2)
    expect(history.sessions[0].completedAt).toBe(3)
  })
})

describe('parseHistory', () => {
  it('treats nothing stored as an empty history', () => {
    expect(parseHistory(null)).toEqual(emptyHistory)
    expect(parseHistory('')).toEqual(emptyHistory)
  })

  it('degrades to an empty history instead of throwing on junk', () => {
    expect(parseHistory('not json')).toEqual(emptyHistory)
    expect(parseHistory('null')).toEqual(emptyHistory)
    expect(parseHistory('[]')).toEqual(emptyHistory)
    expect(parseHistory('{"sessions":"nope"}')).toEqual(emptyHistory)
  })

  it('round-trips a real history', () => {
    const history = appendSession(
      historyOf(),
      session([gradeAnswer(riverSpot, 'tag', 'call'), bestAnswer(cbetSpot, 'fish')], 'retry'),
    )

    expect(parseHistory(serializeHistory(history))).toEqual(history)
  })

  it('drops grades whose spot no longer exists', () => {
    const history = historyOf(session([gradeAnswer(riverSpot, 'tag', 'call')]))
    const raw = serializeHistory(history).replace('bb-river-bluffcatch', 'spot-we-deleted')

    expect(parseHistory(raw)).toEqual(emptyHistory)
  })

  it('drops grades whose action no longer belongs to the spot', () => {
    const history = historyOf(session([gradeAnswer(riverSpot, 'tag', 'call')]))
    const raw = serializeHistory(history).replace('"chosenActionId":"call"', '"chosenActionId":"shove"')

    expect(parseHistory(raw)).toEqual(emptyHistory)
  })

  it('drops grades with an unknown opponent, verdict, or EV loss', () => {
    const base = serializeHistory(historyOf(session([gradeAnswer(riverSpot, 'tag', 'call')])))

    expect(parseHistory(base.replace('"opponentId":"tag"', '"opponentId":"whale"'))).toEqual(emptyHistory)
    expect(parseHistory(base.replace('"verdict":"mistake"', '"verdict":"terrible"'))).toEqual(emptyHistory)
    expect(parseHistory(base.replace(/"evLoss":[\d.]+/, '"evLoss":"lots"'))).toEqual(emptyHistory)
  })

  it('keeps the valid grades in a session that has one bad one', () => {
    const history = historyOf(
      session([gradeAnswer(riverSpot, 'tag', 'call'), gradeAnswer(cbetSpot, 'lag', 'bet66')]),
    )
    const raw = serializeHistory(history).replace('btn-cbet-tptk', 'spot-we-deleted')
    const parsed = parseHistory(raw)

    expect(parsed.sessions).toHaveLength(1)
    expect(parsed.sessions[0].grades.map((grade) => grade.spotId)).toEqual(['bb-river-bluffcatch'])
  })

  it('drops a session with an unrecognised kind or timestamp', () => {
    const base = serializeHistory(historyOf(session([gradeAnswer(riverSpot, 'tag', 'call')])))

    expect(parseHistory(base.replace('"kind":"drill"', '"kind":"freeplay"'))).toEqual(emptyHistory)
    expect(parseHistory(base.replace(/"completedAt":\d+/, '"completedAt":"today"'))).toEqual(emptyHistory)
  })

  it('keeps every kind of session the trainer can deal', () => {
    for (const kind of ['explore', 'drill', 'retry', 'confirm', 'refresh'] as SessionKind[]) {
      const stored = serializeHistory(
        historyOf(session([gradeAnswer(riverSpot, 'tag', 'call')], kind)),
      )

      expect(parseHistory(stored).sessions[0]?.kind).toBe(kind)
    }
  })

  it('caps a stored history that is longer than the limit', () => {
    const sessions = Array.from({ length: MAX_STORED_SESSIONS + 5 }, (_unused, index) =>
      session([gradeAnswer(riverSpot, 'tag', 'call')], 'drill', index),
    )

    expect(parseHistory(serializeHistory(historyOf(...sessions))).sessions).toHaveLength(
      MAX_STORED_SESSIONS,
    )
  })

  it('parses a history that only ever contained perfect sessions', () => {
    const history = historyOf(session([bestAnswer(riverSpot, 'tag')]))

    expect(parseHistory(serializeHistory(history))).toEqual(history)
  })
})

describe('summarizeCareer', () => {
  it('reports an untouched career as empty', () => {
    expect(summarizeCareer(emptyHistory)).toMatchObject({
      sessions: 0,
      answered: 0,
      optimal: 0,
      accuracy: 0,
      evLost: 0,
      toughestRead: null,
      openLeaks: [],
      closedLeaks: 0,
    })
  })

  it('totals every session, not just the newest', () => {
    const career = summarizeCareer(
      historyOf(
        session([gradeAnswer(riverSpot, 'tag', 'call')]),
        session([bestAnswer(cbetSpot, 'fish'), bestAnswer(riverSpot, 'lag')], 'retry'),
      ),
    )

    expect(career).toMatchObject({ sessions: 2, answered: 3, optimal: 2, accuracy: 67 })
    expect(career.evLost).toBeGreaterThan(0)
  })

  it('names the read that has cost the most across sessions', () => {
    const career = summarizeCareer(
      historyOf(
        session([gradeAnswer(cbetSpot, 'reg', 'bet66')]),
        session([gradeAnswer(riverSpot, 'tag', 'call')]),
      ),
    )

    expect(career.toughestRead?.opponent.id).toBe('tag')
  })

  it('carries a leak across sessions until it is replayed correctly', () => {
    const missed = historyOf(session([gradeAnswer(riverSpot, 'tag', 'call')]))
    const fixed = appendSession(missed, session([bestAnswer(riverSpot, 'tag')], 'retry'))

    expect(summarizeCareer(missed).openLeaks.map((row) => row.spot.id)).toEqual([
      'bb-river-bluffcatch',
    ])
    expect(summarizeCareer(missed).closedLeaks).toBe(0)
    expect(summarizeCareer(fixed).openLeaks).toEqual([])
    expect(summarizeCareer(fixed).closedLeaks).toBe(1)
  })

  it('keeps the lifetime EV lost even after a leak is closed', () => {
    const career = summarizeCareer(
      appendSession(
        historyOf(session([gradeAnswer(riverSpot, 'tag', 'call')])),
        session([bestAnswer(riverSpot, 'tag')], 'retry'),
      ),
    )

    expect(career.closedLeaks).toBe(1)
    expect(career.evLost).toBeGreaterThan(0)
  })

  it('keeps the sessions apart in the form alongside the lifetime totals', () => {
    const career = summarizeCareer(
      historyOf(
        session([gradeAnswer(riverSpot, 'tag', 'call')]),
        session([bestAnswer(riverSpot, 'tag')], 'retry'),
      ),
    )

    expect(career.accuracy).toBe(50)
    expect(career.form.sessions.map((entry) => entry.accuracy)).toEqual([100, 0])
  })

  it('dates the form with the same clock the coverage grid ages against', () => {
    const career = summarizeCareer(
      historyOf(session([bestAnswer(riverSpot, 'tag')], 'drill', daysAgo(3))),
      NOW,
    )

    expect(career.form.sessions[0].daysAgo).toBe(3)
    expect(career.form.daysSinceLastSession).toBe(3)
  })

  it('leaves the form undated when the career is not aged', () => {
    const career = summarizeCareer(
      historyOf(session([bestAnswer(riverSpot, 'tag')], 'drill', daysAgo(3))),
    )

    expect(career.form.sessions[0].daysAgo).toBeNull()
    expect(career.form.daysSinceLastSession).toBeNull()
  })

  it('reports an untouched career as an untested grid', () => {
    const career = summarizeCareer(emptyHistory)

    expect(career.coverage.length).toBeGreaterThan(0)
    expect(career.coverageStats).toMatchObject({
      total: career.coverage.length,
      played: 0,
      untested: career.coverage.length,
      percentMastered: 0,
    })
  })

  it('projects every session onto the coverage grid', () => {
    const career = summarizeCareer(
      historyOf(
        session([gradeAnswer(riverSpot, 'tag', 'call')]),
        session([bestAnswer(cbetSpot, 'fish'), bestAnswer(cbetSpot, 'fish')], 'drill'),
      ),
    )
    const status = (spotId: string, opponentId: string) =>
      career.coverage.find((cell) => cell.spot.id === spotId && cell.opponent.id === opponentId)
        ?.status

    expect(career.coverageStats).toMatchObject({ played: 2, mastered: 1, learning: 0, open: 1 })
    expect(status('bb-river-bluffcatch', 'tag')).toBe('open')
    expect(status('btn-cbet-tptk', 'fish')).toBe('mastered')
    expect(status('btn-cbet-tptk', 'gto')).toBe('untested')
  })

  /**
   * The reason mastery reps need the persisted history: the two clean reps a
   * pairing owes can land in different visits, so only a career-wide streak
   * can tell a proven pairing from a lucky one.
   */
  it('proves a grid cell over two sessions, not one', () => {
    const missed = historyOf(session([gradeAnswer(riverSpot, 'tag', 'call')]))
    const replayed = appendSession(missed, session([bestAnswer(riverSpot, 'tag')], 'retry'))
    const confirmed = appendSession(
      replayed,
      session([bestAnswer(riverSpot, 'tag')], 'confirm'),
    )

    expect(summarizeCareer(missed).coverageStats).toMatchObject({
      played: 1,
      open: 1,
      learning: 0,
      mastered: 0,
    })
    expect(summarizeCareer(replayed).coverageStats).toMatchObject({
      played: 1,
      open: 0,
      learning: 1,
      mastered: 0,
    })
    expect(summarizeCareer(confirmed).coverageStats).toMatchObject({
      played: 1,
      open: 0,
      learning: 0,
      mastered: 1,
    })
  })

  /**
   * Closing a leak and proving a pairing are deliberately different bars: one
   * clean answer settles the EV, two in a row settle whether it was a guess.
   */
  it('closes a leak on one clean replay while the grid still wants another', () => {
    const fixed = appendSession(
      historyOf(session([gradeAnswer(riverSpot, 'tag', 'call')])),
      session([bestAnswer(riverSpot, 'tag')], 'retry'),
    )
    const career = summarizeCareer(fixed)

    expect(career.openLeaks).toEqual([])
    expect(career.closedLeaks).toBe(1)
    expect(career.coverageStats.mastered).toBe(0)
  })

  it('keeps the coverage grid and the open leaks telling the same story', () => {
    const career = summarizeCareer(
      historyOf(session([gradeAnswer(riverSpot, 'tag', 'call'), gradeAnswer(cbetSpot, 'reg', 'bet66')])),
    )

    expect(career.coverageStats.open).toBe(career.openLeaks.length)
  })

  it('splits the lifetime grid by street without disagreeing with the whole', () => {
    const career = summarizeCareer(
      historyOf(
        session([gradeAnswer(riverSpot, 'tag', 'call')]),
        session([bestAnswer(cbetSpot, 'fish')], 'drill'),
      ),
    )
    const sum = (pick: (entry: CareerSummary['streetProgress'][number]) => number) =>
      career.streetProgress.reduce((total, entry) => total + pick(entry), 0)

    expect(career.streetProgress.length).toBeGreaterThan(1)
    expect(sum((entry) => entry.total)).toBe(career.coverage.length)
    expect(sum((entry) => entry.mastered)).toBe(career.coverageStats.mastered)
    expect(sum((entry) => entry.learning)).toBe(career.coverageStats.learning)
    expect(sum((entry) => entry.open)).toBe(career.coverageStats.open)
  })

  it('credits each street with only the pairings played on it', () => {
    const career = summarizeCareer(
      historyOf(session([bestAnswer(riverSpot, 'fish'), bestAnswer(riverSpot, 'fish')])),
    )
    const onStreet = (street: string) =>
      career.streetProgress.find((entry) => entry.street === street)!

    expect(onStreet(riverSpot.street).mastered).toBe(1)
    expect(onStreet('Preflop').mastered).toBe(0)
    expect(onStreet('Preflop').untested).toBe(onStreet('Preflop').total)
  })

  it('splits the lifetime grid by read without disagreeing with the whole', () => {
    const career = summarizeCareer(
      historyOf(
        session([gradeAnswer(riverSpot, 'tag', 'call')]),
        session([bestAnswer(cbetSpot, 'fish')], 'drill'),
      ),
    )
    const sum = (pick: (entry: CareerSummary['readProgress'][number]) => number) =>
      career.readProgress.reduce((total, entry) => total + pick(entry), 0)

    expect(career.readProgress.length).toBeGreaterThan(1)
    expect(sum((entry) => entry.total)).toBe(career.coverage.length)
    expect(sum((entry) => entry.mastered)).toBe(career.coverageStats.mastered)
    expect(sum((entry) => entry.learning)).toBe(career.coverageStats.learning)
    expect(sum((entry) => entry.open)).toBe(career.coverageStats.open)
  })

  it('credits each read with only the pairings played against it', () => {
    const career = summarizeCareer(
      historyOf(session([bestAnswer(riverSpot, 'fish'), bestAnswer(riverSpot, 'fish')])),
    )
    const againstRead = (opponentId: string) =>
      career.readProgress.find((entry) => entry.opponent.id === opponentId)!

    expect(againstRead('fish').mastered).toBe(1)
    expect(againstRead('tag').mastered).toBe(0)
    expect(againstRead('tag').untested).toBe(againstRead('tag').total)
  })

  it('reports an untouched career as every read untested', () => {
    const career = summarizeCareer(emptyHistory)

    expect(career.readProgress.length).toBeGreaterThan(1)
    for (const entry of career.readProgress) {
      expect(entry).toMatchObject({ untested: entry.total, mastered: 0, percentMastered: 0 })
    }
  })

  it('splits the lifetime grid by spot without disagreeing with the whole', () => {
    const career = summarizeCareer(
      historyOf(
        session([gradeAnswer(riverSpot, 'tag', 'call')]),
        session([bestAnswer(cbetSpot, 'fish')], 'drill'),
      ),
    )
    const sum = (pick: (entry: CareerSummary['spotProgress'][number]) => number) =>
      career.spotProgress.reduce((total, entry) => total + pick(entry), 0)

    expect(career.spotProgress.length).toBeGreaterThan(1)
    expect(sum((entry) => entry.total)).toBe(career.coverage.length)
    expect(sum((entry) => entry.mastered)).toBe(career.coverageStats.mastered)
    expect(sum((entry) => entry.learning)).toBe(career.coverageStats.learning)
    expect(sum((entry) => entry.open)).toBe(career.coverageStats.open)
  })

  it('credits each spot with only the pairings played in it', () => {
    const career = summarizeCareer(
      historyOf(session([bestAnswer(riverSpot, 'fish'), bestAnswer(riverSpot, 'fish')])),
    )
    const inSpot = (spotId: string) =>
      career.spotProgress.find((entry) => entry.spot.id === spotId)!

    expect(inSpot(riverSpot.id).mastered).toBe(1)
    expect(inSpot(cbetSpot.id).mastered).toBe(0)
    expect(inSpot(cbetSpot.id).untested).toBe(inSpot(cbetSpot.id).total)
  })

  it('ages a proven spot with the same clock the grid uses', () => {
    const provenAt = 1_700_000_000_000
    const career = summarizeCareer(
      historyOf(
        session([bestAnswer(riverSpot, 'fish'), bestAnswer(riverSpot, 'fish')], 'drill', provenAt),
      ),
      provenAt + (MASTERY_FRESH_DAYS + 1) * DAY_MS,
    )
    const inRiverSpot = career.spotProgress.find((entry) => entry.spot.id === riverSpot.id)!

    expect(inRiverSpot).toMatchObject({ stale: 1, mastered: 0 })
  })

  it('ages a proven read with the same clock the grid uses', () => {
    const provenAt = 1_700_000_000_000
    const career = summarizeCareer(
      historyOf(session([bestAnswer(riverSpot, 'fish'), bestAnswer(riverSpot, 'fish')], 'drill', provenAt)),
      provenAt + (MASTERY_FRESH_DAYS + 1) * DAY_MS,
    )
    const againstFish = career.readProgress.find((entry) => entry.opponent.id === 'fish')!

    expect(againstFish).toMatchObject({ stale: 1, mastered: 0 })
  })

  it('leaves an untouched career with no tendency to diagnose', () => {
    expect(summarizeCareer(emptyHistory).tendency).toMatchObject({
      answered: 0,
      missed: 0,
      bias: null,
      byStreet: [],
    })
  })

  it('diagnoses the direction of the misses across every session', () => {
    const career = summarizeCareer(
      historyOf(
        // Calling a river bet that should be folded is the aggressive miss.
        session([gradeAnswer(riverSpot, 'tag', 'call')]),
        session([gradeAnswer(cbetSpot, 'gto', 'check')], 'drill'),
      ),
    )

    expect(career.tendency.answered).toBe(2)
    expect(career.tendency.missed).toBe(2)
    expect(career.tendency.aggressive.mistakes).toBe(1)
    expect(career.tendency.passive.mistakes).toBe(1)
    expect(career.tendency.bias?.direction).toBe('aggressive')
    expect(career.tendency.byStreet.map((street) => street.street)).toEqual(['Flop', 'River'])
  })

  it('keeps a lifetime tendency after the pairing behind it is closed', () => {
    const career = summarizeCareer(
      appendSession(
        historyOf(session([gradeAnswer(cbetSpot, 'gto', 'check')])),
        session([bestAnswer(cbetSpot, 'gto')], 'retry'),
      ),
    )

    // The pairing is proven again, but the habit that lost it still happened.
    expect(career.openLeaks).toEqual([])
    expect(career.closedLeaks).toBe(1)
    expect(career.tendency.passive.mistakes).toBe(1)
    expect(career.tendency.bias?.direction).toBe('passive')
  })

  it('agrees with the EV it lost on the costlier side', () => {
    const career = summarizeCareer(
      historyOf(session([gradeAnswer(riverSpot, 'tag', 'call'), gradeAnswer(cbetSpot, 'gto', 'check')])),
    )

    expect(career.tendency.passive.evLost + career.tendency.aggressive.evLost).toBeCloseTo(
      career.evLost,
    )
  })
})

describe('summarizeCareer ageing', () => {
  /** Proves one pairing `MASTERY_REPS` times in a session finished `days` ago. */
  function provenSession(days: number) {
    return session([bestAnswer(cbetSpot, 'fish'), bestAnswer(cbetSpot, 'fish')], 'drill', daysAgo(days))
  }

  it('keeps a recently proven pairing proven', () => {
    const career = summarizeCareer(historyOf(provenSession(1)), NOW)

    expect(career.coverageStats.mastered).toBe(1)
    expect(career.coverageStats.stale).toBe(0)
  })

  it('turns a pairing proven long ago into one due for review', () => {
    const career = summarizeCareer(historyOf(provenSession(MASTERY_FRESH_DAYS + 1)), NOW)

    expect(career.coverageStats.mastered).toBe(0)
    expect(career.coverageStats.stale).toBe(1)
  })

  it('ages nothing without a clock, so server rendering stays stable', () => {
    const career = summarizeCareer(historyOf(provenSession(10_000)))

    expect(career.coverageStats.mastered).toBe(1)
    expect(career.coverageStats.stale).toBe(0)
  })

  it('dates each pairing from the session it was played in, not the newest one', () => {
    const career = summarizeCareer(
      historyOf(
        provenSession(MASTERY_FRESH_DAYS + 20),
        session([bestAnswer(riverSpot, 'lag'), bestAnswer(riverSpot, 'lag')], 'drill', daysAgo(0)),
      ),
      NOW,
    )
    const cold = career.coverage.find(
      (cell) => cell.spot.id === cbetSpot.id && cell.opponent.id === 'fish',
    )!
    const warm = career.coverage.find(
      (cell) => cell.spot.id === riverSpot.id && cell.opponent.id === 'lag',
    )!

    expect(cold.status).toBe('stale')
    expect(cold.daysSinceLastPlayed).toBe(MASTERY_FRESH_DAYS + 20)
    expect(warm.status).toBe('mastered')
    expect(warm.daysSinceLastPlayed).toBe(0)
  })

  it('re-proves a stale pairing when it is played again', () => {
    const history = historyOf(
      provenSession(MASTERY_FRESH_DAYS + 5),
      session([bestAnswer(cbetSpot, 'fish')], 'refresh', daysAgo(0)),
    )
    const cell = summarizeCareer(history, NOW).coverage.find(
      (candidate) => candidate.spot.id === cbetSpot.id && candidate.opponent.id === 'fish',
    )!

    // Three clean reps in a row, so the window has doubled rather than reset.
    expect(cell.status).toBe('mastered')
    expect(cell.streak).toBe(3)
    expect(cell.reviewDueInDays).toBe(MASTERY_FRESH_DAYS * 2)
  })

  it('leaves the leak and accuracy totals alone, which do not age', () => {
    const history = historyOf(provenSession(MASTERY_FRESH_DAYS + 1))
    const aged = summarizeCareer(history, NOW)
    const unaged = summarizeCareer(history)

    expect(aged.accuracy).toBe(unaged.accuracy)
    expect(aged.answered).toBe(unaged.answered)
    expect(aged.openLeaks).toEqual(unaged.openLeaks)
    expect(aged.closedLeaks).toBe(unaged.closedLeaks)
    expect(aged.evLost).toBe(unaged.evLost)
  })

  it('stamps every review row with the session it came from', () => {
    const career = summarizeCareer(
      historyOf(session([gradeAnswer(riverSpot, 'tag', 'call')], 'drill', daysAgo(3))),
      NOW,
    )

    expect(career.openLeaks).toHaveLength(1)
    expect(career.openLeaks[0].answeredAt).toBe(daysAgo(3))
  })
})

describe('summarizeForm', () => {
  /** A session of `answered` spots with `optimal` of them played perfectly. */
  function mixedSession(optimal: number, missed: number, completedAt = NOW) {
    return session(
      [
        ...Array.from({ length: optimal }, () => bestAnswer(riverSpot, 'tag')),
        ...Array.from({ length: missed }, () => gradeAnswer(riverSpot, 'tag', 'call')),
      ],
      'drill',
      completedAt,
    )
  }

  it('reports an untouched history as having no form', () => {
    expect(summarizeForm(emptyHistory)).toEqual({
      sessions: [],
      recentAccuracy: null,
      previousAccuracy: null,
      trend: null,
      recentSessions: 0,
      previousSessions: 0,
      daysSinceLastSession: null,
    })
  })

  it('summarizes one session on its own terms', () => {
    const form = summarizeForm(historyOf(mixedSession(3, 2)))

    expect(form.sessions).toHaveLength(1)
    expect(form.sessions[0]).toMatchObject({
      number: 1,
      kind: 'drill',
      answered: 5,
      optimal: 3,
      accuracy: 60,
    })
    expect(form.sessions[0].evLost).toBeGreaterThan(0)
  })

  it('lists the sessions newest first but numbers them oldest first', () => {
    const form = summarizeForm(
      historyOf(
        session([bestAnswer(riverSpot, 'tag')], 'explore'),
        session([bestAnswer(cbetSpot, 'fish')], 'drill'),
        session([bestAnswer(riverSpot, 'lag')], 'retry'),
      ),
    )

    expect(form.sessions.map((entry) => entry.number)).toEqual([3, 2, 1])
    expect(form.sessions.map((entry) => entry.kind)).toEqual(['retry', 'drill', 'explore'])
  })

  it('has nothing to compare against until a window has sessions behind it', () => {
    for (let count = 1; count <= FORM_WINDOW_SESSIONS; count += 1) {
      const form = summarizeForm(
        historyOf(...Array.from({ length: count }, () => mixedSession(3, 2))),
      )

      expect(form.recentSessions).toBe(count)
      expect(form.previousSessions).toBe(0)
      expect(form.previousAccuracy).toBeNull()
      expect(form.trend).toBeNull()
    }
  })

  it('compares the recent window against the one before it', () => {
    const form = summarizeForm(
      historyOf(
        mixedSession(1, 4),
        mixedSession(4, 1),
        mixedSession(4, 1),
        mixedSession(4, 1),
      ),
    )

    expect(form.recentSessions).toBe(3)
    expect(form.previousSessions).toBe(1)
    expect(form.recentAccuracy).toBe(80)
    expect(form.previousAccuracy).toBe(20)
    expect(form.trend).toBe(60)
  })

  it('reports a slide as a negative trend', () => {
    const form = summarizeForm(
      historyOf(mixedSession(5, 0), mixedSession(0, 5), mixedSession(0, 5), mixedSession(0, 5)),
    )

    expect(form.trend).toBe(-100)
  })

  it('caps the window it compares against rather than reaching back forever', () => {
    const form = summarizeForm(
      historyOf(
        // Session 1 is a window too far back to count once six are stored.
        mixedSession(0, 5),
        ...Array.from({ length: FORM_WINDOW_SESSIONS }, () => mixedSession(5, 0)),
        ...Array.from({ length: FORM_WINDOW_SESSIONS }, () => mixedSession(5, 0)),
      ),
    )

    expect(form.recentSessions).toBe(FORM_WINDOW_SESSIONS)
    expect(form.previousSessions).toBe(FORM_WINDOW_SESSIONS)
    expect(form.previousAccuracy).toBe(100)
    expect(form.trend).toBe(0)
  })

  it('pools a window by answer rather than averaging its sessions', () => {
    // A one-hand perfect session and a four-hand miss is 20% of the answers,
    // not the 50% an average of the two session scores would report.
    const form = summarizeForm(historyOf(mixedSession(1, 0), mixedSession(0, 4)))

    expect(form.recentAccuracy).toBe(20)
  })

  it('dates every session against the clock it is given', () => {
    const form = summarizeForm(
      historyOf(
        mixedSession(5, 0, daysAgo(9)),
        mixedSession(5, 0, daysAgo(1)),
        mixedSession(5, 0, NOW),
      ),
      NOW,
    )

    expect(form.sessions.map((entry) => entry.daysAgo)).toEqual([0, 1, 9])
    expect(form.daysSinceLastSession).toBe(0)
  })

  it('leaves the sessions undated without a clock, so a render cannot drift', () => {
    const form = summarizeForm(historyOf(mixedSession(5, 0, daysAgo(9))), undefined)

    expect(form.sessions[0].daysAgo).toBeNull()
    expect(form.daysSinceLastSession).toBeNull()
  })

  it('clamps a session stamped ahead of the clock to today', () => {
    const form = summarizeForm(historyOf(mixedSession(5, 0, NOW + 5 * DAY_MS)), NOW)

    expect(form.sessions[0].daysAgo).toBe(0)
  })

  it('leaves the history it was given alone', () => {
    const history = historyOf(mixedSession(5, 0), mixedSession(0, 5))
    const order = history.sessions.map((entry) => entry.kind)

    summarizeForm(history, NOW)

    expect(history.sessions.map((entry) => entry.kind)).toEqual(order)
  })

  it('still reports a form for a history at the storage cap', () => {
    const history = historyOf(
      ...Array.from({ length: MAX_STORED_SESSIONS }, () => mixedSession(5, 0)),
    )
    const form = summarizeForm(history, NOW)

    expect(form.sessions).toHaveLength(MAX_STORED_SESSIONS)
    expect(form.trend).toBe(0)
  })
})

describe('browser storage', () => {
  let store: Record<string, string>

  beforeEach(() => {
    store = {}
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value
        },
        removeItem: (key: string) => {
          delete store[key]
        },
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('round-trips a history through storage', () => {
    const history = appendSession(historyOf(), session([gradeAnswer(riverSpot, 'tag', 'call')]))

    saveHistory(history)

    expect(store[HISTORY_STORAGE_KEY]).toBeTypeOf('string')
    expect(loadHistory()).toEqual(history)
  })

  it('loads an empty history when nothing has been stored', () => {
    expect(loadHistory()).toEqual(emptyHistory)
  })

  it('forgets everything on clear', () => {
    saveHistory(appendSession(historyOf(), session([gradeAnswer(riverSpot, 'tag', 'call')])))
    clearHistory()

    expect(loadHistory()).toEqual(emptyHistory)
  })

  it('stays usable when storage throws', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => {
          throw new Error('blocked')
        },
        setItem: () => {
          throw new Error('quota exceeded')
        },
        removeItem: () => {
          throw new Error('blocked')
        },
      },
    })

    expect(() => saveHistory(historyOf())).not.toThrow()
    expect(() => clearHistory()).not.toThrow()
    expect(loadHistory()).toEqual(emptyHistory)
  })

  it('reads and writes nothing while server rendering', () => {
    vi.stubGlobal('window', undefined)

    expect(loadHistory()).toEqual(emptyHistory)
    expect(() => saveHistory(historyOf())).not.toThrow()
    expect(() => clearHistory()).not.toThrow()
  })
})
