
# DESIGN_TOKENS.md
These are the authoritative design tokens for the POC web app.  
Copilot: ALWAYS reference this file before changing any styling.

---

# ▶ Brand Color Palette (Modern, Tech, Professional)
Primary (navy blue): `#1B3A57`  
Background: `#0F1419`  
Accent (cyan blue): `#00A5E0`  
Accent Dark (navy): `#1B3A57`  
Surface: `#1A2332`  
Text Primary: `#F0F4F8`  
Text Secondary: `#B0BEC5`

---

# ▶ Tailwind Tokens (must match tailwind.config.js)
brand-primary: #1B3A57
brand-bg: #0F1419
brand-accent: #00A5E0
brand-accent-dark: #1B3A57
brand-surface: #1A2332
brand-text-primary: #F0F4F8
brand-text-secondary: #B0BEC5

Copilot:  
When the user asks to “change a color everywhere” — update tokens in `tailwind.config.js` AND reference this file.

---

# ▶ Typography Tokens
- Headlines: `font-bold`, tracking-tight
- Body: `font-light`
- Accent text: `text-brand-accent`

---

# ▶ Logo
Primary logo: `/assets/images/logo.png`  
The logo features "NLR" letters in dark blue (#1B3A57) and bright blue (#00A5E0) with a shattering/particle effect.

Logo is used in:
1. `Navbar.tsx` (height: h-10)
2. `Footer.tsx` (height: h-12)

When updating logo:
1. Replace file at `public/assets/images/logo.png`
2. Maintain aspect ratio in components
3. Ensure sizing remains consistent