
# DESIGN_TOKENS.md
These are the authoritative design tokens for Nash Point.  
Copilot: ALWAYS reference this file before changing any styling.

---

# ▶ Brand Color Palette (Warm, Luxurious, High-Stakes)
Primary (warm black): `#0C0A09`  
Background: `#0A0908`  
Accent (vibrant orange): `#F97316`  
Accent Dark: `#EA580C`  
Accent Gold: `#FBBF24`  
Surface: `#1C1917`  
Surface Elevated: `#292524`  
Border: `#44403C`  
Text Primary: `#FAFAF9`  
Text Secondary: `#A8A29E`

**Brand Philosophy:**
The warm amber and gold colors create a distinctly different feel from competitors:
- Vibrant Orange (energy, action, confidence) = Bold decision-making
- Gold (chips, wealth, premium) = High-stakes success
- Warm black tones = Luxurious casino atmosphere
- High contrast = Professional and easy on the eyes

**Why this palette stands out:**
- Completely different from GTO Wizard's blue/purple scheme
- Evokes high-stakes poker rooms and casino luxury
- Warm colors create excitement and confidence
- Premium feel signals quality training

---

# ▶ Tailwind Tokens (must match tailwind.config.ts)
brand-primary: #0C0A09 (warm black)
brand-bg: #0A0908 (deep warm black)
brand-accent: #F97316 (vibrant orange)
brand-accent-dark: #EA580C (dark orange)
brand-accent-gold: #FBBF24 (bright gold for highlights)
brand-surface: #1C1917 (warm dark surface)
brand-surface-elevated: #292524 (elevated elements)
brand-border: #44403C (warm borders)
brand-text-primary: #FAFAF9 (warm white)
brand-text-secondary: #A8A29E (warm gray)

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