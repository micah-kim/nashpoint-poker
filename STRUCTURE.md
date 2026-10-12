# 📁 Project Structure

```
nashpoint-poker/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── next.config.js            # Next.js configuration
│   ├── tailwind.config.ts        # Tailwind CSS config (Design Tokens)
│   ├── postcss.config.js         # PostCSS configuration
│   ├── .eslintrc.json            # ESLint rules
│   └── .gitignore                # Git ignore rules
│
├── 📱 App Directory (Next.js App Router)
│   ├── layout.tsx                # Root layout (Navbar + Footer + SEO)
│   ├── page.tsx                  # Landing page (/)
│   ├── globals.css               # Global styles
│   ├── robots.ts                 # Dynamic robots.txt for SEO
│   ├── sitemap.ts                # Dynamic sitemap.xml for SEO
│   │
│   ├── about/
│   │   └── page.tsx              # About page (/about)
│   │
│   ├── demo/
│   │   └── page.tsx              # Spot trainer page (/demo)
│   │
│   ├── early-access/
│   │   └── page.tsx              # Early access page (/early-access)
│   │
│   └── api/
│       └── waitlist/
│           └── route.ts          # Waitlist API endpoint
│
├── 🧩 Components
│   ├── Navbar.tsx                # Navigation bar (sticky, responsive)
│   ├── Footer.tsx                # Footer with links
│   ├── Hero.tsx                  # Hero section with value prop
│   ├── ToolsSection.tsx          # Tool mockups (Hand Review, Simulation, Quizzes)
│   ├── FeatureSection.tsx        # 4-card feature grid
│   ├── ComparisonSection.tsx     # vs GTO Wizard comparison
│   ├── WaitlistForm.tsx          # Email capture form
│   ├── DemoContent.tsx           # Spot trainer client component
│   ├── JsonLd.tsx                # JSON-LD structured data for SEO
│   │
│   ├── ui/                       # Shared UI primitives
│   │   ├── index.ts              # Export barrel
│   │   ├── Button.tsx            # Reusable button component
│   │   ├── Card.tsx              # Reusable card component
│   │   ├── Badge.tsx             # Reusable badge component
│   │   ├── SectionHeading.tsx    # Reusable section heading
│   │   └── Icon.tsx              # Icon wrapper for Lucide React icons
│   │
│   └── mockups/                  # Interactive mockup components
│       ├── index.ts              # Export barrel
│       ├── HandReviewMockup.tsx  # Hand review demo
│       ├── GameSimulationMockup.tsx  # Game simulation demo
│       └── QuizMockup.tsx        # Quiz demo
│
├── 📚 Lib (Utilities & Content)
│   ├── content.ts                # Centralized marketing copy & data
│   ├── hooks.ts                  # Shared React hooks
│   ├── progress.ts               # localStorage training history, career rollup, session log and form trend
│   ├── spots.ts                  # Hand-authored trainer spots and opponent reads
│   ├── trainer.ts                # Grading, coverage, mastery reps and their expiry, street progress, drill dealing, retry, confirm, review and tendency drills, the next-up recommendation, miss-direction diagnosis, leak tracking, session review
│   └── validation.ts             # Shared waitlist validation
│
├── 📚 Documentation
│   ├── AGENTS.md                 # Codex-first repo guidance
│   ├── README.md                 # Complete project documentation
│   ├── QUICKSTART.md             # Quick start guide
│   ├── PROJECT_COMPLETE.md       # Completion summary
│   ├── COMMANDS.md               # Helpful commands reference
│   ├── DESIGN_TOKENS.md          # Design system reference
│   ├── project-specification.md  # Original requirements
│   ├── system-architecture.md    # Future architecture
│   ├── ui-wireframes.md          # UI wireframes
│   ├── copilot-prompt.md         # Legacy bootstrap prompt
│   ├── COPILOT_OVERVIEW.md       # Legacy Copilot context
│   └── COPILOT_USAGE_GUIDE.md    # Legacy prompt patterns
│
└── 🚫 Generated (not in repo)
    ├── node_modules/             # Dependencies
    ├── .next/                    # Next.js build output
    └── package-lock.json         # Dependency lock file
```

