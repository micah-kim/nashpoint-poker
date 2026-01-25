# AI Poker Training - POC Website

A production-ready marketing website for a next-generation No-Limit Hold'em training tool. Built with Next.js, React, and Tailwind CSS.

## 🎯 Project Overview

This is a proof-of-concept landing site that:
- Introduces the AI poker training product concept
- Explains competitive advantages vs GTO Wizard
- Shows mockups of in-app features
- Collects user emails for early access waitlist

## 🚀 Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Vercel** (deployment ready)

## 📦 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
ai-gto-poc-website/
├── app/
│   ├── layout.tsx           # Root layout with Navbar & Footer
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Global styles
│   ├── about/
│   │   └── page.tsx         # About/Vision page
│   ├── demo/
│   │   └── page.tsx         # UI Demo (non-functional mockup)
│   ├── early-access/
│   │   └── page.tsx         # Waitlist signup page
│   └── api/
│       └── waitlist/
│           └── route.ts     # Waitlist API endpoint
├── components/
│   ├── Navbar.tsx           # Navigation bar
│   ├── Footer.tsx           # Footer
│   ├── Hero.tsx             # Hero section
│   ├── FeatureSection.tsx   # Feature grid
│   ├── ComparisonSection.tsx # vs GTO Wizard comparison
│   └── WaitlistForm.tsx     # Email capture form
├── tailwind.config.ts       # Tailwind configuration
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies
```

## 🎨 Design System

The site follows a minimalist, warm, masculine brand identity:

- **Primary Color**: Deep charcoal (#1A1A1A)
- **Background**: Dark (#121212)
- **Accent**: Warm gold/copper (#C48F56)
- **Typography**: Inter font family

All design tokens are defined in:
- `tailwind.config.ts`
- `DESIGN_TOKENS.md`

## 📄 Pages

### Landing Page (`/`)
- Hero section with headline and CTA
- Feature grid (4 key features)
- Comparison with GTO Wizard
- Mockup preview

### About Page (`/about`)
- Problem statement
- Our approach (4 key differentiators)
- Product roadmap
- TexasSolver integration explanation

### Demo Page (`/demo`)
- Non-functional UI mockup
- Hand input interface
- Opponent type selector
- Mock AI commentary
- GTO baseline chart
- Exploitative adjustment display

### Early Access Page (`/early-access`)
- Waitlist form (email + optional notes)
- Benefits list
- Success confirmation

## 🔌 API Routes

### POST `/api/waitlist`
Stores waitlist signups in memory (POC only).

**Request:**
```json
{
  "email": "user@example.com",
  "notes": "Optional feedback"
}
```

**Response:**
```json
{
  "message": "Successfully joined the waitlist!",
  "success": true
}
```

### GET `/api/waitlist`
Returns current waitlist count and entries (for debugging).

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Deploy with default settings

Or use Vercel CLI:
```bash
npm install -g vercel
vercel
```

The site is configured to work with zero changes on Vercel.

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## 📝 Notes

- Waitlist data is stored in-memory (resets on server restart)
- For production, integrate a real database or email service
- All mockups are non-functional placeholders
- Mobile-first responsive design

## 📚 Documentation

Additional documentation:
- `DESIGN_TOKENS.md` - Design system reference
- `project-specification.md` - Full project requirements
- `system-architecture.md` - Future tool architecture
- `ui-wireframes.md` - UI wireframe descriptions

## 🔗 References

- [GTO Wizard](https://gtowizard.com) - Competitive reference
- [TexasSolver](https://github.com/bupticybee/TexasSolver) - Open-source GTO solver

## 📄 License

Private project - All rights reserved

---

Built with ♠️ by the PokerAI team
