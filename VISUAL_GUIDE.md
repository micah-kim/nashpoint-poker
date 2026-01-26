# 🎨 Visual Layout Guide

## 🏠 Landing Page (/)

```
┌─────────────────────────────────────────────────────────┐
│  [Logo: PokerAI]    Home | About | Demo | Early Access │ ← Sticky Navbar
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                                                           │
│    AI-Enhanced Poker Training That                       │
│    Learns Your Opponents                                 │
│                                                           │
│    Not just GTO. Strategy that adapts.                   │
│                                                           │
│    [Join the Waitlist]  [See Demo]                       │
│                                                           │
│    ┌───────────────────────────────────────┐             │
│    │                                       │             │
│    │    [Tool Mockup Preview]              │             │ ← Hero Section
│    │                                       │             │
│    └───────────────────────────────────────┘             │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│    Why This Training Tool is Different                   │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │    🎯    │  │    🔬    │  │    💡    │  │    🎲    │ │
│  │ Opponent │  │  Solver  │  │ Explain  │  │Real-World│ │
│  │  Aware   │  │  Backed  │  │the-Why   │  │ Scenario │ │ ← Feature Grid
│  │          │  │          │  │ Training │  │ Analysis │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│    How We Compare to GTO Wizard                          │
│                                                           │
│  ┌────────────────────┐    ┌────────────────────┐       │
│  │   [PokerAI] ✨     │    │  [GTO Wizard]      │       │
│  │                    │    │                    │       │
│  │ ✓ Opponent model   │    │ ○ Balanced only    │       │
│  │ ✓ Exploitative     │    │ ○ Pure GTO         │       │ ← Comparison
│  │ ✓ AI explanations  │    │ ○ Charts only      │       │
│  │ ✓ Free solver      │    │ ○ Paid solver      │       │
│  │ ✓ Random training  │    │ ○ Pre-computed     │       │
│  └────────────────────┘    └────────────────────┘       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [PokerAI Logo]                                          │
│  AI-enhanced poker training                              │
│                                                           │
│  Navigation          Get Updates                         │ ← Footer
│  • Home              Join our waitlist                   │
│  • About             [Join Waitlist]                     │
│  • Demo                                                  │
│  • Early Access                                          │
│                                                           │
│  © 2026 PokerAI. All rights reserved.                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📖 About Page (/about)

```
┌─────────────────────────────────────────────────────────┐
│              The Future of Poker Training                │
│        We're building a smarter way to learn poker       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  The Problem with Current Solvers                        │
│                                                           │
│  Traditional GTO solvers show perfect play...            │
│  But your opponents aren't perfect!                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Why Our Training Method is Different                    │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │ 🎯 Opponent │  │ 💡 Explain- │                       │
│  │  Modeling   │  │   Driven    │                       │
│  └─────────────┘  └─────────────┘                       │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │ 🔬 Solver-  │  │ 🎲 Randomize│                       │
│  │   Backed    │  │   Training  │                       │
│  └─────────────┘  └─────────────┘                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Product Roadmap                                         │
│                                                           │
│  ① Phase 1: Core Training Engine                        │
│  ② Phase 2: Training Modes                              │
│  ③ Phase 3: Advanced Features                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  How Our Solver Integration Works                        │
│                                                           │
│  GTO solver provides baseline strategy →                │
│  AI layer adjusts for opponent type →                   │
│  You get best of both worlds!                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Be Part of the Beta                                     │
│  [Join the Waitlist]                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎮 Demo Page (/demo)

