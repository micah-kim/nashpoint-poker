
# COPILOT_USAGE_GUIDE.md
This guide teaches how to request changes from Copilot clearly and in a way that uses the project’s architecture and tokens.

---

# ▶ When adjusting colors
Example prompt:

“Copilot, update the accent color to #AA8844. Modify the token in `tailwind.config.js` and ensure all references to `brand-accent` propagate correctly.”

---

# ▶ When replacing the logo
“Copilot, use `/public/assets/new-logo.svg` as the new default logo. Update all components referencing the old logo and keep dimensions consistent.”

---

# ▶ When modifying layout or spacing
“Copilot, adjust the vertical spacing on the landing page to feel more open. Follow the layout rules from `Hero.tsx` and `FeatureSection.tsx`.”

---

# ▶ When adding a new feature section
“Add a new section to the landing page below the Features grid. Use the visual conventions in `FeatureSection.tsx`.”

---

# ▶ When creating or refactoring components
“Extract this repeated markup into a new component named `InfoBlock` under `/components`. Use existing design tokens.”

---

# ▶ When doing large-scale refactors
Reference architecture:

“Copilot, improve the typography scale across all pages by adjusting classes in shared components. Follow DESIGN_TOKENS.md for the palette.”

---

Be explicit, reference the architecture files, and Copilot will follow the project conventions accurately.
