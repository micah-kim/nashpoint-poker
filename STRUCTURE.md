# 📁 Project Structure

```
ai-gto-poc-website/
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
│   ├── layout.tsx                # Root layout (Navbar + Footer wrapper)
│   ├── page.tsx                  # Landing page (/)
│   ├── globals.css               # Global styles
│   │
│   ├── about/
│   │   └── page.tsx              # About page (/about)
│   │
│   ├── demo/
│   │   └── page.tsx              # Demo page (/demo)
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
│   └── hooks.ts                  # Shared React hooks
│
├── 📚 Documentation
│   ├── README.md                 # Complete project documentation
│   ├── QUICKSTART.md             # Quick start guide
│   ├── PROJECT_COMPLETE.md       # Completion summary
│   ├── COMMANDS.md               # Helpful commands reference
│   ├── DESIGN_TOKENS.md          # Design system reference
│   ├── project-specification.md  # Original requirements
│   ├── system-architecture.md    # Future architecture
│   ├── ui-wireframes.md          # UI wireframes
│   ├── copilot-prompt.md         # Build instructions
│   ├── COPILOT_OVERVIEW.md       # Copilot info
│   └── COPILOT_USAGE_GUIDE.md    # Usage guide
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
- Non-functional UI mockup
- Hand input interface
- Opponent type selector
- Mock AI commentary
- GTO strategy charts

#### `app/early-access/page.tsx`
- Waitlist signup form
- Benefits list
- Privacy notice
- Success confirmation

### API Routes

#### `app/api/waitlist/route.ts`
- POST endpoint for email signups
- GET endpoint to view waitlist
- In-memory storage (POC only)
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