---

## 📄 File Descriptions

### Core Application Files

#### `app/layout.tsx`
- Root layout component
- Wraps all pages
- Includes Navbar and Footer
- Sets up global metadata
- Configures Inter font

#### `app/page.tsx`
- Landing page (/)
- Includes Hero, FeatureSection, ComparisonSection

#### `app/globals.css`
- Tailwind directives
- Global typography styles
- Custom CSS utilities

### Page Routes

#### `app/about/page.tsx`
- Vision and approach
- Problem statement
- Product roadmap
- Solver integration info

#### `app/demo/page.tsx`
- Interactive spot trainer, rendered by `components/DemoContent.tsx`
- Seven hand-authored spots across all four streets and five opponent profiles (`lib/spots.ts`), each spot's actions authored most passive to most aggressive
- Five modes: pick the read yourself, take a dealt drill of up to five spot/read pairings drawn from the gaps in your coverage (`buildCoverageDrill`), drill the leaks still open from earlier visits, confirm the pairings you have answered right exactly once (`buildConfirmDrill`), or review the lines whose proof has expired (`buildRefreshDrill`)
- A drill can be aimed at one street, which deals only that street's pairings (`DrillFocus`)
- Answers are graded client-side against the EV table (`lib/trainer.ts`)
- GTO baseline chart, exploitative adjustment panel, and end-of-session summary
- Session recap replays every graded spot with its biggest leak (`reviewSession`, `findBiggestLeak`)
- Per-read breakdown names the opponent types you lost the most to (`summarizeByOpponent`)
- The recap can re-deal just the hands that gave up EV as a retry drill (`buildRetryDrill`)
- Finished sessions are kept in `localStorage` so a returning visitor still has their leaks (`lib/progress.ts`)
- The career card shows lifetime accuracy, the read that costs the most, leaks closed, and the leaks still open (`summarizeCareer`, `summarizeLeakProgress`)
- A recent-form panel keeps the stored sessions apart: a rolling trend over the last `FORM_WINDOW_SESSIONS` sessions against the window before them, then one row per session newest first with its drill, accuracy bar, EV lost, and how long ago it was (`summarizeForm`). Lifetime accuracy averages over a history that only grows, so this is the only readout that can show improvement
- The coverage grid shows every spot/read pairing as untested, open, stale, learning, or mastered, which is also the order drills deal in (`buildCoverage`, `summarizeCoverage`)
- Mastery takes `MASTERY_REPS` consecutive optimal answers; a pairing clean once but not twice sits in `learning`, which is what the confirm drill deals
- Mastery also expires: a pairing goes `stale` once it has gone unplayed for the window its streak earned (`MASTERY_FRESH_DAYS`, doubling per extra clean rep up to `MASTERY_FRESH_CAP_DAYS`), which is what the review drill deals. Rows are dated from the session that graded them, so only a stored history ages
- A "Next up" banner names the one queue worth clearing -- unseen, open, expired, or a rep short -- and starts the drill that empties it, so five mode buttons collapse to one recommendation (`planNextSession`)
- Per-street progress splits that grid preflop through river, both on the drill chips and in the recap (`summarizeStreets`)
- The career card also diagnoses the direction of the misses -- too passive or too aggressive, overall and per street -- and deals back the open pairings missed that way (`missDirection`, `summarizeTendency`, `buildTendencyDrill`)
- No API calls, no solver dependency, and no account -- history never leaves the browser

#### `app/early-access/page.tsx`
- Waitlist signup form
- Benefits list
- Privacy notice
- Success confirmation

### API Routes

