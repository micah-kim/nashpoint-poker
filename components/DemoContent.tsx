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
  MAX_STORED_SESSIONS,
  saveHistory,
  summarizeCareer,
  type CareerSummary,
  type SessionLogEntry,
  type TrainingForm,
  type TrainingHistory,
} from '@/lib/progress'
import {
  buildConfirmDrill,
  buildCoverageDrill,
  buildRefreshDrill,
  buildRetryDrill,
  buildTendencyDrill,
  drillFocuses,
  findBiggestLeak,
  getOpponentProfile,
  getRecommendation,
  gradeAnswer,
  isReadFocus,
  missDirection,
  planNextSession,
  readFocuses,
  reviewSession,
  summarizeByOpponent,
  summarizeSession,
  type CoverageCell,
  type CoverageStatus,
  type CoverageSummary,
  type DealtHand,
  type DrillFocus,
  type Grade,
  type OpponentBreakdown,
  type PlanQueue,
  type ReadProgress,
  type ReviewRow,
  type SessionKind,
  type StreetProgress,
  type StreetTendency,
  type TendencyDirection,
  type TendencySide,
  type TendencySummary,
  type TrainingPlan,
  type Verdict,
} from '@/lib/trainer'

const verdictStyles: Record<Verdict, { container: string; text: string; icon: 'check' | 'target' | 'scale' }> = {
  optimal: { container: 'bg-green-900/30 border-green-600/50', text: 'text-green-400', icon: 'check' },
  close: { container: 'bg-brand-accent/15 border-brand-accent/50', text: 'text-brand-accent', icon: 'target' },
  mistake: { container: 'bg-red-900/30 border-red-600/50', text: 'text-red-400', icon: 'scale' },
}

/**
 * How each miss direction is named and drilled.
 *
 * Mirrors `verdictStyles`: the strategy logic hands back a direction, and every
 * label, hint, and CTA a visitor reads for it lives here.
 */
const tendencyCopy: Record<
  TendencyDirection,
  { label: string; note: string; drillCta: string; icon: 'arrow-down' | 'arrow-up' }
> = {
  passive: {
    label: demoContent.tendencyPassiveLabel,
    note: demoContent.tendencyPassiveNote,
    drillCta: demoContent.tendencyDrillPassiveCta,
    icon: 'arrow-down',
  },
  aggressive: {
    label: demoContent.tendencyAggressiveLabel,
    note: demoContent.tendencyAggressiveNote,
    drillCta: demoContent.tendencyDrillAggressiveCta,
    icon: 'arrow-up',
  },
}

/**
 * Column count for the mode picker, keyed by how many modes are on offer.
 *
 * Four options are too narrow to sit in one row on a small tablet, so that
 * case stays two-up until there is desktop width for it.
 */
const modeColumns: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-3',
}

/** A dealt run of hands: a coverage drill, or a replay of the ones you missed. */
interface DealtSession {
  kind: Exclude<SessionKind, 'explore'>
  hands: DealtHand[]
}

function pluralSessions(count: number): string {
  return count === 1 ? demoContent.careerSessionLabel : demoContent.careerSessionsLabel
}

function pluralMisses(count: number): string {
  return count === 1 ? demoContent.tendencyMistakeSingularLabel : demoContent.tendencyMistakeLabel
}

function pluralPairings(count: number): string {
  return count === 1 ? demoContent.planPairingLabel : demoContent.planPairingsLabel
}

function pluralDays(count: number): string {
  return count === 1 ? demoContent.planNextReviewDayLabel : demoContent.planNextReviewDaysLabel
}

/**
 * How long ago a session was, in words.
 *
 * Returns null for an undated session rather than guessing at one: the log is
 * rendered before the clock is read on mount, and "today" would be a claim the
 * component cannot make yet.
 */
function formatDaysAgo(daysAgo: number | null): string | null {
  if (daysAgo === null) return null
  if (daysAgo === 0) return demoContent.formTodayLabel
  if (daysAgo === 1) return demoContent.formYesterdayLabel

  return `${daysAgo} ${demoContent.formDaysAgoLabel}`
}

/**
 * How a live focus names itself in the UI.
 *
 * A street focus is already its own label; a read focus is an opponent id, so
 * it has to be resolved back to the profile a visitor recognises.
 */
