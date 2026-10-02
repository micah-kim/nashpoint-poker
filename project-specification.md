
# Project Specification — Poker Training Web App (POC)

## Goal
Build a production‑ready proof‑of‑concept marketing website for a next‑generation No‑Limit Hold’em training tool.  
The purpose of the POC is to:
- Introduce the product concept  
- Explain competitive advantages vs GTO Wizard  
- Show example mockups of in‑app features  
- Collect user name, email, and optional notes for early access  

This website is NOT the tool itself.  
It is a high‑quality landing site, showing what the full tool will become.

---

## Brand Identity
- Minimalist
- Modern, tech-forward, professional  
- Avoid clutter
- Feel modern & premium  
- Color scheme: warm black backgrounds, vibrant orange accents (#F97316), and gold highlights (#FBBF24)
- Premium, high-stakes poker atmosphere rather than a generic solver aesthetic

---

## Competitive Positioning
Visitors must immediately understand:

**What makes this better than GTO Wizard:**
1. Opponent‑type aware strategy analysis  
2. Not strictly GTO — intelligent deviations based on opponent profiles  
3. Explanation‑driven training (not just charts)  
4. Integration with open-source GTO solver technology

---

## Tech Stack Requirements
- **Next.js (latest App Router)**
- **React**
- **TailwindCSS**
- TypeScript
- Mobile‑first responsive design
- Deployable to Vercel
- Clean, modular components
- Reusable UI folder

---

## Pages to Build

### 1. Landing Page (`/`)
- Hero section with bold headline  
- One‑sentence value prop  
- Mockup images of tool UI  
- CTA: “Join the Waitlist”  
- Sub‑section describing how this tool differs from GTO Wizard  
- Feature previews:
  - Hand Review tool mockup
  - Game Simulation tool mockup
  - Spot Quiz tool mockup
  - Clear explanation of GTO + exploitative combination

### 2. About / Vision Page (`/about`)
- The problem with current solvers  
- Why the training method is different  
- Future roadmap  
- How solver integration works (non‑technical explanation)

### 3. Early Access Page (`/early-access`)
- Name input
- Email input  
- Optional notes/suggestions textarea  
- Submit button  
- Success screen  
- **Storage:** Neon Postgres database with `@neondatabase/serverless` driver
- Features: duplicate prevention, timestamps, persistent storage

### 4. Spot Trainer Demo (`/demo`)
A playable slice of the product, running entirely in the browser.

Training modes:
- **Pick the read** - walk the authored spots against an opponent you choose
- **Deal me a drill** - five spot/read pairings you do not get to choose, dealt from the gaps in your coverage: never-seen pairings first, then the ones still open
- **Retry drill** - offered from the recap, replays only the hands that gave up EV
- **Drill my open leaks** - offered once this browser has unsolved pairings, replays the leaks still open across every past visit

Sections:
- Mode selector  
- Spot panel with hole cards, board, and game-state tags  
- Opponent profile selector, or the dealt read in drill mode  
- Action choice, graded against a hand-authored EV table  
- GTO baseline frequency chart plus the exploitative adjustment and its EV gain  
- Session summary with hand-by-hand review, a per-read breakdown, and a biggest-leak callout  
- Retry CTA on the recap that re-deals the missed spot/read pairings  
- Training history card with lifetime accuracy, the read that costs the most, leaks closed, and the leaks still open  
- Coverage grid of every spot against every read, marking what is untested, still open, and proven  
- Waitlist CTA  
- **Data:** static, hand-authored teaching numbers. No solver, no API calls, no backend  
- **Storage:** finished sessions are kept in `localStorage` only. No account, and nothing leaves the device

### 5. Global Navigation + Footer
- Sticky top nav  
- Brand name  
- Links: Home, About, Demo, Early Access  
- Clean simple footer  

---

## Components to Generate
- `<Hero />`
- `<FeatureSection />`
- `<ComparisonSection />` (vs GTO Wizard)
- `<MockupPanel />`
- `<WaitlistForm />`
- `<Layout />`
- `<Navbar />`
- `<Footer />`

---

## Required External Sources
Use for inspiration (NOT copying):

GTO Wizard  
https://gtowizard.com

---

## Implementation Notes for Codex
- Always use functional React components  
- Favor Tailwind utility classes  
- Prioritize readability + clean structure  
- Prefer centralized marketing copy in `lib/content.ts` when changing copy across sections
- Create placeholder mockup images using shadcn/ui cards or simple div blocks  
- Include polished typography and spacing  

---

## Deliverables The Implementation Should Preserve
- Full Next.js project structure  
- All pages + components listed  
- Tailwind config  
- API route for capturing name/email/notes with Neon-backed storage  
- Vercel‑ready build  
