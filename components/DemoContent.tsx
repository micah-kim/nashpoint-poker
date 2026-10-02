'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, Icon, PlayingCard } from '@/components/ui'
import { demoContent } from '@/lib/content'
import { opponentProfiles, spots, type OpponentId } from '@/lib/spots'
import {
  appendSession,
  clearHistory,
  emptyHistory,
  loadHistory,
  saveHistory,
  summarizeCareer,
  type CareerSummary,
  type TrainingHistory,
} from '@/lib/progress'
import {
  buildCoverageDrill,
  buildRetryDrill,
  findBiggestLeak,
  getRecommendation,
  gradeAnswer,
  reviewSession,
  summarizeByOpponent,
  summarizeSession,
  type CoverageCell,
  type CoverageStatus,
  type CoverageSummary,
  type DealtHand,
  type Grade,
  type OpponentBreakdown,
  type ReviewRow,
  type SessionKind,
  type Verdict,
} from '@/lib/trainer'

const verdictStyles: Record<Verdict, { container: string; text: string; icon: 'check' | 'target' | 'scale' }> = {
  optimal: { container: 'bg-green-900/30 border-green-600/50', text: 'text-green-400', icon: 'check' },
  close: { container: 'bg-brand-accent/15 border-brand-accent/50', text: 'text-brand-accent', icon: 'target' },
  mistake: { container: 'bg-red-900/30 border-red-600/50', text: 'text-red-400', icon: 'scale' },
}

/** A dealt run of hands: a coverage drill, or a replay of the ones you missed. */
interface DealtSession {
  kind: Exclude<SessionKind, 'explore'>
  hands: DealtHand[]
}

function pluralSessions(count: number): string {
  return count === 1 ? demoContent.careerSessionLabel : demoContent.careerSessionsLabel
}

function formatBb(value: number): string {
  // Negating a zero EV loss yields -0, which would render as "-0.00 BB".
  const signed = value === 0 ? 0 : value

  return `${signed > 0 ? '+' : ''}${signed.toFixed(2)} BB`
}

