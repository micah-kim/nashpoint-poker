
# DESIGN_TOKENS.md
These are the authoritative design tokens for Nash Point.  
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

**Brand Philosophy:**
The navy and cyan colors represent the duality of Nash Point:
- Navy (stable, foundational) = Nash Equilibrium / GTO principles
- Cyan (dynamic, adaptive) = Exploiting human irrationality
- The shattering particle effect in the logo = Breaking rigid theory for practical profit

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

# ▶ Icons (Lucide React)
All icons use Lucide React via the `<Icon>` component in `components/ui/Icon.tsx`.

**Available Icon Names:**
- `search` - Hand Review feature
- `gamepad` - Game Simulation feature
- `help` - Quizzes feature
- `scale` - Nash Equilibrium / Balance
- `brain` - Exploit / Psychology
- `microscope` - Solver / Analysis
- `lightbulb` - Insights / Ideas
- `target` - Opponent Modeling
- `dice` - Randomized Training
- `rocket` - Launch / Start
- `party` - Success / Celebration
- `check` - Checkmarks in lists
- `circle` - Neutral list items

**Icon Sizes:**
- `sm` = 16px
- `md` = 24px (default)
- `lg` = 32px
- `xl` = 48px

**Usage:**
```tsx
import { Icon } from '@/components/ui'
<Icon name="search" size="lg" />
```

---

# ▶ Logo
Primary logo: `/assets/images/logo.png`  
The NLR logo features letters in navy blue (#1B3A57) and cyan blue (#00A5E0) with a shattering/particle effect, symbolizing how Nash Point breaks rigid GTO theory to adapt to human irrationality.

Logo is used in:
1. `Navbar.tsx` (height: h-10)
2. `Footer.tsx` (height: h-12)

When updating logo:
1. Replace file at `public/assets/images/logo.png`
2. Maintain the "shattering" visual metaphor
3. Keep aspect ratio consistent in components

---

# ▶ Brand Name: Nash Point

**Inspired by John Nash:**
- Nash Equilibrium = Foundation of GTO poker
- Nash's understanding of human irrationality = Our exploitative edge
- "Point" = The optimal decision point between theory and reality

**Tagline:** "Where game theory meets human irrationality"