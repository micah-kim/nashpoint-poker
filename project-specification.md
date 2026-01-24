
# Project Specification — Poker Training Web App (POC)

## Goal
Build a production‑ready proof‑of‑concept marketing website for a next‑generation No‑Limit Hold’em training tool.  
The purpose of the POC is to:
- Introduce the product concept  
- Explain competitive advantages vs GTO Wizard  
- Show example mockups of in‑app features  
- Collect user email + optional notes for early access  

This website is NOT the tool itself.  
It is a high‑quality landing site, showing what the full tool will become.

---

## Brand Identity
- Minimalist
- Elegant, warm, masculine  
- Avoid clutter
- Feel modern & premium  
- Color scheme: deep charcoal, warm neutrals, gold/copper accents

---

## Competitive Positioning
Visitors must immediately understand:

**What makes this better than GTO Wizard:**
1. Opponent‑type aware strategy analysis  
2. Not strictly GTO — intelligent deviations based on opponent profiles  
3. Explanation‑driven training (not just charts)  
4. Integration with free API‑based solvers (TexasSolver)

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
  - Scenario input + feedback
  - Randomized training vs opponent types
  - Solver‑backed evaluation using TexasSolver
  - Explain‑the‑why engine

### 2. About / Vision Page (`/about`)
- The problem with current solvers  
- Why the training method is different  
- Future roadmap  
- How TexasSolver integrates (non‑technical explanation)

### 3. Early Access Page (`/early-access`)
- Email input  
- Optional notes/suggestions textarea  
- Submit button  
- Success screen  
- Store form submissions using a simple storage method (choose one):
  - Local JSON file (dev only) OR  
  - Fake in‑memory store OR  
  - POST to an API route that logs to server console  
  (Do **not** build production‑grade auth or a database)

### 4. UI Demo Page (`/demo`)
This is NOT functional.  
It simply **shows** what the real app could look like.

Sections:
- Hand input interface  
- Opponent type selector  
- Example AI commentary block  
- Mock GTO deviation chart  
- No real API calls

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

TexasSolver GitHub repo  
https://github.com/bupticybee/TexasSolver

TexasSolver README  
https://github.com/bupticybee/TexasSolver/blob/master/README.md

---

## Interaction Notes for Copilot
- Always use functional React components  
- Favor Tailwind utility classes  
- Prioritize readability + clean structure  
- Create placeholder mockup images using shadcn/ui cards or simple div blocks  
- Include polished typography and spacing  

---

## Deliverables Copilot Should Produce
- Full Next.js project structure  
- All pages + components listed  
- Tailwind config  
- API route for capturing email/notes (mock storage)  
- Vercel‑ready build  
