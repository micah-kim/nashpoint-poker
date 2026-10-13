/**
 * Centralized content module for marketing copy and structured data.
 * Edit content here instead of directly in page components.
 */

import type { IconName } from '@/components/ui'

// ============================================================================
// SITE METADATA
// ============================================================================

export const siteConfig = {
  name: 'Nash Point',
  tagline: 'Where game theory meets human irrationality',
  description: 'AI poker training inspired by John Nash. Master GTO principles while exploiting human irrationality.',
}

// ============================================================================
// HERO SECTION
// ============================================================================

export const heroContent = {
  badge: 'The First of Its Kind',
  headline: 'The First Poker Trainer That',
  headlineAccent: 'Blends GTO + Exploits',
  subheadline: 'Stop memorizing charts. Start understanding decisions.',
  description: 'Nash Point uses AI to seamlessly combine game-theory optimal strategies with exploitative adjustments based on your opponents. Review hands, simulate games, and master spots—all with feedback you can actually use.',
  primaryCta: 'Join the Waitlist',
  secondaryCta: "See What's Coming",
}

export const heroTools: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'search',
    title: 'Hand Review',
    description: 'Analyze any hand with AI',
  },
  {
    icon: 'gamepad',
    title: 'Game Simulation',
    description: 'Practice vs AI opponents',
  },
  {
    icon: 'help',
    title: 'Spot Quizzes',
    description: 'Sharpen your decisions',
  },
]

// ============================================================================
// FEATURES SECTION
// ============================================================================

export const featuresContent = {
  title: 'Why Nash Point is Different',
  subtitle: 'Master Nash Equilibrium, then learn when to break it',
}

export const features: { title: string; description: string; icon: IconName }[] = [
  {
    title: 'Nash Equilibrium Foundation',
    description: "Learn GTO principles built on John Nash's game theory. Master the mathematically optimal baseline strategy.",
    icon: 'scale',
  },
  {
    title: 'Exploit Human Irrationality',
    description: 'Understand when and how to deviate from equilibrium based on opponent tendencies and psychological patterns.',
    icon: 'brain',
  },
  {
    title: 'Solver-Backed Accuracy',
    description: 'Built on industry-standard GTO solver technology. Get proven, mathematically accurate solutions.',
    icon: 'microscope',
  },
  {
    title: 'AI-Powered Insights',
    description: 'Not just charts. Understand the reasoning behind every decision with explanations of strategic concepts.',
    icon: 'lightbulb',
  },
]

// ============================================================================
// COMPARISON SECTION
// ============================================================================

export const comparisonContent = {
  title: 'How We Compare to GTO Wizard',
  subtitle: 'Built for the real world, not just theory',
  disclaimer: 'GTO Wizard is a great tool for learning baseline strategy. We build on that foundation to help you win in real games.',
}

export const nashPointFeatures = [
  { text: 'Nash Equilibrium foundation', detail: 'GTO as your baseline' },
  { text: 'Exploit irrationality', detail: 'Profit from human tendencies' },
  { text: 'AI explanations', detail: 'Understand the "why"' },
  { text: 'Open-source solver engine', detail: 'GTO accuracy without expensive subscriptions' },
  { text: 'Opponent modeling', detail: 'Adaptive strategies' },
]

export const competitorFeatures = [
  { text: 'Assumes balanced opponents' },
  { text: 'Pure GTO focus only' },
  { text: 'Chart-based learning with limited context' },
  { text: 'Proprietary solver (paid subscription)' },
  { text: 'Pre-computed solutions' },
]

// ============================================================================
// FINAL CTA (end of homepage)
// ============================================================================

export const finalCtaContent = {
  title: 'Ready to Play Smarter?',
  description: 'Join the waitlist and be the first to train with GTO precision plus real exploitative edges.',
  cta: 'Join the Waitlist',
}

// ============================================================================
// DEMO PAGE (interactive spot trainer)
// ============================================================================

