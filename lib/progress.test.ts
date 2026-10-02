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
  type PersistedSession,
  type TrainingHistory,
} from './progress'
import { getRecommendation, getSpot, gradeAnswer, type Grade, type SessionKind } from './trainer'

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
      latestAccuracy: null,
      priorAccuracy: null,
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

  it('splits the newest session out so the trend has something to compare', () => {
    const career = summarizeCareer(
      historyOf(
        session([gradeAnswer(riverSpot, 'tag', 'call')]),
        session([bestAnswer(riverSpot, 'tag')], 'retry'),
      ),
    )

    expect(career.latestAccuracy).toBe(100)
    expect(career.priorAccuracy).toBe(0)
  })

  it('has no prior accuracy to compare on a first session', () => {
    const career = summarizeCareer(historyOf(session([gradeAnswer(riverSpot, 'tag', 'call')])))

    expect(career.latestAccuracy).toBe(0)
    expect(career.priorAccuracy).toBeNull()
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
        session([bestAnswer(cbetSpot, 'fish')], 'drill'),
      ),
    )
    const status = (spotId: string, opponentId: string) =>
      career.coverage.find((cell) => cell.spot.id === spotId && cell.opponent.id === opponentId)
        ?.status

    expect(career.coverageStats).toMatchObject({ played: 2, mastered: 1, open: 1 })
    expect(status('bb-river-bluffcatch', 'tag')).toBe('open')
    expect(status('btn-cbet-tptk', 'fish')).toBe('mastered')
    expect(status('btn-cbet-tptk', 'gto')).toBe('untested')
  })

  it('masters a grid cell once the leak behind it is replayed correctly', () => {
    const missed = historyOf(session([gradeAnswer(riverSpot, 'tag', 'call')]))
    const fixed = appendSession(missed, session([bestAnswer(riverSpot, 'tag')], 'retry'))

    expect(summarizeCareer(missed).coverageStats).toMatchObject({ played: 1, open: 1, mastered: 0 })
    expect(summarizeCareer(fixed).coverageStats).toMatchObject({ played: 1, open: 0, mastered: 1 })
  })

  it('keeps the coverage grid and the open leaks telling the same story', () => {
    const career = summarizeCareer(
      historyOf(session([gradeAnswer(riverSpot, 'tag', 'call'), gradeAnswer(cbetSpot, 'reg', 'bet66')])),
    )

    expect(career.coverageStats.open).toBe(career.openLeaks.length)
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
