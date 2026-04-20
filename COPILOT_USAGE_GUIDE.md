
# COPILOT_USAGE_GUIDE.md
Legacy filename from the earlier Copilot workflow.

Use `AGENTS.md` for the current operational guide. This file is still useful as a prompt-pattern reference for repo-specific requests.

---

# ▶ When adjusting colors
Example prompt:

"Codex, update the accent color to #AA8844. Modify the token in `tailwind.config.ts` and ensure all references to `brand-accent` propagate correctly."

---

# ▶ When replacing the logo
"Codex, use `/public/assets/new-logo.svg` as the new default logo. Update all components referencing the old logo and keep dimensions consistent."

---

# ▶ When modifying layout or spacing
"Codex, adjust the vertical spacing on the landing page to feel more open. Follow the layout rules from `Hero.tsx` and `FeatureSection.tsx`."

---

# ▶ When adding a new feature section
“Add a new section to the landing page below the Features grid. Use the visual conventions in `FeatureSection.tsx`.”

---

# ▶ When creating or refactoring components
“Extract this repeated markup into a new component named `InfoBlock` under `/components`. Use existing design tokens.”

---

# ▶ When doing large-scale refactors
Reference architecture:

"Codex, improve the typography scale across all pages by adjusting classes in shared components. Follow DESIGN_TOKENS.md for the palette."

---

Be explicit, reference the architecture files, and Codex will follow the project conventions accurately.