export const demoContent = {
  headline: 'Spot Trainer',
  subheadline: 'Play real spots against five opponent types and see how the right answer moves.',
  badge: 'Interactive preview - a small slice of the full trainer',
  modeHeading: 'How do you want to train?',
  planHeading: 'Next up',
  planHint: 'One recommendation, in the order a drill already deals: pairings you have never seen, then the ones still open, then the proofs that have expired, then the ones you have answered right exactly once.',
  planQueueLabels: {
    untested: 'you have never played',
    open: 'whose last answer still left money on the table',
    stale: 'whose proof has expired',
    learning: 'you have answered right exactly once',
  },
  planPairingLabel: 'pairing',
  planPairingsLabel: 'pairings',
  planSharpenLead: 'Nothing is due.',
  planSharpenNote: 'Every pairing in this demo is proven and still fresh, so there is no queue to clear. A mixed drill now re-deals from the whole grid.',
  planNextReviewLabel: 'Next review in',
  planNextReviewDayLabel: 'day',
  planNextReviewDaysLabel: 'days',
  exploreModeLabel: 'Pick the read',
  exploreModeHint: 'Walk every spot against an opponent you choose. Best for seeing how one read changes the answer.',
  drillModeLabel: 'Deal me a drill',
  drillModeHint: 'Up to five spots paired with a read you do not get to choose, dealt from the pairings you have not proven yet. Best for testing whether you can actually adapt.',
  leakModeLabel: 'Drill my open leaks',
  leakModeHint: 'Only the spot and read pairings you still have not solved, costliest first. Carries over between visits.',
  confirmModeLabel: 'Confirm what I guessed',
  confirmModeHint: 'The pairings you have nailed exactly once. One clean answer out of two to four lines could still have been a guess, so a second rep is what settles it.',
  refreshModeLabel: 'Review what has gone cold',
  refreshModeHint: 'Lines you proved a while ago and have not played since, most faded first. Proving a line once says you knew it that day, not that you still do.',
  modeSwitchNote: 'Switching mode starts a fresh session, and dealing again any time gives you a new set of hands.',
  focusHeading: 'Aim the drill at a street',
  focusHint: 'Picking a street deals straight away from that street only. The counter is how much of it you have proven.',
  focusAllLabel: 'Whole grid',
  focusActiveNote: 'street drill: every hand comes from that street, so a short street deals a short drill.',
  focusStreetLabel: 'Street',
  readFocusHeading: 'Or aim it at one read',
  readFocusHint: 'The other axis of the grid. Picking a read deals every street you have spots on, all against that one opponent, which is the only way to drill adapting to a player rather than to a board.',
  readFocusActiveNote: 'read drill: every hand is against that opponent, across every street.',
  readProgressHeading: 'Where you stand read by read',
  readProgressHint: 'The same coverage grid, split by opponent instead of by street. A read you have never faced looks identical to a solved one everywhere else on this page.',
  readProgressDrillCta: 'Drill',
  readProgressDrillLabel: 'Drill every spot against',
  opponentHeading: 'Who are you up against?',
  opponentHint: 'Switch profiles at any time. The recommended line changes with the read.',
  streetProgressHeading: 'Where you stand street by street',
  streetProgressHint: 'The same coverage grid, split by street. This is the fastest read on which part of your game has never been tested.',
  dealtOpponentHeading: 'The read you were dealt',
  dealtOpponentHint: 'Drill mode picks the opponent. Adapt to it.',
  baselineHeading: 'GTO Baseline Strategy',
  exploitHeading: 'Exploitative Adjustment',
  coachHeading: 'Coach',
  submitCta: 'Lock in my answer',
  nextCta: 'Next spot',
  restartCta: 'Run it again',
  newDrillCta: 'Deal a new drill',
  pickReadCta: 'Pick the read myself',
  retryCta: 'Drill the ones I missed',
  retryAgainCta: 'Run these back',
  retryActiveNote: 'Retry drill: only the hands you gave up EV on, in the order you faced them. Deal a new drill or pick the read to leave it.',
  retryOpponentHeading: 'The read that got you',
  retryOpponentHint: 'Same spot, same read, second look. Get it right this time.',
  confirmOpponentHeading: 'The read you got right once',
  confirmOpponentHint: 'You found this line before. Find it again and the pairing is proven.',
  confirmAgainCta: 'Run the unconfirmed again',
  confirmActiveNote: 'Confirm run: only the pairings you have nailed exactly once, preflop through river. Deal a new drill or pick the read to leave it.',
  confirmCta: 'Confirm these',
  confirmHint: 'Proving a line twice in a row is the difference between knowing it and having guessed it.',
  refreshCta: 'Review the cold ones',
  refreshHint: 'Spaced repetition: each time you re-prove a line it stays proven for twice as long, so the ones you know keep coming back less often.',
  refreshAgainCta: 'Run the cold ones again',
  refreshActiveNote: 'Review run: only the lines whose proof has expired, most faded first. Deal a new drill or pick the read to leave it.',
  refreshOpponentHeading: 'The read you once had',
  refreshOpponentHint: 'You proved this line before. Prove it again and the clock resets.',
  retryHint: 'Leaks close by replaying them, not by reading about them.',
  summaryHeading: 'Session Summary',
  summaryLead: 'This is a sample. The full trainer runs thousands of spots, tracks your leaks, and tells you which ones actually cost you money.',
  careerHeading: 'Your training history',
  careerHint: 'Saved in this browser across visits. No account, and nothing leaves your device.',
  careerWelcomeBack: 'Welcome back',
  careerSpotsLabel: 'Spots played',
  careerAccuracyLabel: 'Lifetime optimal',
  careerEvLabel: 'Lifetime EV lost',
  careerSessionLabel: 'session',
  careerSessionsLabel: 'sessions',
  careerToughestReadLabel: 'Costs you the most',
  careerDueLabel: 'Due for review',
  careerDueNote: 'Lines you proved before and have not played since. Nothing here is costing you EV -- that is what makes them easy to miss.',
  careerClosedLabel: 'Leaks closed',
  careerClosedNote: 'Pairings you gave up EV on once and have since played perfectly. Closing a leak takes one clean answer; proving the pairing on the grid takes two in a row.',
  careerOpenLabel: 'Still open',
  careerOpenNote: 'Every pairing whose latest attempt still left money on the table.',
  careerNoLeaksHeading: 'Nothing still open',
  careerNoLeaksNote: 'Every pairing you have played, the last time you played it, you played right.',
  coverageHeading: 'Your coverage of the grid',
  coverageHint: 'Every spot in this demo against every read. Drill mode deals the gaps first, then the leaks, then the lines due for review, then the pairings you have only answered right once.',
  coverageProgressLabel: 'of the grid proven',
  coverageProvenLabel: 'Proven twice',
  coverageLearningLabel: 'Right once',
  coverageOpenLabel: 'Still open',
  coverageUntestedLabel: 'Not seen yet',
  coverageStaleLabel: 'Due for review',
  coverageRemainingNote: 'Deal a drill and the pairings you have never seen come first, then the ones still open, then the ones due for review, then the ones you have only nailed once.',
  coverageCompleteNote: 'Full coverage: every pairing in this demo found twice in a row, so none of it is down to a lucky guess. Drills now re-deal from the whole grid.',
  coverageMasteryNote: 'A pairing counts as proven once you have found the max-EV line in it twice in a row. One clean answer out of two to four lines could still have been a guess.',
  coverageStaleNote: 'A proof does not last forever. A pairing you have not played for a fortnight comes back up for review, and each extra clean rep doubles how long it stays proven.',
  coverageLearningRepLabel: 'one more clean rep to prove it',
  coverageStaleDaysLabel: 'days since you last played it',
  coverageDueDaysLabel: 'days until review',
  coverageDueNowLabel: 'due for review now',
  coverageSpotColumnLabel: 'Spot',
  coverageDeviationLabel: 'read overrides the baseline',
  coverageDeviationNote: 'Starred pairings are the ones where the read overrides the GTO baseline.',
  formHeading: 'Your recent form',
  formHint: 'Lifetime accuracy averages over a history that only grows, so after a while it stops moving however well you play. This keeps your sessions apart.',
  formTrendLabel: 'Accuracy trend',
  formTrendNote: 'Your most recent sessions against the ones before them, pooled by answer rather than averaged by session, so a two-hand street drill cannot swing it.',
  formFirstSessionsNote: 'Not enough sessions to call a trend. Play a couple more and this compares your recent ones against the ones before them.',
  formRecentLabel: 'Recent',
  formPreviousLabel: 'before',
  formLogHeading: 'Session by session',
  formLogHint: 'Newest first, each one graded on its own. The bar is how much of that session you found the max-EV line in.',
  formTodayLabel: 'today',
  formYesterdayLabel: 'yesterday',
  formDaysAgoLabel: 'days ago',
  formOptimalLabel: 'optimal',
  formOlderLabel: 'older sessions kept but not listed',
  formCapNote: 'This browser keeps your most recent sessions only, so the oldest drops off once you pass the limit.',
  sessionKindLabels: {
    explore: 'Pick the read',
    drill: 'Drill',
    retry: 'Leak retry',
    confirm: 'Confirm',
    refresh: 'Review',
  },
  careerResetCta: 'Reset history',
  reviewHeading: 'Hand-by-hand review',
  reviewHint: 'Every spot you played, what you chose, and what the read said to do.',
  byReadHeading: 'How you handled each read',
  byReadHint: 'The same spot has a different answer against every opponent type. This is where that shows up.',
  byReadDeviationNote: 'required a deviation',
  tendencyHeading: 'Which way you miss',
  tendencyHint: 'Every spot here runs from the most passive line to the most aggressive one, so a wrong answer is wrong in a direction. A pairing list says where you lose money; this says how.',
  tendencyPassiveLabel: 'Too passive',
  tendencyPassiveNote: 'You folded, checked, called, or sized down where a bigger line was the max-EV one.',
  tendencyAggressiveLabel: 'Too aggressive',
  tendencyAggressiveNote: 'You bet, raised, or sized up where a cheaper line was the max-EV one.',
  tendencyBiasLead: 'Your bias',
  tendencyBalancedHeading: 'No clear bias',
  tendencyBalancedNote: 'Your misses cost the same in both directions, so there is no single habit to fix yet. Play more spots and the heavier side will show.',
  tendencyMistakeLabel: 'misses',
  tendencyMistakeSingularLabel: 'miss',
  tendencyStreetHeading: 'Where the bias shows up',
  tendencyStreetHint: 'The same split per street. A bias is usually local: honest preflop, far too passive by the river.',
  tendencyStreetBalancedLabel: 'even both ways',
  tendencyDrillPassiveCta: 'Drill the ones I played too passively',
  tendencyDrillAggressiveCta: 'Drill the ones I played too aggressively',
  tendencyDrillClosedNote: 'Nothing is still open in that direction -- every pairing you missed that way has since been played right. Whatever is left is below.',
  leakHeading: 'Your biggest leak',
  cleanSheetHeading: 'Clean sheet',
  cleanSheetNote: 'You found the max-EV line in every spot -- including the ones where the read overrides the baseline. That is the whole skill.',
  linkCta: 'Try the Spot Trainer',
  ctaTitle: 'Want the full version?',
  ctaDescription: 'Join the waitlist to get hand review, game simulation, and unlimited spot quizzes when we launch.',
  cta: 'Join the Waitlist',
  verdicts: {
    optimal: 'Optimal line',
    close: 'Close - but there is a better line',
    mistake: 'That one costs you',
  },
}