```
┌─────────────────────────────────────────────────────────┐
│                      UI Demo                             │
│  Preview of what the full training tool will look like   │
│  ⚠️ This is a non-functional mockup                      │
└─────────────────────────────────────────────────────────┘

┌──────────────┬──────────────────────────────────────────┐
│              │                                          │
│ Hand Input   │  AI Commentary                           │
│ ┌──────────┐ │  ┌────────────────────────────────────┐ │
│ │ Your Hand│ │  │ With AK on Ks-Qh-7d, you've       │ │
│ │ Ah Kd    │ │  │ flopped top pair...                │ │
│ └──────────┘ │  │                                    │ │
│              │  │ Against a TAG opponent, this is    │ │
│ ┌──────────┐ │  │ a clear value betting situation... │ │
│ │ Board    │ │  │                                    │ │
│ │ Ks Qh 7d │ │  └────────────────────────────────────┘ │
│ └──────────┘ │                                          │
│              │  GTO Baseline Strategy                   │
│ ┌──────────┐ │  ┌────────────────────────────────────┐ │
│ │ Position │ │  │ Bet 2/3 pot  [████████░░] 68%    │ │
│ │ BTN ▼    │ │  │ Check        [███░░░░░░░] 22%    │ │
│ └──────────┘ │  │ Bet 1/3 pot  [██░░░░░░░░] 10%    │ │
│              │  └────────────────────────────────────┘ │
│ ┌──────────┐ │                                          │
│ │ Action   │ │  📊 Exploitative Adjustment vs TAG      │
│ │ SRP ▼    │ │  ┌────────────────────────────────────┐ │
│ └──────────┘ │  │ ▸ Increase bet frequency to 75%   │ │
│              │  │ ▸ TAG under-defends vs c-bets     │ │
│ Opponent Type│  │ ▸ Expected EV gain: +0.12 BB      │ │
│ [TAG]        │  └────────────────────────────────────┘ │
│ [ LAG  ]     │                                          │
│ [Passive]    │                                          │
│ [Micro Reg]  │                                          │
│ [Balanced]   │                                          │
│              │                                          │
│ [Evaluate]   │                                          │
└──────────────┴──────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Want to use the real tool?                              │
│  [Join the Waitlist]                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📧 Early Access Page (/early-access)

```
┌─────────────────────────────────────────────────────────┐
│                   Get Early Access                       │
│  Be among the first to train with AI-enhanced strategy   │
│                                                           │
│  Join our waitlist and we'll notify you when we launch   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Early Access Benefits                                   │
│  ✓ First access to the training platform                │
│  ✓ Special launch pricing                               │
│  ✓ Direct input on feature development                  │
│  ✓ Priority support                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Join the Waitlist                                       │
│                                                           │
│  Email Address *                                         │
│  ┌─────────────────────────────────────┐                │
│  │ you@example.com                     │                │
│  └─────────────────────────────────────┘                │
│                                                           │
│  Notes / Suggestions (optional)                          │
│  ┌─────────────────────────────────────┐                │
│  │ What features are you most          │                │
│  │ interested in?                      │                │
│  │                                     │                │
│  └─────────────────────────────────────┘                │
│                                                           │
│  [Join Waitlist]                                         │
└─────────────────────────────────────────────────────────┘

             (After successful submission)

┌─────────────────────────────────────────────────────────┐
│                       🎉                                 │
│              You're on the list!                         │
│  Successfully joined the waitlist!                       │
│                                                           │
│  Join another email →                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

```
Background:    #121212 ████ Very dark, almost black
Primary:       #1A1A1A ████ Deep charcoal
Surface:       #1E1E1E ████ Elevated dark surface
Accent:        #C48F56 ████ Warm gold/copper
Text Primary:  #F1EEE8 ████ Light cream
Text Secondary:#C7C2BA ████ Muted beige
```

---

## 📱 Responsive Breakpoints

```
Mobile:    < 768px  (stacked layout)
Tablet:    768px+   (2-column)
Desktop:   1024px+  (full layout)
```

---

## ✨ Interactive Elements

**Buttons:**
- Hover: Slight scale + opacity change
- Active: Pressed effect
- Disabled: Reduced opacity

**Cards:**
- Hover: Border glow + lift effect
- Transition: Smooth 200ms

**Navigation:**
- Active page: Accent color
- Hover: Color transition
- Mobile: Slide-down menu

**Form:**
- Focus: Border color change to accent
- Error: Red border + message
- Success: Green checkmark + message

---

This layout creates a **premium, modern, minimalist feel** that aligns with the brand identity.