export default function DemoContent() {
  /** A dealt session, or null while the user is picking the read themselves. */
  const [dealt, setDealt] = useState<DealtSession | null>(null)
  const [spotIndex, setSpotIndex] = useState(0)
  const [pickedOpponentId, setPickedOpponentId] = useState<OpponentId>('tag')
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [history, setHistory] = useState<Grade[]>([])
  const [isFinished, setIsFinished] = useState(false)
  /** Everything this browser has played before, loaded after mount. */
  const [career, setCareer] = useState<TrainingHistory>(emptyHistory)

  // Storage is client-only, so the first render has to match the server's
  // empty history and fill in afterwards.
  useEffect(() => {
    setCareer(loadHistory())
  }, [])

  const careerSummary = useMemo(() => summarizeCareer(career), [career])
  const leakHands = useMemo(
    () => buildRetryDrill(careerSummary.openLeaks),
    [careerSummary.openLeaks],
  )

  const kind: SessionKind = dealt?.kind ?? 'explore'
  const isDealt = dealt !== null
  const hand = dealt ? dealt.hands[spotIndex] : { spot: spots[spotIndex], opponentId: pickedOpponentId }
  const { spot, opponentId } = hand
  const totalSpots = dealt ? dealt.hands.length : spots.length
  const recommendation = useMemo(() => getRecommendation(spot, opponentId), [spot, opponentId])
  const isLastSpot = spotIndex === totalSpots - 1

  const bestRow = recommendation.rows.find((row) => row.isExploitBest)!
  const baselineRow = recommendation.rows.find((row) => row.isBaselineBest)!

  const opponentCopy = {
    explore: { heading: demoContent.opponentHeading, hint: demoContent.opponentHint },
    drill: { heading: demoContent.dealtOpponentHeading, hint: demoContent.dealtOpponentHint },
    retry: { heading: demoContent.retryOpponentHeading, hint: demoContent.retryOpponentHint },
  }[kind]

  function handleSubmit() {
    if (!selectedActionId || grade) return

    const result = gradeAnswer(spot, opponentId, selectedActionId)
    setGrade(result)
    setHistory((previous) => [...previous, result])
  }

  /**
   * Writes a finished session to the browser's history. Called from the
   * handler that ends a session rather than from an effect, so a session is
   * recorded exactly once even though `Date.now()` is involved.
   */
  function recordSession(grades: Grade[]) {
    const next = appendSession(career, { kind, completedAt: Date.now(), grades })

    setCareer(next)
    saveHistory(next)
  }

  function handleNext() {
    setSelectedActionId(null)
    setGrade(null)

    if (isLastSpot) {
      // `history` already holds this spot's grade; `handleSubmit` appended it.
      recordSession(history)
      setIsFinished(true)
      return
    }

    setSpotIndex((index) => index + 1)
  }

  function resetSession() {
    setSpotIndex(0)
    setSelectedActionId(null)
    setGrade(null)
    setHistory([])
    setIsFinished(false)
  }

  /**
   * Deals from the gaps in this browser's coverage: never-seen pairings first,
   * then the ones still open. Seeded from the clock inside the handler, never
   * during render -- a random deal computed on the server would not match the
   * client on hydration.
   */
  function startDrill() {
    setDealt({ kind: 'drill', hands: buildCoverageDrill(careerSummary.coverage, Date.now()) })
    resetSession()
  }

  function startExplore() {
    setDealt(null)
    resetSession()
  }

  /** Deals the hands a finished session gave up EV on, so a leak gets replayed. */
  function startRetry(hands: DealtHand[]) {
    setDealt({ kind: 'retry', hands })
    resetSession()
  }

  /**
   * Deals the leaks still open across every stored session, not just the one
   * just played. Shares the 'retry' kind with a session recap's retry: same
   * hands, same read, second look -- only the source of the list differs.
   */
  function startLeakDrill() {
    if (leakHands.length === 0) return

    startRetry(leakHands)
  }

  function resetHistory() {
    clearHistory()
    setCareer(emptyHistory)
  }

  /**
   * "Run it again" re-deals in drill mode, so a replay is a new set of hands.
   * A retry replays the same hands instead -- that is the point of drilling them.
   */
  function handleRestart() {
    if (kind === 'drill') {
      startDrill()
      return
    }

    resetSession()
  }

  return (
    <div className="py-20 bg-brand-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-text-primary mb-6">
            {demoContent.headline}
          </h1>
          <p className="text-xl text-brand-text-secondary mb-4 max-w-2xl mx-auto">
            {demoContent.subheadline}
          </p>
          <Badge variant="warning">{demoContent.badge}</Badge>
        </div>

        {!isFinished && (
          <Card variant="elevated" className="max-w-3xl mx-auto mb-10">
            <p className="text-xs uppercase tracking-wide text-brand-text-secondary mb-3">
              {demoContent.modeHeading}
            </p>
            <div
              className={`grid grid-cols-1 gap-3 ${
                leakHands.length > 0 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
              }`}
            >
              <ModeOption
                icon="target"
                label={demoContent.exploreModeLabel}
                hint={demoContent.exploreModeHint}
                isActive={kind === 'explore'}
                // Already picking the read: nothing to do, so a stray click cannot wipe a session.
                onSelect={() => isDealt && startExplore()}
              />
              <ModeOption
                icon="dice"
                label={demoContent.drillModeLabel}
                hint={demoContent.drillModeHint}
                isActive={kind === 'drill'}
                // Always deals, so this re-deals mid-drill rather than going inert.
                onSelect={startDrill}
              />
              {/* Only offered once this browser has leaks to hand back. */}
              {leakHands.length > 0 && (
                <ModeOption
                  icon="refresh"
                  label={`${demoContent.leakModeLabel} (${leakHands.length})`}
                  hint={demoContent.leakModeHint}
                  isActive={kind === 'retry'}
                  onSelect={startLeakDrill}
                />
              )}
            </div>
            <p className="text-xs text-brand-text-secondary mt-3">
              {kind === 'retry' ? demoContent.retryActiveNote : demoContent.modeSwitchNote}
            </p>
            {careerSummary.sessions > 0 && (
              <p className="text-xs text-brand-text-secondary mt-2">
                <span className="text-brand-accent font-semibold">
                  {demoContent.careerWelcomeBack}:
                </span>{' '}
                <span className="tabular-nums">{careerSummary.answered}</span> spots played over{' '}
                <span className="tabular-nums">{careerSummary.sessions}</span>{' '}
                {pluralSessions(careerSummary.sessions)} &middot;{' '}
                <span className="tabular-nums">{careerSummary.accuracy}%</span> optimal &middot;{' '}
                <span className="tabular-nums">{careerSummary.openLeaks.length}</span> open{' '}
                {careerSummary.openLeaks.length === 1 ? 'leak' : 'leaks'} &middot;{' '}
                <span className="tabular-nums">
                  {careerSummary.coverageStats.mastered}/{careerSummary.coverageStats.total}
                </span>{' '}
                of the grid proven
              </p>
            )}
          </Card>
        )}

        {isFinished ? (
          <SessionSummaryPanel
            grades={history}
            kind={kind}
            career={careerSummary}
            onRestart={handleRestart}
            onRetry={startRetry}
            onSwitchMode={kind === 'explore' ? startDrill : startExplore}
            onResetHistory={resetHistory}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - the spot and the read */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-brand-text-primary">The Spot</h2>
                  <span className="text-xs text-brand-text-secondary">
                    Spot {spotIndex + 1}/{totalSpots}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                  {[spot.street, spot.position, spot.potType].map((tag) => (
                    <span key={tag} className="bg-brand-primary text-brand-text-secondary px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-brand-text-secondary mb-4">{spot.setup}</p>

                <p className="text-xs uppercase tracking-wide text-brand-text-secondary mb-2">Your hand</p>
                <div className="flex gap-2 mb-4">
                  {spot.hand.map((card) => (
                    <PlayingCard key={card} card={card} />
                  ))}
                </div>

                {spot.board.length > 0 && (
                  <>
                    <p className="text-xs uppercase tracking-wide text-brand-text-secondary mb-2">Board</p>
                    <div className="flex flex-wrap gap-2">
                      {spot.board.map((card) => (
                        <PlayingCard key={card} card={card} size="sm" />
                      ))}
                    </div>
                  </>
                )}
              </Card>

              <Card>
                <h2 className="text-xl font-bold text-brand-text-primary mb-2">
                  {opponentCopy.heading}
                </h2>
                <p className="text-xs text-brand-text-secondary mb-4">{opponentCopy.hint}</p>
                {isDealt ? (
                  <div className="flex items-center gap-2 bg-brand-accent/15 border border-brand-accent rounded-md px-4 py-3">
                    <Icon
                      name={kind === 'retry' ? 'refresh' : 'dice'}
                      size="sm"
                      className="text-brand-accent shrink-0"
                    />
                    <span className="font-semibold text-brand-accent">
                      {recommendation.opponent.label}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {opponentProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => setPickedOpponentId(profile.id)}
                        aria-pressed={opponentId === profile.id}
                        disabled={grade !== null}
                        className={`w-full text-left px-4 py-2 rounded-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                          opponentId === profile.id
                            ? 'bg-brand-accent text-brand-primary font-semibold'
                            : 'bg-brand-primary text-brand-text-secondary hover:bg-brand-primary/50'
                        }`}
                      >
                        {profile.label}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-brand-text-secondary mt-4">{recommendation.opponent.summary}</p>
              </Card>
            </div>

            {/* Right column - the decision and the feedback */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <h2 className="text-xl font-bold text-brand-text-primary mb-1">{spot.title}</h2>
                <p className="text-brand-text-secondary mb-6">{spot.question}</p>

                <div className="space-y-2 mb-6">
                  {recommendation.rows.map((row) => {
                    const isSelected = selectedActionId === row.action.id
                    const isBest = row.isExploitBest

                    let stateStyles = 'bg-brand-primary text-brand-text-primary hover:bg-brand-surface-elevated'
                    if (grade) {
                      if (isBest) {
                        stateStyles = 'bg-green-600/25 border border-green-500 text-brand-text-primary'
                      } else if (isSelected) {
                        stateStyles = 'bg-red-600/25 border border-red-500 text-brand-text-primary'
                      } else {
                        stateStyles = 'bg-brand-primary/50 text-brand-text-secondary opacity-60'
                      }
                    } else if (isSelected) {
                      stateStyles = 'bg-brand-accent/20 border border-brand-accent text-brand-text-primary'
                    }

                    return (
                      <button
                        key={row.action.id}
                        type="button"
                        onClick={() => setSelectedActionId(row.action.id)}
                        aria-pressed={isSelected}
                        disabled={grade !== null}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-md transition-all duration-200 disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${stateStyles}`}
                      >
                        <span className="font-medium">{row.action.label}</span>
                        {grade && (
                          <span className="text-sm tabular-nums text-brand-text-secondary">
                            {formatBb(row.adjustedEv)}
                            {isBest && <span className="ml-2 text-green-400">best</span>}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {!grade ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedActionId}
                    className="w-full"
                  >
                    {demoContent.submitCta}
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="w-full">
                    {isLastSpot ? demoContent.summaryHeading : demoContent.nextCta}
                  </Button>
                )}
              </Card>

              <div role="status" aria-live="polite">
                {grade && (
                  <Card className={`${verdictStyles[grade.verdict].container} border`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon
                        name={verdictStyles[grade.verdict].icon}
                        size="sm"
                        className={verdictStyles[grade.verdict].text}
                      />
                      <span className={`font-semibold ${verdictStyles[grade.verdict].text}`}>
                        {demoContent.verdicts[grade.verdict]}
                      </span>
                      {grade.evLoss > 0 && (
                        <span className="text-sm text-brand-text-secondary tabular-nums">
                          {formatBb(-grade.evLoss)} vs the best line
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-brand-text-secondary mb-2">
                      Against {recommendation.opponent.shortLabel}, the highest-EV play is{' '}
                      <span className="text-brand-accent font-semibold">{bestRow.action.label}</span>.
                    </p>
                    <p className="text-sm text-brand-text-secondary">
                      <span className="text-brand-text-primary font-semibold">Baseline: </span>
                      {spot.baselineNote}
                    </p>
                  </Card>
                )}
              </div>

              {grade && (
                <>
                  <Card>
                    <h2 className="text-xl font-bold text-brand-text-primary mb-4">
                      {demoContent.baselineHeading}
                    </h2>
                    <div className="bg-brand-primary p-4 rounded-md space-y-3">
                      {recommendation.rows.map((row) => (
                        <div key={row.action.id} className="flex items-center justify-between gap-4">
                          <span className="text-brand-text-secondary text-sm">{row.action.label}</span>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-24 sm:w-48 bg-brand-surface rounded-full h-3">
                              <div
                                className={`h-3 rounded-full ${row.isBaselineBest ? 'bg-brand-accent' : 'bg-brand-text-secondary'}`}
                                style={{ width: `${row.frequency}%` }}
                              />
                            </div>
                            <span
                              className={`text-sm font-semibold tabular-nums w-10 text-right ${
                                row.isBaselineBest ? 'text-brand-accent' : 'text-brand-text-secondary'
                              }`}
                            >
                              {row.frequency}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card variant="accent">
                    <h2 className="text-xl font-bold text-brand-text-primary mb-4">
                      {demoContent.exploitHeading} vs {recommendation.opponent.shortLabel}
                    </h2>
                    <div className="space-y-3 text-brand-text-secondary">
                      {recommendation.notes.map((note) => (
                        <div key={note} className="flex items-start">
                          <span className="text-brand-accent mr-2" aria-hidden="true">
                            &#9656;
                          </span>
                          <span>{note}</span>
                        </div>
                      ))}
                      <div className="flex items-start">
                        <span className="text-brand-accent mr-2" aria-hidden="true">
                          &#9656;
                        </span>
                        <span>
                          {recommendation.isDeviation ? (
                            <>
                              Deviation: {bestRow.action.label} instead of the baseline{' '}
                              {baselineRow.action.label}, worth{' '}
                              <span className="text-brand-accent font-semibold tabular-nums">
                                {formatBb(recommendation.evGain)}
                              </span>{' '}
                              per hand.
                            </>
                          ) : (
                            <>
                              No deviation: {baselineRow.action.label} is still the max-EV line
                              {recommendation.evGain > 0 ? '' : ' here'}.
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-brand-text-primary mb-4">{demoContent.ctaTitle}</h2>
            <p className="text-brand-text-secondary mb-6">{demoContent.ctaDescription}</p>
            <Button href="/early-access" size="lg">
              {demoContent.cta}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface SessionSummaryPanelProps {
  grades: Grade[]
  kind: SessionKind
  /** Lifetime numbers, already including the session being recapped. */
  career: CareerSummary
  onRestart: () => void
  onRetry: (hands: DealtHand[]) => void
  onSwitchMode: () => void
  onResetHistory: () => void
}

const restartCtas: Record<SessionKind, string> = {
  explore: demoContent.restartCta,
  drill: demoContent.newDrillCta,
  retry: demoContent.retryAgainCta,
}

function SessionSummaryPanel({
  grades,
  kind,
  career,
  onRestart,
  onRetry,
  onSwitchMode,
  onResetHistory,
}: SessionSummaryPanelProps) {
  const summary = useMemo(() => summarizeSession(grades), [grades])
  const review = useMemo(() => reviewSession(grades), [grades])
  const biggestLeak = useMemo(() => findBiggestLeak(review), [review])
  const byOpponent = useMemo(() => summarizeByOpponent(review), [review])
  const retryHands = useMemo(() => buildRetryDrill(review), [review])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card variant="accent" className="text-center">
        <h2 className="text-3xl font-bold text-brand-text-primary mb-6">{demoContent.summaryHeading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-4xl font-bold text-brand-accent tabular-nums">{summary.accuracy}%</p>
            <p className="text-sm text-brand-text-secondary">Optimal lines</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-brand-text-primary tabular-nums">
              {summary.optimal}/{summary.answered}
            </p>
            <p className="text-sm text-brand-text-secondary">Spots nailed</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-brand-text-primary tabular-nums">
              {formatBb(-summary.evLost)}
            </p>
            <p className="text-sm text-brand-text-secondary">EV left on the table</p>
          </div>
        </div>
        <p className="text-brand-text-secondary mb-8 max-w-xl mx-auto">{demoContent.summaryLead}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {retryHands.length > 0 && (
            <Button onClick={() => onRetry(retryHands)}>
              {demoContent.retryCta} ({retryHands.length})
            </Button>
          )}
          <Button variant="outline" onClick={onRestart}>
            {restartCtas[kind]}
          </Button>
          <Button variant="outline" onClick={onSwitchMode}>
            {kind === 'explore' ? demoContent.drillModeLabel : demoContent.pickReadCta}
          </Button>
        </div>
        {retryHands.length > 0 && (
          <p className="text-xs text-brand-text-secondary mt-4">{demoContent.retryHint}</p>
        )}
      </Card>

      {biggestLeak ? (
        <Card className="border border-red-600/40 bg-red-900/10">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="scale" size="sm" className="text-red-400" />
            <h3 className="font-semibold text-brand-text-primary">{demoContent.leakHeading}</h3>
            <span className="text-sm text-red-400 tabular-nums">
              {formatBb(-biggestLeak.grade.evLoss)}
            </span>
          </div>
          <p className="text-sm text-brand-text-secondary">
            <span className="text-brand-text-primary font-semibold">{biggestLeak.spot.title}</span> vs{' '}
            {biggestLeak.opponent.shortLabel}: you chose {biggestLeak.chosenLabel}, but{' '}
            <span className="text-brand-accent font-semibold">{biggestLeak.bestLabel}</span> is the
            highest-EV line against that read.
          </p>
        </Card>
      ) : (
        <Card className="border border-green-600/40 bg-green-900/10">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="check" size="sm" className="text-green-400" />
            <h3 className="font-semibold text-brand-text-primary">{demoContent.cleanSheetHeading}</h3>
          </div>
          <p className="text-sm text-brand-text-secondary">{demoContent.cleanSheetNote}</p>
        </Card>
      )}

      {career.sessions > 0 && (
        <CareerPanel career={career} onRetry={onRetry} onResetHistory={onResetHistory} />
      )}

      <Card>
        <h3 className="text-xl font-bold text-brand-text-primary mb-1">{demoContent.byReadHeading}</h3>
        <p className="text-xs text-brand-text-secondary mb-4">{demoContent.byReadHint}</p>
        <ul className="space-y-2">
          {byOpponent.map((breakdown) => (
            <OpponentBreakdownItem key={breakdown.opponent.id} breakdown={breakdown} />
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="text-xl font-bold text-brand-text-primary mb-1">{demoContent.reviewHeading}</h3>
        <p className="text-xs text-brand-text-secondary mb-4">{demoContent.reviewHint}</p>
        <ol className="space-y-3">
          {review.map((row, index) => (
            <ReviewListItem key={`${row.spot.id}-${index}`} row={row} index={index} />
          ))}
        </ol>
      </Card>
    </div>
  )
}

interface CareerPanelProps {
  career: CareerSummary
  onRetry: (hands: DealtHand[]) => void
  onResetHistory: () => void
}

/**
 * The long-term half of the recap: what this browser has played across every
 * visit, which read is still winning, and the leaks that remain open.
 */
function CareerPanel({ career, onRetry, onResetHistory }: CareerPanelProps) {
  const leakHands = useMemo(() => buildRetryDrill(career.openLeaks), [career.openLeaks])
  const trend =
    career.latestAccuracy !== null && career.priorAccuracy !== null
      ? career.latestAccuracy - career.priorAccuracy
      : null

  return (
    <Card variant="elevated">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-xl font-bold text-brand-text-primary">{demoContent.careerHeading}</h3>
        <Button variant="ghost" size="sm" onClick={onResetHistory}>
          {demoContent.careerResetCta}
        </Button>
      </div>
      <p className="text-xs text-brand-text-secondary mb-6">{demoContent.careerHint}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <CareerStat
          label={demoContent.careerSpotsLabel}
          value={`${career.answered}`}
          note={`${career.sessions} ${pluralSessions(career.sessions)}`}
        />
        <CareerStat label={demoContent.careerAccuracyLabel} value={`${career.accuracy}%`} />
        <CareerStat label={demoContent.careerEvLabel} value={formatBb(-career.evLost)} />
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between gap-3 bg-brand-primary rounded-md px-4 py-3">
          <span className="text-sm text-brand-text-secondary">{demoContent.careerTrendLabel}</span>
          {trend === null ? (
            <span className="text-xs text-brand-text-secondary text-right">
              {demoContent.careerFirstSessionNote}
            </span>
          ) : (
            <span
              className={`text-sm font-semibold tabular-nums shrink-0 ${
                trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-brand-text-secondary'
              }`}
            >
              {trend > 0 ? '+' : ''}
              {trend} pts
            </span>
          )}
        </div>

        {career.toughestRead && (
          <div className="flex items-center justify-between gap-3 bg-brand-primary rounded-md px-4 py-3">
            <span className="text-sm text-brand-text-secondary">
              {demoContent.careerToughestReadLabel}
            </span>
            <span className="text-sm font-semibold text-brand-text-primary shrink-0">
              {career.toughestRead.opponent.shortLabel}{' '}
              <span className="text-brand-text-secondary tabular-nums font-normal">
                {formatBb(-career.toughestRead.evLost)}
              </span>
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 bg-brand-primary rounded-md px-4 py-3">
          <span className="text-sm text-brand-text-secondary">{demoContent.careerClosedLabel}</span>
          <span className="text-sm font-semibold text-green-400 tabular-nums shrink-0">
            {career.closedLeaks}
          </span>
        </div>
        <p className="text-xs text-brand-text-secondary">{demoContent.careerClosedNote}</p>
      </div>

      <CoverageGrid coverage={career.coverage} stats={career.coverageStats} />

      {career.openLeaks.length > 0 ? (
        <>
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <h4 className="font-semibold text-brand-text-primary">{demoContent.careerOpenLabel}</h4>
            <span className="text-sm font-semibold text-red-400 tabular-nums">
              {career.openLeaks.length}
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mb-3">{demoContent.careerOpenNote}</p>
          <ul className="space-y-2 mb-4">
            {career.openLeaks.map((row) => (
              <OpenLeakItem key={`${row.spot.id}-${row.grade.opponentId}`} row={row} />
            ))}
          </ul>
          <Button onClick={() => onRetry(leakHands)} className="w-full">
            {demoContent.leakModeLabel} ({leakHands.length})
          </Button>
        </>
      ) : (
        <p className="text-sm text-brand-text-secondary">
          <span className="text-green-400 font-semibold">{demoContent.careerNoLeaksHeading}: </span>
          {demoContent.careerNoLeaksNote}
        </p>
      )}
    </Card>
  )
}

interface CoverageGridProps {
  coverage: CoverageCell[]
  stats: CoverageSummary
}

const coverageStyles: Record<CoverageStatus, { swatch: string; label: string }> = {
  mastered: {
    swatch: 'bg-green-600/40 border-green-500/70 text-green-200',
    label: demoContent.coverageProvenLabel,
  },
  open: {
    swatch: 'bg-red-600/40 border-red-500/70 text-red-200',
    label: demoContent.coverageOpenLabel,
  },
  untested: {
    swatch: 'bg-brand-surface border-brand-text-secondary/30 text-brand-text-secondary',
    label: demoContent.coverageUntestedLabel,
  },
}

/** Legend order: what you have proven, what you owe, what you have not seen. */
const coverageLegend: CoverageStatus[] = ['mastered', 'open', 'untested']

/** `buildCoverage` returns the grid spot-major, so this keeps the authored order. */
function groupCoverageBySpot(coverage: CoverageCell[]): CoverageCell[][] {
  const bySpot = new Map<string, CoverageCell[]>()

  for (const cell of coverage) {
    const cells = bySpot.get(cell.spot.id)

    if (cells) {
      cells.push(cell)
    } else {
      bySpot.set(cell.spot.id, [cell])
    }
  }

  return [...bySpot.values()]
}

/**
 * The whole spot-by-read grid, one cell per pairing.
 *
 * The open-leak list says what a visitor got wrong; this says what they have
 * not answered at all, which is the thing a session recap could never show. It
 * is also the order drill mode now deals in, so the gaps double as a plan.
 */
function CoverageGrid({ coverage, stats }: CoverageGridProps) {
  const rows = useMemo(() => groupCoverageBySpot(coverage), [coverage])
  const counts: Record<CoverageStatus, number> = {
    mastered: stats.mastered,
    open: stats.open,
    untested: stats.untested,
  }

  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h4 className="font-semibold text-brand-text-primary">{demoContent.coverageHeading}</h4>
        <span className="text-sm font-semibold text-brand-accent tabular-nums shrink-0">
          {stats.mastered}/{stats.total}
        </span>
      </div>
      <p className="text-xs text-brand-text-secondary mb-3">{demoContent.coverageHint}</p>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 bg-brand-surface rounded-full h-2">
          <div
            className="h-2 rounded-full bg-brand-accent"
            style={{ width: `${stats.percentMastered}%` }}
          />
        </div>
        <span className="text-xs text-brand-text-secondary tabular-nums shrink-0">
          {stats.percentMastered}% {demoContent.coverageProgressLabel}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0.5 sm:border-spacing-1 text-[10px] sm:text-xs">
          <caption className="sr-only">{demoContent.coverageHint}</caption>
          <thead>
            <tr>
              <th scope="col" className="text-left font-normal text-brand-text-secondary">
                {demoContent.coverageSpotColumnLabel}
              </th>
              {opponentProfiles.map((profile) => (
                <th
                  key={profile.id}
                  scope="col"
                  className="px-1 font-normal text-brand-text-secondary whitespace-nowrap"
                >
                  {profile.shortLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells) => (
              <tr key={cells[0].spot.id}>
                <th scope="row" className="text-left font-normal">
                  <span
                    className="block max-w-[5rem] sm:max-w-[14rem] truncate text-brand-text-primary"
                    title={cells[0].spot.title}
                  >
                    {cells[0].spot.title}
                  </span>
                  <span className="block text-brand-text-secondary">{cells[0].spot.street}</span>
                </th>
                {cells.map((cell) => (
                  <td key={cell.opponent.id} className="p-0">
                    <CoverageCellBox cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-brand-text-secondary">
        {coverageLegend.map((status) => (
          <span key={status} className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded border ${coverageStyles[status].swatch}`}
              aria-hidden="true"
            />
            {coverageStyles[status].label}
            <span className="tabular-nums font-semibold">{counts[status]}</span>
          </span>
        ))}
      </div>
      <p className="text-xs text-brand-text-secondary mt-2">
        {stats.untested === 0 && stats.open === 0
          ? demoContent.coverageCompleteNote
          : demoContent.coverageRemainingNote}
      </p>
      <p className="text-xs text-brand-text-secondary mt-1">{demoContent.coverageDeviationNote}</p>
    </div>
  )
}

/** One pairing. Starred when the read moves the answer off the baseline. */
function CoverageCellBox({ cell }: { cell: CoverageCell }) {
  const styles = coverageStyles[cell.status]
  const description = [
    `${cell.spot.title} vs ${cell.opponent.shortLabel}`,
    styles.label,
    cell.status === 'open' ? formatBb(-cell.evLost) : null,
    cell.isDeviation ? demoContent.coverageDeviationLabel : null,
  ]
    .filter((part): part is string => part !== null)
    .join(' \u00b7 ')

  return (
    <span
      role="img"
      aria-label={description}
      title={description}
      className={`flex h-7 min-w-[2rem] sm:min-w-[2.5rem] items-center justify-center rounded border text-[10px] font-bold ${styles.swatch}`}
    >
      {cell.isDeviation ? '*' : ''}
    </span>
  )
}

interface CareerStatProps {
  label: string
  value: string
  note?: string
}

function CareerStat({ label, value, note }: CareerStatProps) {
  return (
    <div className="bg-brand-primary rounded-md px-4 py-3">
      <p className="text-2xl font-bold text-brand-text-primary tabular-nums">{value}</p>
      <p className="text-xs text-brand-text-secondary">{label}</p>
      {note && <p className="text-xs text-brand-text-secondary tabular-nums">{note}</p>}
    </div>
  )
}

/** One still-unsolved pairing, named so the visitor knows what they owe. */
function OpenLeakItem({ row }: { row: ReviewRow }) {
  return (
    <li className="flex items-start justify-between gap-3 bg-brand-primary rounded-md px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-brand-text-primary">{row.spot.title}</p>
        <p className="text-xs text-brand-text-secondary">
          vs {row.opponent.shortLabel} &middot; you played {row.chosenLabel}, best is{' '}
          <span className="text-brand-accent font-semibold">{row.bestLabel}</span>
        </p>
      </div>
      <span className="text-sm font-semibold text-red-400 tabular-nums shrink-0">
        {formatBb(-row.grade.evLoss)}
      </span>
    </li>
  )
}

interface ReviewListItemProps {
  row: ReviewRow
  index: number
}

function ReviewListItem({ row, index }: ReviewListItemProps) {
  const styles = verdictStyles[row.grade.verdict]
  const isOptimal = row.grade.verdict === 'optimal'

  return (
    <li className="bg-brand-primary rounded-md p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2 min-w-0">
          <Icon name={styles.icon} size="sm" className={`${styles.text} mt-0.5 shrink-0`} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-text-primary">
              {index + 1}. {row.spot.title}
            </p>
            <p className="text-xs text-brand-text-secondary">
              {row.spot.street} &middot; vs {row.opponent.shortLabel}
              {row.wasDeviation && ' \u00b7 read overrides the baseline'}
            </p>
          </div>
        </div>
        <span className={`text-sm font-semibold tabular-nums shrink-0 ${styles.text}`}>
          {isOptimal ? formatBb(0) : formatBb(-row.grade.evLoss)}
        </span>
      </div>
      <p className="text-sm text-brand-text-secondary pl-6">
        You played <span className="text-brand-text-primary">{row.chosenLabel}</span>
        {isOptimal ? (
          <> &mdash; the max-EV line.</>
        ) : (
          <>
            {' '}
            &middot; best was <span className="text-brand-accent font-semibold">{row.bestLabel}</span>
          </>
        )}
      </p>
    </li>
  )
}

interface ModeOptionProps {
  icon: 'target' | 'dice' | 'refresh'
  label: string
  hint: string
  isActive: boolean
  onSelect: () => void
}

function ModeOption({ icon, label, hint, isActive, onSelect }: ModeOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={`text-left p-4 rounded-md border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
        isActive
          ? 'bg-brand-accent/15 border-brand-accent'
          : 'bg-brand-primary border-transparent hover:border-brand-accent/40'
      }`}
    >
      <span className="flex items-center gap-2 mb-1">
        <Icon
          name={icon}
          size="sm"
          className={isActive ? 'text-brand-accent' : 'text-brand-text-secondary'}
        />
        <span className={`font-semibold ${isActive ? 'text-brand-accent' : 'text-brand-text-primary'}`}>
          {label}
        </span>
      </span>
      <span className="block text-xs text-brand-text-secondary">{hint}</span>
    </button>
  )
}

interface OpponentBreakdownItemProps {
  breakdown: OpponentBreakdown
}

function OpponentBreakdownItem({ breakdown }: OpponentBreakdownItemProps) {
  const isClean = breakdown.evLost <= 0

  return (
    <li className="flex items-center justify-between gap-3 bg-brand-primary rounded-md px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-brand-text-primary truncate">
          {breakdown.opponent.label}
        </p>
        <p className="text-xs text-brand-text-secondary">
          {breakdown.optimal}/{breakdown.answered} optimal
          {breakdown.testedDeviation && ` · ${demoContent.byReadDeviationNote}`}
        </p>
      </div>
      <span
        className={`text-sm font-semibold tabular-nums shrink-0 ${
          isClean ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {formatBb(-breakdown.evLost)}
      </span>
    </li>
  )
}
