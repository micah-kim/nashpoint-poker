
# DESIGN_TOKENS.md
These are the authoritative design tokens for the POC web app.  
Copilot: ALWAYS reference this file before changing any styling.

---

# ▶ Brand Color Palette (Warm, Minimal, Masculine)
Primary (charcoal): `#1A1A1A`  
Background: `#121212`  
Accent (warm gold): `#C48F56`  
Surface: `#1E1E1E`  
Text Primary: `#F1EEE8`  
Text Secondary: `#C7C2BA`

---

# ▶ Tailwind Tokens (must match tailwind.config.js)
brand-primary: #1A1A1A
brand-bg: #121212
brand-accent: #C48F56
brand-surface: #1E1E1E
brand-text-primary: #F1EEE8
brand-text-secondary: #C7C2BA

Copilot:  
When the user asks to “change a color everywhere” — update tokens in `tailwind.config.js` AND reference this file.

---

# ▶ Typography Tokens
- Headlines: `font-bold`, tracking-tight
- Body: `font-light`
- Accent text: `text-brand-accent`

---

# ▶ Logo
Primary logo: `/public/assets/logo.svg`  
Dark-mode: `/public/assets/logo-dark.svg`

When updating logo:
1. Overwrite these files
2. Update usage in:
   - `Navbar.tsx`
   - `/app/layout.tsx`
3. Ensure sizing remains consistent (h-8 or h-10)