#### `app/api/waitlist/route.ts`
- POST endpoint for name/email signups
- GET endpoint to view waitlist
- Neon-backed storage via `DATABASE_URL`
- Validation and duplicate checking

### Components

#### `components/Navbar.tsx`
- Sticky top navigation
- Responsive mobile menu
- Links to all pages
- Brand logo

#### `components/Footer.tsx`
- Footer with links
- Navigation menu
- CTA to waitlist
- Copyright notice

#### `components/Hero.tsx`
- Clear value proposition headline
- Badge highlighting uniqueness
- CTA buttons (Join Waitlist, See What's Coming)
- Three preview cards for tools with Lucide icons

#### `components/ToolsSection.tsx`
- Three tool showcases with interactive mockups
- Hand Review: Typing animation for AI analysis, rating appears after (scroll-triggered)
- Game Simulation: Static poker table mockup with 4 player types (TAG, LAG, Fish, YOU)
- Spot Quizzes: Submit animation with feedback appearing (scroll-triggered)
- Intersection Observer triggers animations on scroll for Hand Review and Quizzes
- Alternating layout for visual interest

#### `components/FeatureSection.tsx`
- 4-card feature grid
- Icon, title, description for each
- Hover animations
- Responsive layout

#### `components/ComparisonSection.tsx`
- Side-by-side comparison
- PokerAI vs GTO Wizard
- Checkmarks and features
- Highlighted differences

#### `components/WaitlistForm.tsx`
- Name input field
- Email input field
- Optional notes textarea
- Form validation
- Success/error states
- API integration

### Configuration

#### `tailwind.config.ts`
- Custom color palette
- Brand design tokens
- Font configuration
- Content paths

#### `next.config.js`
- Next.js settings
- React strict mode
- Build optimizations

#### `tsconfig.json`
- TypeScript compiler options
- Path aliases (@/*)
- Strict mode enabled

#### `package.json`
- Project dependencies
- Scripts (dev, build, start)
- Metadata

---

## 🎨 Design Token Hierarchy

```
tailwind.config.ts
├── Colors
│   ├── brand-primary      #1A1A1A (charcoal)
│   ├── brand-bg           #121212 (dark background)
│   ├── brand-accent       #C48F56 (warm gold)
│   ├── brand-surface      #1E1E1E (elevated surface)
│   ├── brand-text-primary #F1EEE8 (light text)
│   └── brand-text-secondary #C7C2BA (muted text)
│
└── Fonts
    └── Inter (variable font)
```

---

## 🔄 Data Flow

```
User Form Submission
      ↓
WaitlistForm.tsx (client component)
      ↓
POST /api/waitlist
      ↓
route.ts (validation)
      ↓
In-Memory Array
      ↓
Console Log + JSON Response
      ↓
WaitlistForm (success state)
```

---

## 📱 Page Routes

```
/                    → app/page.tsx (Landing)
/about               → app/about/page.tsx
/demo                → app/demo/page.tsx
/early-access        → app/early-access/page.tsx
/api/waitlist (POST) → app/api/waitlist/route.ts
/api/waitlist (GET)  → app/api/waitlist/route.ts
```

---

## 🎯 Component Usage Map

```
layout.tsx
├── Navbar (all pages)
├── page.tsx (Landing)
│   ├── Hero
│   ├── FeatureSection
│   └── ComparisonSection
├── about/page.tsx
├── demo/page.tsx
├── early-access/page.tsx
│   └── WaitlistForm
└── Footer (all pages)
```

---

## 🚀 Build Process

```
Source Code (.tsx, .ts, .css)
      ↓
TypeScript Compilation
      ↓
Tailwind CSS Processing
      ↓
Next.js Bundling
      ↓
Static Generation
      ↓
Optimized Output (.next/)
      ↓
Vercel Deployment
```

---

**This structure is optimized for:**
✅ Maintainability
✅ Scalability  
✅ Performance
✅ SEO
✅ Developer experience