function focusLabel(focus: DrillFocus): string {
  if (focus === 'all') return demoContent.focusAllLabel

  return isReadFocus(focus) ? getOpponentProfile(focus).label : focus
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
  /** Street or read the next drill is aimed at. Sticky, so re-dealing stays on it. */
  const [focus, setFocus] = useState<DrillFocus>('all')
  const [pickedOpponentId, setPickedOpponentId] = useState<OpponentId>('tag')
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [history, setHistory] = useState<Grade[]>([])
  const [isFinished, setIsFinished] = useState(false)
  /** Everything this browser has played before, loaded after mount. */
  const [career, setCareer] = useState<TrainingHistory>(emptyHistory)
  /**
   * The clock the coverage grid ages against, read once after mount.
   *
   * Held in state rather than called inside the `useMemo` below because that
   * memo runs during render: a `Date.now()` there would differ between the
   * server and the client and break hydration, the same reason the history
   * itself is loaded in an effect. Null until mount, which is exactly the
   * "nothing has aged yet" case `summarizeCareer` already handles.
   */
  const [now, setNow] = useState<number | null>(null)

  // Storage and the clock are both client-only, so the first render has to
  // match the server's empty, un-aged history and fill in afterwards.
  useEffect(() => {
    setCareer(loadHistory())
    setNow(Date.now())
  }, [])

  const careerSummary = useMemo(() => summarizeCareer(career, now ?? undefined), [career, now])
  const leakHands = useMemo(
    () => buildRetryDrill(careerSummary.openLeaks),
    [careerSummary.openLeaks],
  )
  /** Pairings nailed exactly once, which a second rep either proves or exposes. */
  const confirmHands = useMemo(
    () => buildConfirmDrill(careerSummary.coverage),
    [careerSummary.coverage],
  )
  /** Pairings proven long enough ago that the proof has expired. */
  const refreshHands = useMemo(
    () => buildRefreshDrill(careerSummary.coverage),
    [careerSummary.coverage],
  )
  /** The one queue worth clearing next, named from the grid rather than chosen. */
  const plan = useMemo(() => planNextSession(careerSummary.coverage), [careerSummary.coverage])

  const kind: SessionKind = dealt?.kind ?? 'explore'
  const isDealt = dealt !== null
  /** Only a live drill is focused; the other modes ignore the focus. */
  const activeFocus: DrillFocus | null = kind === 'drill' ? focus : null
  /** Explore and drill are always offered; the other three have to be earned. */
  const modeCount =
    2 +
    (leakHands.length > 0 ? 1 : 0) +
    (confirmHands.length > 0 ? 1 : 0) +
    (refreshHands.length > 0 ? 1 : 0)
  const activeModeNote =
    kind === 'retry'
      ? demoContent.retryActiveNote
      : kind === 'confirm'
        ? demoContent.confirmActiveNote
        : kind === 'refresh'
          ? demoContent.refreshActiveNote
          : demoContent.modeSwitchNote
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
    confirm: {
      heading: demoContent.confirmOpponentHeading,
      hint: demoContent.confirmOpponentHint,
    },
    refresh: {
      heading: demoContent.refreshOpponentHeading,
      hint: demoContent.refreshOpponentHint,
    },
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
    const completedAt = Date.now()
    const next = appendSession(career, { kind, completedAt, grades })

    setCareer(next)
    saveHistory(next)
    // Re-read the clock the grid ages against, so a pairing just proven is
    // dated from the session that proved it rather than from page load. Without
    // this a long visit keeps ageing against a stale `now`, and a pairing
    // proven after mount reports a day more freshness than it earned.
    setNow(completedAt)
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
   * then the ones still open, narrowed to the focused street. Seeded from the
   * clock inside the handler, never during render -- a random deal computed on
   * the server would not match the client on hydration.
   *
   * A focus with nothing to deal leaves the session alone rather than dealing
   * an empty drill. The chips only offer streets and reads that have pairings,
   * so this is a guard rather than a reachable state.
   */
  function startDrill(nextFocus: DrillFocus) {
    const hands = buildCoverageDrill(careerSummary.coverage, Date.now(), nextFocus)

    if (hands.length === 0) return

    setFocus(nextFocus)
    setDealt({ kind: 'drill', hands })
    resetSession()
  }

  function startExplore() {
    setDealt(null)
    resetSession()
  }

  /** Runs a pre-built list of hands, ignoring the street focus a drill uses. */
  function startDealt(kind: DealtSession['kind'], hands: DealtHand[]) {
    if (hands.length === 0) return

    setDealt({ kind, hands })
    resetSession()
  }

  /** Deals the hands a finished session gave up EV on, so a leak gets replayed. */
  function startRetry(hands: DealtHand[]) {
    startDealt('retry', hands)
  }

  /**
   * Deals the pairings this browser has found the right line in exactly once.
   *
   * Distinct from a retry: nothing here is costing the visitor EV right now,
   * so there is no leak to replay. What a second rep settles is whether the
   * first one was knowledge or a guess at one of two to four lines.
   */
  function startConfirmDrill() {
    startDealt('confirm', confirmHands)
  }

  /**
   * Deals the pairings whose proof has expired, most faded first.
   *
   * Distinct from a confirm run as well as a retry: these were proven, twice
   * in a row, and nothing about them is open. All that happened is that time
   * passed -- which is the one thing a history of right answers cannot tell a
   * visitor on its own.
   */
  function startRefreshDrill() {
    startDealt('refresh', refreshHands)
  }

  /**
   * Deals the leaks still open across every stored session, not just the one
   * just played. Shares the 'retry' kind with a session recap's retry: same
   * hands, same read, second look -- only the source of the list differs.
   */
  function startLeakDrill() {
    startRetry(leakHands)
  }

  /**
   * Starts whichever drill `planNextSession` put at the front of the queue.
   *
   * The drill case deals over the whole grid rather than the focused street,
   * because the plan is a read on the whole grid: a turn-focused deal could
   * hand back pairings the recommendation was not about.
   */
  function startPlan(nextPlan: TrainingPlan) {
    if (nextPlan.kind === 'retry') {
      startLeakDrill()
      return
    }

    if (nextPlan.kind === 'confirm') {
      startConfirmDrill()
      return
    }

    if (nextPlan.kind === 'refresh') {
      startRefreshDrill()
      return
    }

    startDrill('all')
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
      startDrill(focus)
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
            <NextUpPanel plan={plan} onStart={startPlan} className="mb-5" />
            <p className="text-xs uppercase tracking-wide text-brand-text-secondary mb-3">
              {demoContent.modeHeading}
            </p>
            <div className={`grid grid-cols-1 gap-3 ${modeColumns[modeCount]}`}>
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
                onSelect={() => startDrill(focus)}
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
              {/* Only offered once a pairing is sitting on a single clean rep. */}
              {confirmHands.length > 0 && (
                <ModeOption
                  icon="check"
                  label={`${demoContent.confirmModeLabel} (${confirmHands.length})`}
                  hint={demoContent.confirmModeHint}
                  isActive={kind === 'confirm'}
                  onSelect={startConfirmDrill}
                />
              )}
              {/* Only offered once a proven pairing has gone long enough unplayed. */}
              {refreshHands.length > 0 && (
                <ModeOption
                  icon="clock"
                  label={`${demoContent.refreshModeLabel} (${refreshHands.length})`}
                  hint={demoContent.refreshModeHint}
                  isActive={kind === 'refresh'}
                  onSelect={startRefreshDrill}
                />
              )}
            </div>
            <FocusPicker
              activeFocus={activeFocus}
              streetProgress={careerSummary.streetProgress}
              readProgress={careerSummary.readProgress}
              coverageStats={careerSummary.coverageStats}
              onSelect={startDrill}
            />
            <p className="text-xs text-brand-text-secondary mt-3">
              {activeModeNote}
            </p>
            {activeFocus && activeFocus !== 'all' && (
              <p className="text-xs text-brand-accent mt-1">
                {focusLabel(activeFocus)}{' '}
                {isReadFocus(activeFocus)
                  ? demoContent.readFocusActiveNote
                  : demoContent.focusActiveNote}
              </p>
            )}
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
                {careerSummary.coverageStats.stale > 0 && (
                  <>
                    {' '}
                    &middot;{' '}
                    <span className="tabular-nums text-brand-accent">
                      {careerSummary.coverageStats.stale}
                    </span>{' '}
                    due for review
                  </>
                )}
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
            onConfirm={startConfirmDrill}
            onRefresh={startRefreshDrill}
            onSwitchMode={kind === 'explore' ? () => startDrill(focus) : startExplore}
            onResetHistory={resetHistory}
            onStartPlan={startPlan}
            onDrillFocus={startDrill}
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
  onConfirm: () => void
  onRefresh: () => void
  onSwitchMode: () => void
  onResetHistory: () => void
  /** Starts the drill `planNextSession` recommends from the career panel. */
  onStartPlan: (plan: TrainingPlan) => void
  /** Deals a focused drill from the career panel's read-by-read breakdown. */
  onDrillFocus: (focus: DrillFocus) => void
}

const restartCtas: Record<SessionKind, string> = {
  explore: demoContent.restartCta,
  drill: demoContent.newDrillCta,
  retry: demoContent.retryAgainCta,
  confirm: demoContent.confirmAgainCta,
  refresh: demoContent.refreshAgainCta,
}

function SessionSummaryPanel({
  grades,
  kind,
  career,
  onRestart,
  onRetry,
  onConfirm,
  onRefresh,
  onSwitchMode,
  onResetHistory,
  onStartPlan,
  onDrillFocus,
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
        <CareerPanel
          career={career}
          onRetry={onRetry}
          onConfirm={onConfirm}
          onRefresh={onRefresh}
          onResetHistory={onResetHistory}
          onStartPlan={onStartPlan}
          onDrillFocus={onDrillFocus}
        />
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
  onConfirm: () => void
  onRefresh: () => void
  onResetHistory: () => void
  onStartPlan: (plan: TrainingPlan) => void
  onDrillFocus: (focus: DrillFocus) => void
}

/**
 * The long-term half of the recap: what this browser has played across every
 * visit, which read is still winning, and the leaks that remain open.
 */
function CareerPanel({
  career,
  onRetry,
  onConfirm,
  onRefresh,
  onResetHistory,
  onStartPlan,
  onDrillFocus,
}: CareerPanelProps) {
  const leakHands = useMemo(() => buildRetryDrill(career.openLeaks), [career.openLeaks])
  const confirmHands = useMemo(() => buildConfirmDrill(career.coverage), [career.coverage])
  const refreshHands = useMemo(() => buildRefreshDrill(career.coverage), [career.coverage])
  /**
   * The lifetime tendency is measured over every answer ever given, but a
   * drill can only deal what is still open -- replaying a pairing correctly
   * closes it without unmaking the habit that lost it the first time. So this
   * list can be empty while the bias above it is not.
   */
  const biasHands = useMemo(
    () =>
      career.tendency.bias
        ? buildTendencyDrill(career.openLeaks, career.tendency.bias.direction)
        : [],
    [career.openLeaks, career.tendency.bias],
  )
  const plan = useMemo(() => planNextSession(career.coverage), [career.coverage])

  return (
    <Card variant="elevated">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-xl font-bold text-brand-text-primary">{demoContent.careerHeading}</h3>
        <Button variant="ghost" size="sm" onClick={onResetHistory}>
          {demoContent.careerResetCta}
        </Button>
      </div>
      <p className="text-xs text-brand-text-secondary mb-4">{demoContent.careerHint}</p>

      <NextUpPanel plan={plan} onStart={onStartPlan} className="mb-6" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <CareerStat
          label={demoContent.careerSpotsLabel}
          value={`${career.answered}`}
          note={`${career.sessions} ${pluralSessions(career.sessions)}`}
        />
        <CareerStat label={demoContent.careerAccuracyLabel} value={`${career.accuracy}%`} />
        <CareerStat label={demoContent.careerEvLabel} value={formatBb(-career.evLost)} />
      </div>

      <TrainingLogPanel form={career.form} />

      <div className="space-y-2 mb-6">
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

        {career.coverageStats.stale > 0 && (
          <>
            <div className="flex items-center justify-between gap-3 bg-brand-primary rounded-md px-4 py-3">
              <span className="text-sm text-brand-text-secondary">
                {demoContent.careerDueLabel}
              </span>
              <span className="text-sm font-semibold text-brand-accent tabular-nums shrink-0">
                {career.coverageStats.stale}
              </span>
            </div>
            <p className="text-xs text-brand-text-secondary">{demoContent.careerDueNote}</p>
          </>
        )}

        <div className="flex items-center justify-between gap-3 bg-brand-primary rounded-md px-4 py-3">
          <span className="text-sm text-brand-text-secondary">{demoContent.careerClosedLabel}</span>
          <span className="text-sm font-semibold text-green-400 tabular-nums shrink-0">
            {career.closedLeaks}
          </span>
        </div>
        <p className="text-xs text-brand-text-secondary">{demoContent.careerClosedNote}</p>
      </div>

      <CoverageGrid
        coverage={career.coverage}
        stats={career.coverageStats}
        confirmHands={confirmHands}
        refreshHands={refreshHands}
        onConfirm={onConfirm}
        onRefresh={onRefresh}
      />

      <StreetProgressPanel streetProgress={career.streetProgress} />

      <ReadProgressPanel readProgress={career.readProgress} onDrill={onDrillFocus} />

      <TendencyPanel
        tendency={career.tendency}
        drillHands={biasHands}
        onRetry={onRetry}
        className="mb-6"
      />

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
  /** Pairings one clean rep short of proven. Empty hides the confirm CTA. */
  confirmHands: DealtHand[]
  /** Pairings whose proof has expired. Empty hides the review CTA. */
  refreshHands: DealtHand[]
  onConfirm: () => void
  onRefresh: () => void
}

const coverageStyles: Record<CoverageStatus, { swatch: string; label: string }> = {
  mastered: {
    swatch: 'bg-green-600/40 border-green-500/70 text-green-200',
    label: demoContent.coverageProvenLabel,
  },
  learning: {
    swatch: 'bg-brand-accent/25 border-brand-accent/60 text-brand-accent',
    label: demoContent.coverageLearningLabel,
  },
  open: {
    swatch: 'bg-red-600/40 border-red-500/70 text-red-200',
    label: demoContent.coverageOpenLabel,
  },
  untested: {
    swatch: 'bg-brand-surface border-brand-text-secondary/30 text-brand-text-secondary',
    label: demoContent.coverageUntestedLabel,
  },
  stale: {
    swatch: 'bg-brand-accent/10 border-brand-accent/40 border-dashed text-brand-accent',
    label: demoContent.coverageStaleLabel,
  },
}

/**
 * Legend order: what you have proven, what has gone cold, what is one rep
 * short, what you owe, what you have not seen.
 */
const coverageLegend: CoverageStatus[] = ['mastered', 'stale', 'learning', 'open', 'untested']

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
function CoverageGrid({
  coverage,
  stats,
  confirmHands,
  refreshHands,
  onConfirm,
  onRefresh,
}: CoverageGridProps) {
  const rows = useMemo(() => groupCoverageBySpot(coverage), [coverage])
  const counts: Record<CoverageStatus, number> = {
    mastered: stats.mastered,
    learning: stats.learning,
    open: stats.open,
    untested: stats.untested,
    stale: stats.stale,
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
        {stats.untested === 0 && stats.open === 0 && stats.learning === 0 && stats.stale === 0
          ? demoContent.coverageCompleteNote
          : demoContent.coverageRemainingNote}
      </p>
      <p className="text-xs text-brand-text-secondary mt-1">{demoContent.coverageMasteryNote}</p>
      <p className="text-xs text-brand-text-secondary mt-1">{demoContent.coverageStaleNote}</p>
      <p className="text-xs text-brand-text-secondary mt-1">{demoContent.coverageDeviationNote}</p>

      {confirmHands.length > 0 && (
        <>
          <Button variant="outline" onClick={onConfirm} className="w-full mt-3">
            {demoContent.confirmCta} ({confirmHands.length})
          </Button>
          <p className="text-xs text-brand-text-secondary mt-2">{demoContent.confirmHint}</p>
        </>
      )}

      {refreshHands.length > 0 && (
        <>
          <Button variant="outline" onClick={onRefresh} className="w-full mt-3">
            {demoContent.refreshCta} ({refreshHands.length})
          </Button>
          <p className="text-xs text-brand-text-secondary mt-2">{demoContent.refreshHint}</p>
        </>
      )}
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
    cell.status === 'learning' ? demoContent.coverageLearningRepLabel : null,
    cell.status === 'stale' && cell.daysSinceLastPlayed !== null
      ? `${cell.daysSinceLastPlayed} ${demoContent.coverageStaleDaysLabel}`
      : null,
    // A fresh proof says how long it has left; a review already due says so.
    cell.status === 'mastered' && cell.reviewDueInDays !== null
      ? `${cell.reviewDueInDays} ${demoContent.coverageDueDaysLabel}`
      : null,
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
  const direction = missDirection(row)

  return (
    <li className="flex items-start justify-between gap-3 bg-brand-primary rounded-md px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-brand-text-primary">{row.spot.title}</p>
        <p className="text-xs text-brand-text-secondary">
          vs {row.opponent.shortLabel} &middot; you played {row.chosenLabel}, best is{' '}
          <span className="text-brand-accent font-semibold">{row.bestLabel}</span>
          {direction && ` \u00b7 ${tendencyCopy[direction].label.toLowerCase()}`}
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
  const direction = missDirection(row)

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
              {direction && ` \u00b7 ${tendencyCopy[direction].label.toLowerCase()}`}
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

/**
 * CTA for each queue, reusing the mode picker's own labels so the
 * recommendation and the button it points at read the same.
 */
const planCtas: Record<PlanQueue, string> = {
  untested: demoContent.drillModeLabel,
  open: demoContent.leakModeLabel,
  stale: demoContent.refreshModeLabel,
  learning: demoContent.confirmModeLabel,
  sharpen: demoContent.drillModeLabel,
}

interface NextUpPanelProps {
  plan: TrainingPlan
  onStart: (plan: TrainingPlan) => void
  className?: string
}

/**
 * The one line that answers "what should I train right now".
 *
 * The mode picker below it offers every drill that currently has hands in it,
 * which is up to five buttons for a returning visitor to rank themselves.
 * This ranks them: `planNextSession` names the front of the queue and this
 * renders it as a count, a reason, and the single button that clears it.
 */
function NextUpPanel({ plan, onStart, className = '' }: NextUpPanelProps) {
  /** Null once the grid is clear, which is the one state with no queue to name. */
  const queueLabel =
    plan.queue === 'sharpen' ? null : demoContent.planQueueLabels[plan.queue]

  return (
    <div
      className={`rounded-md border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-brand-accent mb-1">
            {demoContent.planHeading}
          </p>
          {queueLabel === null ? (
            <p className="text-sm text-brand-text-primary">
              <span className="font-semibold">{demoContent.planSharpenLead}</span>{' '}
              <span className="text-brand-text-secondary">{demoContent.planSharpenNote}</span>
            </p>
          ) : (
            <p className="text-sm text-brand-text-primary">
              <span className="font-semibold tabular-nums">{plan.waiting}</span>{' '}
              {pluralPairings(plan.waiting)} {queueLabel}.
            </p>
          )}
        </div>
        <Button size="sm" onClick={() => onStart(plan)} className="shrink-0 whitespace-nowrap">
          {planCtas[plan.queue]}
        </Button>
      </div>
      {/*
        A cleared grid has no queue order to explain, so it says when the next
        proof expires instead. Before mount nothing has aged, so there is no
        date to report and the note is dropped rather than guessed at.
      */}
      {queueLabel === null ? (
        plan.nextReviewInDays !== null && (
          <p className="text-xs text-brand-text-secondary mt-3">
            {demoContent.planNextReviewLabel}{' '}
            <span className="tabular-nums">{plan.nextReviewInDays}</span>{' '}
            {pluralDays(plan.nextReviewInDays)}.
          </p>
        )
      ) : (
        <p className="text-xs text-brand-text-secondary mt-3">{demoContent.planHint}</p>
      )}
    </div>
  )
}

interface ModeOptionProps {
  icon: 'target' | 'dice' | 'refresh' | 'check' | 'clock'
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

/** One chip's worth of coverage: how much of that slice is proven. */
interface FocusCount {
  mastered: number
  total: number
}

interface FocusRowProps {
  heading: string
  hint: string
  /** Focuses to offer, in order. Options with no pairings are dropped. */
  options: DrillFocus[]
  counts: Map<DrillFocus, FocusCount>
  activeFocus: DrillFocus | null
  onSelect: (focus: DrillFocus) => void
}

/** One axis of the focus picker. Street and read chips differ only in copy. */
function FocusRow({ heading, hint, options, counts, activeFocus, onSelect }: FocusRowProps) {
  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-wide text-brand-text-secondary mb-2">{heading}</p>
      <div className="flex flex-wrap gap-2">
        {options
          .filter((option) => counts.has(option))
          .map((option) => {
            const count = counts.get(option)!
            const isActive = activeFocus === option
            const label = option === 'all' ? demoContent.focusAllLabel : focusChipLabel(option)

            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                aria-pressed={isActive}
                aria-label={`${focusLabel(option)}: ${count.mastered} of ${count.total} pairings proven`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                  isActive
                    ? 'bg-brand-accent text-brand-primary border-brand-accent font-semibold'
                    : 'bg-brand-primary text-brand-text-secondary border-transparent hover:border-brand-accent/40'
                }`}
              >
                <span>{label}</span>
                <span className="tabular-nums opacity-80">
                  {count.mastered}/{count.total}
                </span>
              </button>
            )
          })}
      </div>
      <p className="text-xs text-brand-text-secondary mt-2">{hint}</p>
    </div>
  )
}

/** Chips are narrow, so a read wears its short label and a street its name. */
function focusChipLabel(focus: DrillFocus): string {
  if (focus === 'all') return demoContent.focusAllLabel

  return isReadFocus(focus) ? getOpponentProfile(focus).shortLabel : focus
}

interface FocusPickerProps {
  /** The slice the live drill is aimed at, or null when no drill is running. */
  activeFocus: DrillFocus | null
  streetProgress: StreetProgress[]
  readProgress: ReadProgress[]
  coverageStats: CoverageSummary
  onSelect: (focus: DrillFocus) => void
}

/**
 * Aims a drill at one street or one read, dealing immediately on click.
 *
 * Two rows because the grid has two axes, and a drill is aimed down one of
 * them at a time -- picking a read clears a street and the other way round.
 * See `DrillFocus`: a street and a read intersect in too few pairings to fill
 * a drill, so the picker never offers the intersection.
 *
 * The counter on each chip is that slice's proven pairings, so the picker is
 * also the only place the per-street and per-read gaps show up before a visitor
 * has finished a session and opened the recap. Streets with no authored spots
 * and reads with no pairings never reach the summaries, so they are never
 * offered.
 */
function FocusPicker({
  activeFocus,
  streetProgress,
  readProgress,
  coverageStats,
  onSelect,
}: FocusPickerProps) {
  const streetCounts = useMemo(() => {
    const byFocus = new Map<DrillFocus, FocusCount>([
      ['all', { mastered: coverageStats.mastered, total: coverageStats.total }],
    ])

    for (const progress of streetProgress) {
      byFocus.set(progress.street, { mastered: progress.mastered, total: progress.total })
    }

    return byFocus
  }, [coverageStats, streetProgress])

  const readCounts = useMemo(() => {
    const byFocus = new Map<DrillFocus, FocusCount>()

    for (const progress of readProgress) {
      byFocus.set(progress.opponent.id, {
        mastered: progress.mastered,
        total: progress.total,
      })
    }

    return byFocus
  }, [readProgress])

  return (
    <>
      <FocusRow
        heading={demoContent.focusHeading}
        hint={demoContent.focusHint}
        options={drillFocuses}
        counts={streetCounts}
        activeFocus={activeFocus}
        onSelect={onSelect}
      />
      <FocusRow
        heading={demoContent.readFocusHeading}
        hint={demoContent.readFocusHint}
        options={readFocuses}
        counts={readCounts}
        activeFocus={activeFocus}
        onSelect={onSelect}
      />
    </>
  )
}

/**
 * The coverage grid split by street.
 *
 * The whole-grid bar says how much is left to prove; this says which street it
 * is left on, which is the thing that tells a visitor where to aim the next
 * drill.
 */
/**
 * Sessions the log lists before it stops and says how many are behind them.
 *
 * The career card is already long, and the point of the log is the shape of
 * the recent run rather than a full audit of every session storage kept.
 */
const LOG_VISIBLE_SESSIONS = 8

interface TrainingLogPanelProps {
  form: TrainingForm
  className?: string
}

/**
 * The one panel that answers "am I getting better".
 *
 * Every other readout in this card is cumulative: lifetime accuracy, lifetime
 * EV lost, the coverage grid. They all answer "where do I stand", and after a
 * few sessions none of them can move much -- a visitor who has genuinely
 * stopped leaking watches a lifetime percentage crawl.
 *
 * This renders the sessions apart instead: the rolling trend from
 * `summarizeForm` on top, then one row per stored session newest first, so the
 * run reads as a shape rather than an average. Renders nothing before a first
 * session is stored, which is the one state with no form to report.
 *
 * Dates come from the form rather than from a clock read here, so the panel
 * renders undated on the server and fills in its relative dates after mount --
 * the same hydration guard the coverage grid's ageing uses.
 */
function TrainingLogPanel({ form, className = 'mb-6' }: TrainingLogPanelProps) {
  if (form.sessions.length === 0) return null

  const { trend } = form
  const visible = form.sessions.slice(0, LOG_VISIBLE_SESSIONS)
  const hidden = form.sessions.length - visible.length

  return (
    <div className={className}>
      <h4 className="font-semibold text-brand-text-primary mb-1">{demoContent.formHeading}</h4>
      <p className="text-xs text-brand-text-secondary mb-3">{demoContent.formHint}</p>

      <div className="bg-brand-primary rounded-md px-4 py-3 mb-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-brand-text-secondary">{demoContent.formTrendLabel}</span>
          {/*
            Null until there are sessions on both sides of the window. A zero
            there would read as "no change" when the truth is "no comparison".
          */}
          {trend === null ? (
            <span className="text-xs text-brand-text-secondary text-right">
              {demoContent.formFirstSessionsNote}
            </span>
          ) : (
            <span
              className={`text-sm font-semibold tabular-nums shrink-0 ${
                trend > 0
                  ? 'text-green-400'
                  : trend < 0
                    ? 'text-red-400'
                    : 'text-brand-text-secondary'
              }`}
            >
              {trend > 0 ? '+' : ''}
              {trend} pts
            </span>
          )}
        </div>
        {trend !== null && (
          <p className="text-xs text-brand-text-secondary mt-2">
            {demoContent.formRecentLabel}{' '}
            <span className="tabular-nums text-brand-text-primary">{form.recentAccuracy}%</span>{' '}
            over {form.recentSessions} {pluralSessions(form.recentSessions)} &middot;{' '}
            <span className="tabular-nums text-brand-text-primary">{form.previousAccuracy}%</span>{' '}
            over the {form.previousSessions} {pluralSessions(form.previousSessions)}{' '}
            {demoContent.formPreviousLabel}
          </p>
        )}
        <p className="text-xs text-brand-text-secondary mt-2">{demoContent.formTrendNote}</p>
      </div>

      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h5 className="text-sm font-semibold text-brand-text-primary">
          {demoContent.formLogHeading}
        </h5>
        <span className="text-xs tabular-nums text-brand-text-secondary">
          {form.sessions.length}/{MAX_STORED_SESSIONS}
        </span>
      </div>
      <p className="text-xs text-brand-text-secondary mb-3">{demoContent.formLogHint}</p>
      <ul className="space-y-2">
        {visible.map((entry) => (
          <SessionLogItem key={entry.number} entry={entry} />
        ))}
      </ul>
      {hidden > 0 && (
        <p className="text-xs text-brand-text-secondary mt-2">
          <span className="tabular-nums">{hidden}</span> {demoContent.formOlderLabel}
        </p>
      )}
      {form.sessions.length >= MAX_STORED_SESSIONS && (
        <p className="text-xs text-brand-text-secondary mt-2">{demoContent.formCapNote}</p>
      )}
    </div>
  )
}

/** One finished session: which drill dealt it, how it went, and when. */
function SessionLogItem({ entry }: { entry: SessionLogEntry }) {
  const when = formatDaysAgo(entry.daysAgo)

  return (
    <li className="flex items-center gap-3 bg-brand-primary rounded-md px-4 py-3">
      <span className="w-24 shrink-0 text-sm text-brand-text-primary truncate">
        {demoContent.sessionKindLabels[entry.kind]}
      </span>
      <div className="flex-1 bg-brand-surface rounded-full h-2">
        <div
          className="h-2 rounded-full bg-brand-accent"
          style={{ width: `${entry.accuracy}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-brand-text-secondary shrink-0 text-right">
        {entry.optimal}/{entry.answered} {demoContent.formOptimalLabel}
        {entry.evLost > 0 && <span className="text-red-400"> &middot; {formatBb(-entry.evLost)}</span>}
        {/* Dropped on narrow screens rather than wrapping the row onto two lines. */}
        {when && <span className="hidden sm:inline"> &middot; {when}</span>}
      </span>
    </li>
  )
}

interface CoverageSliceRowProps {
  label: string
  /** Width class for the label column; a read's name runs longer than a street. */
  labelWidth?: string
  progress: CoverageSummary
  /** Optional trailing control, such as a drill CTA for this slice. */
  action?: React.ReactNode
}

/**
 * One slice of the coverage grid as a bar plus the counts still owed on it.
 *
 * Shared by the street and read panels, which differ in what the grid is sliced
 * by and whether a drill can be aimed at a row -- not in how a slice reads.
 */
function CoverageSliceRow({
  label,
  labelWidth = 'w-16',
  progress,
  action,
}: CoverageSliceRowProps) {
  return (
    <li className="flex items-center gap-3 bg-brand-primary rounded-md px-4 py-3">
      <span className={`${labelWidth} shrink-0 text-sm text-brand-text-primary`}>{label}</span>
      <div className="flex-1 bg-brand-surface rounded-full h-2">
        <div
          className="h-2 rounded-full bg-brand-accent"
          style={{ width: `${progress.percentMastered}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-brand-text-secondary shrink-0 text-right">
        {progress.mastered}/{progress.total}
        {progress.stale > 0 && (
          <span className="text-brand-accent"> &middot; {progress.stale} due</span>
        )}
        {progress.learning > 0 && (
          <span className="text-brand-accent"> &middot; {progress.learning} once</span>
        )}
        {progress.open > 0 && <span className="text-red-400"> &middot; {progress.open} open</span>}
      </span>
      {action}
    </li>
  )
}

function StreetProgressPanel({ streetProgress }: { streetProgress: StreetProgress[] }) {
  return (
    <div className="mb-6">
      <h4 className="font-semibold text-brand-text-primary mb-1">
        {demoContent.streetProgressHeading}
      </h4>
      <p className="text-xs text-brand-text-secondary mb-3">{demoContent.streetProgressHint}</p>
      <ul className="space-y-2">
        {streetProgress.map((progress) => (
          <CoverageSliceRow
            key={progress.street}
            label={progress.street}
            progress={progress}
          />
        ))}
      </ul>
    </div>
  )
}

interface ReadProgressPanelProps {
  readProgress: ReadProgress[]
  onDrill: (focus: DrillFocus) => void
}

/**
 * The coverage grid split by opponent read, each row aimed at its own drill.
 *
 * The street panel above it answers "where in a hand am I weak"; this answers
 * "who am I weak against", which is the question an exploitative trainer is
 * actually for. It is also the only panel that can show a read a visitor has
 * never faced: the toughest-read callout and the by-read breakdown both rank
 * answers already given, so a read at zero attempts is invisible in them.
 *
 * Every row carries its own CTA because this panel names a gap a drill can be
 * aimed straight at -- the same loop the confirm and review queues close.
 */
function ReadProgressPanel({ readProgress, onDrill }: ReadProgressPanelProps) {
  return (
    <div className="mb-6">
      <h4 className="font-semibold text-brand-text-primary mb-1">
        {demoContent.readProgressHeading}
      </h4>
      <p className="text-xs text-brand-text-secondary mb-3">{demoContent.readProgressHint}</p>
      <ul className="space-y-2">
        {readProgress.map((progress) => (
          <CoverageSliceRow
            key={progress.opponent.id}
            label={progress.opponent.shortLabel}
            labelWidth="w-20"
            progress={progress}
            action={
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 px-2"
                onClick={() => onDrill(progress.opponent.id)}
                aria-label={`${demoContent.readProgressDrillLabel} ${progress.opponent.label}`}
              >
                {demoContent.readProgressDrillCta}
              </Button>
            }
          />
        ))}
      </ul>
    </div>
  )
}

interface TendencyPanelProps {
  tendency: TendencySummary
  /** Pairings still open in the biased direction. Empty hides the drill CTA. */
  drillHands: DealtHand[]
  onRetry: (hands: DealtHand[]) => void
  className?: string
}

/**
 * Diagnoses the shape of a visitor's mistakes rather than their location.
 *
 * The coverage grid and the open-leak list both answer "where do I lose
 * money". Neither can answer "how", and the answer changes the advice
 * completely: two players can own the same leak because one folds every river
 * and the other barrels every river. This is the only panel that separates
 * them.
 *
 * Lives in the career card rather than the session recap because the pattern
 * needs more than five hands to mean anything, and because the recap always
 * renders the career card underneath it -- a session-level copy would say the
 * same thing twice on a visitor's first session.
 *
 * Renders nothing without a miss to diagnose; the career card's no-leaks note
 * already covers that case in its own words.
 */
function TendencyPanel({ tendency, drillHands, onRetry, className = '' }: TendencyPanelProps) {
  if (tendency.missed === 0) return null

  const { passive, aggressive, bias } = tendency
  // Misses always cost EV, so this is only zero when there are none at all.
  const totalEvLost = passive.evLost + aggressive.evLost
  const share = (side: TendencySide) =>
    totalEvLost === 0 ? 0 : Math.round((side.evLost / totalEvLost) * 100)

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h4 className="font-semibold text-brand-text-primary">{demoContent.tendencyHeading}</h4>
        <span
          className="text-sm font-semibold text-brand-accent tabular-nums shrink-0"
          aria-label={`${tendency.missed} of ${tendency.answered} answers left money on the table`}
          title={`${tendency.missed} of ${tendency.answered} answers left money on the table`}
        >
          {tendency.missed}/{tendency.answered}
        </span>
      </div>
      <p className="text-xs text-brand-text-secondary mb-3">{demoContent.tendencyHint}</p>

      <div className="space-y-2 mb-3">
        <TendencySideRow side={passive} share={share(passive)} isBias={bias?.direction === 'passive'} />
        <TendencySideRow
          side={aggressive}
          share={share(aggressive)}
          isBias={bias?.direction === 'aggressive'}
        />
      </div>

      {bias ? (
        <p className="text-sm text-brand-text-secondary mb-3">
          <span className="text-brand-accent font-semibold">{demoContent.tendencyBiasLead}: </span>
          {tendencyCopy[bias.direction].label.toLowerCase()} on{' '}
          <span className="tabular-nums">{bias.mistakes}</span> of{' '}
          <span className="tabular-nums">{tendency.missed}</span> {pluralMisses(tendency.missed)},
          worth{' '}
          <span className="text-red-400 font-semibold tabular-nums">{formatBb(-bias.evLost)}</span>.
        </p>
      ) : (
        <p className="text-sm text-brand-text-secondary mb-3">
          <span className="text-brand-text-primary font-semibold">
            {demoContent.tendencyBalancedHeading}:{' '}
          </span>
          {demoContent.tendencyBalancedNote}
        </p>
      )}

      <h5 className="text-sm font-semibold text-brand-text-primary mb-1">
        {demoContent.tendencyStreetHeading}
      </h5>
      <p className="text-xs text-brand-text-secondary mb-2">{demoContent.tendencyStreetHint}</p>
      <ul className="space-y-2">
        {tendency.byStreet.map((street) => (
          <TendencyStreetItem key={street.street} street={street} />
        ))}
      </ul>

      {bias &&
        (drillHands.length > 0 ? (
          <Button onClick={() => onRetry(drillHands)} className="w-full mt-4">
            {tendencyCopy[bias.direction].drillCta} ({drillHands.length})
          </Button>
        ) : (
          <p className="text-xs text-brand-text-secondary mt-3">
            {demoContent.tendencyDrillClosedNote}
          </p>
        ))}
    </div>
  )
}

interface TendencySideRowProps {
  side: TendencySide
  /** This direction's share of the big blinds lost to misses, 0-100. */
  share: number
  isBias: boolean
}

function TendencySideRow({ side, share, isBias }: TendencySideRowProps) {
  const copy = tendencyCopy[side.direction]

  return (
    <div
      className={`rounded-md px-4 py-3 ${
        isBias ? 'bg-brand-accent/10 border border-brand-accent/40' : 'bg-brand-primary'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="flex items-center gap-2 min-w-0">
          <Icon
            name={copy.icon}
            size="sm"
            className={`shrink-0 ${isBias ? 'text-brand-accent' : 'text-brand-text-secondary'}`}
          />
          <span
            className={`text-sm font-semibold ${
              isBias ? 'text-brand-accent' : 'text-brand-text-primary'
            }`}
          >
            {copy.label}
          </span>
        </span>
        <span className="text-xs text-brand-text-secondary shrink-0">
          <span className="tabular-nums">{side.mistakes}</span> {pluralMisses(side.mistakes)}{' '}
          &middot;{' '}
          <span className={`tabular-nums ${side.evLost > 0 ? 'text-red-400 font-semibold' : ''}`}>
            {formatBb(-side.evLost)}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-brand-surface rounded-full h-2">
          <div
            className={`h-2 rounded-full ${isBias ? 'bg-brand-accent' : 'bg-brand-text-secondary'}`}
            style={{ width: `${share}%` }}
          />
        </div>
        <span className="text-xs text-brand-text-secondary tabular-nums shrink-0 w-10 text-right">
          {share}%
        </span>
      </div>
      <p className="text-xs text-brand-text-secondary mt-2">{copy.note}</p>
    </div>
  )
}

/** One street's split. Named "even both ways" when neither side cost more. */
function TendencyStreetItem({ street }: { street: StreetTendency }) {
  return (
    <li className="flex items-center justify-between gap-3 bg-brand-primary rounded-md px-4 py-3">
      <span className="w-16 shrink-0 text-sm text-brand-text-primary">{street.street}</span>
      <span className="flex-1 min-w-0 text-xs text-brand-text-secondary">
        {street.bias
          ? tendencyCopy[street.bias.direction].label.toLowerCase()
          : demoContent.tendencyStreetBalancedLabel}{' '}
        &middot; <span className="tabular-nums">{street.missed}</span> {pluralMisses(street.missed)}
      </span>
      <span className="text-sm font-semibold text-red-400 tabular-nums shrink-0">
        {formatBb(-street.evLost)}
      </span>
    </li>
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
