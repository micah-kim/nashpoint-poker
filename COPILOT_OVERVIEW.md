
# COPILOT_OVERVIEW.md
Legacy filename from the earlier Copilot workflow.

Current operational instructions live in `AGENTS.md`. Use this file as historical project context, and prefer the current code, `AGENTS.md`, and `README.md` when there is any conflict.

AI agents: reference this file together with `DESIGN_TOKENS.md`, `project-specification.md`, and `ui-wireframes.md` when making product or architecture changes.

---

# ▶ Project Overview
This is a production‑ready Next.js (App Router) + React + TailwindCSS marketing website for a poker training tool POC.

The POC does:
- Introduce the concept
- Describe advantages vs GTO Wizard
- Show UI mockups
- Collect email + optional notes

The POC does NOT implement:
- GTO solver integration
- Full solver AI
- Full authentication
- Training mode
- Real gameplay logic

Those belong to the future tool described inside `system-architecture.md`.

---


---

# ▶ Documentation Update Rules (IMPORTANT)

When you make changes to the codebase, update the relevant project documents to keep everything synchronized.

Follow these rules:

## 1. When changing UI components, layouts, or styling
Update:
- `ui-wireframes.md` (if layout/structure changes)
- `DESIGN_TOKENS.md` (if brand tokens change)
- `COPILOT_OVERVIEW.md` (if component responsibilities shift)

## 2. When changing architecture or project structure
Update:
- `COPILOT_OVERVIEW.md` (directory structure or conventions)
- `system-architecture.md` (if it affects long-term design)
- `project-specification.md` (if functional scope changes)

## 3. When adding new significant features
Update:
- `project-specification.md` (add the feature to scope)
- `ui-wireframes.md` (add UI guidance if applicable)
- `system-architecture.md` (add backend/frontend notes)

## 4. When renaming or moving files
Update:
- `COPILOT_OVERVIEW.md` (update directory map)
- Any document referencing the old path

## 5. When adding or removing design tokens
Update:
- `DESIGN_TOKENS.md`
- `tailwind.config.ts`

---

# ▶ Agent Responsibility
Before completing any task, an agent must:

1. **Ask itself**: Does this change impact internal documentation?
2. **If yes**: Update the relevant `.md` files automatically.
3. **Then**: Perform the code change.
4. **Finally**: Summarize what was updated and why.

This ensures the repo remains self‑documenting and maintainable.

---

# ▶ Tech Stack
- **Next.js App Router**
- **React**
- **TailwindCSS**
- **TypeScript**
- **Vercel ready**

---

# ▶ Directory Structure (historical map; validate against current code)
/app
/api
/waitlist/route.ts      → API route handling name, email, and notes capture
/about/page.tsx
/demo/page.tsx
/early-access/page.tsx
/layout.tsx
/globals.css
/page.tsx                  → Landing page
/components
/Navbar.tsx
/Footer.tsx
/Hero.tsx
/ToolsSection.tsx
/FeatureSection.tsx
/ComparisonSection.tsx
/MockupPanel.tsx
/WaitlistForm.tsx
/LoadingScreen.tsx
/cards, buttons, layout subcomponents...
/lib
validators.ts
utils.ts
/public
/assets
images/logo.png
images/og-image.png

When modifying UI or layout, first consider shared components under `/components`. Avoid duplicating logic or visuals inside each page.

---

# ▶ How This Project Wants Agents to Behave

## 1. **When updating brand colors**
- ONLY change the tokens inside `tailwind.config.ts`
- NEVER update colors inline inside components
- After updating the config, propagate classes if needed (e.g., replacing old utilities)

## 2. **When swapping logos**
Update only:
- `/public/assets/images/logo.png`
- Any component usage that shows the logo (`Navbar`, `Footer`)

Do NOT introduce new file paths unless requested.

## 3. **When modifying layout spacing or typography**
- Add/update Tailwind utility classes
- Follow the rhythm of existing sections
- Use consistent vertical spacing (`py-20`, `py-24`, etc.)

## 4. **When creating new components**
- Place them in `/components`
- Use PascalCase
- Keep them as functional, client components only when necessary
- Avoid inline styling; use Tailwind utilities

## 5. **When editing pages**
- Pages should remain small
- Offload UI into reusable components
- Only pages with forms or API calls should contain logic

---

# ▶ Naming Conventions
- **Components** → PascalCase (`Hero`, `Navbar`, `WaitlistForm`)
- **Component files** → PascalCase (`Navbar.tsx`, `Hero.tsx`, `WaitlistForm.tsx`)
- **Non-component files** (sections, utilities, config, etc.) → kebab-case (`comparison-section.tsx`)
- **Props** → camelCase
- **Tailwind classes** → mobile-first

---

# ▶ How to Apply Large-Scale Changes
When asked to make broad updates:

### ✦ Color theme change
1. Update tokens in `tailwind.config.ts`
2. Update any places using old token names
3. Run through `/components` and `/app` to ensure consistency

### ✦ Logo swap
1. Replace `/public/assets/images/logo.png`
2. Check usage in `Navbar.tsx` and `Footer.tsx`

### ✦ Adjust typography scale
1. Modify classes in `globals.css` if defined
2. Otherwise, update shared components like `Hero` and `FeatureSection`

### ✦ New brand direction
1. Update tokens
2. Update shared components
3. Update layout (global impacts here)

---

This document is the **source of truth** for project behavior and structure.
