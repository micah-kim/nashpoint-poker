'use client'

import { useMemo, useState } from 'react'
import { Badge, Button, Card, Icon, PlayingCard } from '@/components/ui'
import { demoContent } from '@/lib/content'
import { opponentProfiles, spots, type OpponentId } from '@/lib/spots'
import {
  findBiggestLeak,
  getRecommendation,
  gradeAnswer,
  reviewSession,
  summarizeSession,
  type Grade,
  type ReviewRow,
  type Verdict,
} from '@/lib/trainer'

const verdictStyles: Record<Verdict, { container: string; text: string; icon: 'check' | 'target' | 'scale' }> = {
  optimal: { container: 'bg-green-900/30 border-green-600/50', text: 'text-green-400', icon: 'check' },
  close: { container: 'bg-brand-accent/15 border-brand-accent/50', text: 'text-brand-accent', icon: 'target' },
  mistake: { container: 'bg-red-900/30 border-red-600/50', text: 'text-red-400', icon: 'scale' },
}

function formatBb(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)} BB`
}

export default function DemoContent() {
  const [spotIndex, setSpotIndex] = useState(0)
  const [opponentId, setOpponentId] = useState<OpponentId>('tag')
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [history, setHistory] = useState<Grade[]>([])
  const [isFinished, setIsFinished] = useState(false)

  const spot = spots[spotIndex]
  const recommendation = useMemo(() => getRecommendation(spot, opponentId), [spot, opponentId])
  const isLastSpot = spotIndex === spots.length - 1

  const bestRow = recommendation.rows.find((row) => row.isExploitBest)!
  const baselineRow = recommendation.rows.find((row) => row.isBaselineBest)!

  function handleSubmit() {
    if (!selectedActionId || grade) return

    const result = gradeAnswer(spot, opponentId, selectedActionId)
    setGrade(result)
    setHistory((previous) => [...previous, result])
  }

  function handleNext() {
    setSelectedActionId(null)
    setGrade(null)

    if (isLastSpot) {
      setIsFinished(true)
      return
    }

    setSpotIndex((index) => index + 1)
  }

  function handleRestart() {
    setSpotIndex(0)
    setSelectedActionId(null)
    setGrade(null)
    setHistory([])
    setIsFinished(false)
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

        {isFinished ? (
          <SessionSummaryPanel grades={history} onRestart={handleRestart} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - the spot and the read */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-brand-text-primary">The Spot</h2>
                  <span className="text-xs text-brand-text-secondary">
                    Spot {spotIndex + 1}/{spots.length}
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
                  {demoContent.opponentHeading}
                </h2>
                <p className="text-xs text-brand-text-secondary mb-4">{demoContent.opponentHint}</p>
                <div className="space-y-2">
                  {opponentProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => setOpponentId(profile.id)}
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
  onRestart: () => void
}

function SessionSummaryPanel({ grades, onRestart }: SessionSummaryPanelProps) {
  const summary = useMemo(() => summarizeSession(grades), [grades])
  const review = useMemo(() => reviewSession(grades), [grades])
  const biggestLeak = useMemo(() => findBiggestLeak(review), [review])

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
        <Button variant="outline" onClick={onRestart}>
          {demoContent.restartCta}
        </Button>
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
