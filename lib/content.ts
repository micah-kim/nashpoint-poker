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
  exploreModeLabel: 'Pick the read',
  exploreModeHint: 'Walk every spot against an opponent you choose. Best for seeing how one read changes the answer.',
  drillModeLabel: 'Deal me a drill',
  drillModeHint: 'Up to five spots paired with a read you do not get to choose, dealt from the pairings you have not proven yet. Best for testing whether you can actually adapt.',
  leakModeLabel: 'Drill my open leaks',
  leakModeHint: 'Only the spot and read pairings you still have not solved, costliest first. Carries over between visits.',
  modeSwitchNote: 'Switching mode starts a fresh session, and dealing again any time gives you a new set of hands.',
  focusHeading: 'Aim the drill at a street',
  focusHint: 'Picking a street deals straight away from that street only. The counter is how much of it you have proven.',
  focusAllLabel: 'Any street',
  focusActiveNote: 'street drill: every hand comes from that street, so a short street deals a short drill.',
  focusStreetLabel: 'Street',
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
  careerClosedLabel: 'Leaks closed',
  careerClosedNote: 'Pairings you gave up EV on once and have since played perfectly.',
  careerOpenLabel: 'Still open',
  careerOpenNote: 'Every pairing whose latest attempt still left money on the table.',
  careerNoLeaksHeading: 'Nothing still open',
  careerNoLeaksNote: 'Every pairing you have played, the last time you played it, you played right.',
  coverageHeading: 'Your coverage of the grid',
  coverageHint: 'Every spot in this demo against every read. Drill mode deals the gaps before it deals anything you have already proven.',
  coverageProgressLabel: 'of the grid proven',
  coverageProvenLabel: 'Proven',
  coverageOpenLabel: 'Still open',
  coverageUntestedLabel: 'Not seen yet',
  coverageRemainingNote: 'Deal a drill and the pairings you have never seen come first, then the ones still open.',
  coverageCompleteNote: 'Full coverage: every pairing in this demo played, and the last time you played each one you played it right. Drills now re-deal from the whole grid.',
  coverageSpotColumnLabel: 'Spot',
  coverageDeviationLabel: 'read overrides the baseline',
  coverageDeviationNote: 'Starred pairings are the ones where the read overrides the GTO baseline.',
  careerTrendLabel: 'This session vs everything before it',
  careerFirstSessionNote: 'First session on the board. Play another to see which way you are trending.',
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