// ============================================================================
// ABOUT PAGE
// ============================================================================

export const aboutContent = {
  headline: 'Inspired by John Nash',
  subheadline: 'Where Nash Equilibrium meets human irrationality',
  nashPointOrigin: {
    title: 'Why "Nash Point"?',
    paragraphs: [
      'John Nash revolutionized game theory with the Nash Equilibrium - the foundation of GTO (Game Theory Optimal) poker strategy.',
      'But Nash also understood something profound: humans are inherently irrational. His own struggles with schizophrenia gave him unique insight into the gap between theoretical perfection and human reality.',
      'Nash Point embodies this duality. We teach you GTO principles as your foundation, then show you how to exploit the inevitable irrationality of your opponents.',
    ],
    tagline: 'Perfect theory. Imperfect opponents. Maximum profit.',
  },
  problem: {
    title: 'The Problem with Current Solvers',
    paragraphs: [
      'Traditional GTO solvers like GTO Wizard are excellent for learning baseline strategy. They show you how to play against perfectly balanced opponents who never make mistakes.',
      "But here's the reality: your opponents aren't perfect.",
      "They over-fold to aggression. They call too wide. They have exploitable tendencies. And if you're only playing pure GTO, you're leaving money on the table.",
    ],
  },
}

export const approachFeatures: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'target',
    title: 'Opponent Modeling',
    description: 'Train against specific opponent types: tight-aggressive, loose-passive, micro-stakes regulars, and more. Learn when to adjust.',
  },
  {
    icon: 'lightbulb',
    title: 'Explanation-Driven',
    description: "Don't just memorize charts. Understand why each decision is optimal with AI-powered explanations of the strategic concepts.",
  },
  {
    icon: 'microscope',
    title: 'Solver-Backed',
    description: 'Powered by open-source GTO solver technology. Get accurate, reliable solutions without expensive subscriptions.',
  },
  {
    icon: 'dice',
    title: 'Randomized Training',
    description: 'Practice with scenarios that mirror real gameplay. Build intuition through spaced repetition and adaptive difficulty.',
  },
]

export const roadmap = [
  {
    phase: 1,
    title: 'Phase 1: Core Training Engine',
    description: 'Hand input, opponent type selection, AI commentary, and GTO solver integration',
    active: true,
  },
  {
    phase: 2,
    title: 'Phase 2: Training Modes',
    description: 'Random scenario generator, progress tracking, and spaced repetition system',
    active: false,
  },
  {
    phase: 3,
    title: 'Phase 3: Advanced Features',
    description: 'Hand history analysis, custom opponent profiles, and performance analytics',
    active: false,
  },
]

// ============================================================================
// EARLY ACCESS PAGE
// ============================================================================

export const earlyAccessContent = {
  title: 'Join the Nash Point Waitlist',
  subtitle: 'Be among the first to master equilibrium and exploit irrationality',
  description: "Join our waitlist and we'll notify you when we launch. Early access members will get exclusive benefits and pricing.",
  privacyNote: "We respect your privacy. Your email will only be used to notify you about product updates. We'll never share your information with third parties.",
}

export const earlyAccessBenefits = [
  'First access to the training platform',
  'Discount launch pricing',
  'Direct input on feature development',
  'Priority support',
]

// ============================================================================
// NAVIGATION
// ============================================================================

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/demo', label: 'Demo' },
  { href: '/early-access', label: 'Early Access' },
]

// ============================================================================
// FOOTER
// ============================================================================

export const footerContent = {
  tagline: 'Where game theory meets human irrationality.',
  copyright: `© ${new Date().getFullYear()} Nash Point. All rights reserved.`,
  ctaTitle: 'Get Updates',
  ctaDescription: 'Join our waitlist to be the first to know when we launch.',
}
